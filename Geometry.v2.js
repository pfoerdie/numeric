const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $secret = Symbol(), $class = Symbol(), $components = Symbol();

class Geometry {

    constructor(secret, ...components) {
        _.assert(new.target !== Geometry, "class is abstract");
        _.assert(secret === $secret, "constructor function is private");
        _.assert(components.every(val => val instanceof Geometry || val instanceof Position), "not all geometries or positions");
        _.define(this, $class, new.target);
        _.define(this, $components, components);
    }

    get type() {
        return this[$class].name;
    }

    get coordinates() {
        _.assert(false, "not available here");
    }

    get geometries() {
        _.assert(false, "not available here");
    }

    toJSON() {
        return {
            "type": this.type,
            "coordinates": this.coordinates
        };
    }

    static get Point() { return Point; }
    static get MultiPoint() { return MultiPoint; }
    static get LineString() { return LineString; }
    static get MultiLineString() { return MultiLineString; }
    static get Polygon() { return Polygon; }
    static get MultiPolygon() { return MultiPolygon; }
    static get GeometryCollection() { return GeometryCollection; }

    static from(param) {
        _.assert(_.is.object(param) && _.is.string(param.type), "no valid parameters");
        switch (param.type) {
            case "Point": return Point.from(param.coordinates);
            case "MultiPoint": return MultiPoint.from(param.coordinates);
            case "LineString": return LineString.from(param.coordinates);
            case "MultiLineString": return MultiLineString.from(param.coordinates);
            case "Polygon": return Polygon.from(param.coordinates);
            case "MultiPolygon": return MultiPolygon.from(param.coordinates);
            case "GeometryCollection": return GeometryCollection.from(param.geometries);
            default: throw new Error("not supported type");
        }
    }

    /**
     * Two sets A and B are equal, if for every point a in A and every poin b in B, also a is in B and b is in A.
     * - symmetric
     */
    equals(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A contains a set B, if for every point b in B, also b is in A.
     * If two sets contain each other, they must be equal.
     * - not symmetric
     */
    contains(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A overlaps a set B, if A intersects B but A does not touch B.
     * Also the intersection shall have at least the dimensionality of the minimum dimensionality of the two sets.
     * - symmetric
     */
    overlaps(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A intersects a set B, if there exists a point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of disjoint
     */
    intersects(that) {
        _.assert(false, "not available here");
    }

    /**
     * Two sets are touching, if they intersect and their intersection only includes their boundaries. 
     * Also the tangent vectors of both sets at the point(s) of intersection should point in the same direction. 
     * Also the intersection shall have at least 1 times less dimensionality than the maximum dimensionality of the two sets.
     * - symmetric
     */
    touches(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A is disjoint with a set B, if there exists no point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of intersects
     */
    disjoint(that) {
        return !this.intersects(that);
    }

} // Geometry

class GeometryCollection extends Geometry {

    constructor(...geomArr) {
        super($secret, ...geomArr);
        let valid = [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon];
        _.assert(geomArr.every(comp => valid.some(clss => comp instanceof clss)), "not all valid geometries");
    }

    get geometries() {
        let collection = this[$components].map(geom => geom.toJSON());
        return collection;
    }

    toJSON() {
        return {
            "type": this.type,
            "geometries": this.geometries
        };
    }

    static from(geoms) {
        _.assert(_.is.array(geoms) && geoms.length > 0, "not an array");
        let geomArr = geoms.map(Geometry.from);
        return new GeometryCollection(...geomArr);
    }

} // GeometryCollection

class Position extends Vector {

    constructor(...args) {
        _.assert(args.length === 2 || args.length === 3, "only 2d and 3d vectors allowed");
        _.assert(args.every(_.is.number), "not all numbers");
        super(args.length);
        args.forEach((val, i) => { this[i] = val; });
        // NOTE this.type is not defined as for the geometries
    }

    static from(args) {
        _.assert(_.is.array(args), "not an array");
        return new Position(...args);
    }

} // Position

class Point extends Geometry {

    constructor(pos) {
        _.assert(pos instanceof Position, "not a position");
        super($secret, pos);
    }

    get coordinates() {
        let pos = this[$components][0];
        return Array.from(pos);
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let pos = new Position(...coords);
        return new Point(pos);
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
                let posA = this[$components][0], posB = that[$components][0];
                return posA === posB || Vector.equality(posA, posB);
            default: return that.equals(this);
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": return this.equals(that);
            default: return that.equals(this);
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": return this.equals(that);
            default: return that.overlaps(this);
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": return this.equals(that);
            default: return that.overlaps(this);
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": return false;
            default: return that.touches(this);
        }
    }

} // Point

class MultiPoint extends Geometry {

    constructor(...pointArr) {
        _.assert(pointArr.every(point => point instanceof Point), "not all points");
        _.assert(pointArr.length > 0, "too few points");
        super($secret, ...pointArr);
    }

    get coordinates() {
        let posArr = this[$components].map(point => point.coordinates);
        return posArr;
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let pointArr = coords.map(Point.from);
        return new MultiPoint(...pointArr);
    }

} // MultiPoint

class Line extends Geometry {

    constructor(start, end) {
        _.assert(start instanceof Position && end instanceof Position, "not all positions");
        super($secret, start, end);
    }

    static from() {
        _.assert(false, "not available here");
    }

} // Line

class LineString extends Geometry {

    constructor(...lineArr) {
        _.assert(lineArr.every(line => line instanceof Line), "not all lines");
        _.assert(lineArr.length > 0, "too few lines");
        _.assert(lineArr.every((line, i) => i === 0 || line[$components][0] === lineArr[i - 1][$components][1]), "lines does not match up");
        super($secret, ...lineArr);
        // NOTE positions are not available right now
    }

    get coordinates() {
        let lineArr = this[$components];
        let posArr = lineArr.map(line => line[$components][0]);
        posArr.push(lineArr[lineArr.length - 1][$components][1]);
        return posArr;
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let posArr = coords.map(Position.from);
        let lineArr = posArr.slice(1).map((pos, i) => new Line(posArr[i], pos));
        return new LineString(...lineArr);
    }

} // LineString

class MultiLineString extends Geometry {

    constructor(...lineStrArr) {
        _.assert(lineStrArr.every(lineStr => lineStr instanceof LineString), "not all linestrings");
        super($secret, ...lineStrArr);
    }

    get coordinates() {
        let lineArr = this[$components].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let lineStrArr = coords.map(LineString.from);
        return new MultiLineString(...lineStrArr);
    }

} // MultiLineString

class LinearRing extends LineString {

    constructor(...lineArr) {
        super(...lineArr);
        _.assert(lineArr.length > 2, "too few lines");
        _.assert(lineArr[0][$components][0] === lineArr[lineArr.length - 1][$components][1], "the end does not match the beginning");
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let posArr = coords.map(Position.from);
        _.assert(Vector.equality(posArr[0], posArr[posArr.length - 1]), "the end does not match the beginning");
        posArr[posArr.length - 1] = posArr[0];
        let lineArr = posArr.slice(1).map((pos, i) => new Line(posArr[i], pos));
        return new LinearRing(...lineArr);
    }

} // LinearRing

class Polygon extends Geometry {

    constructor(...ringArr) {
        _.assert(ringArr.every(ring => ring instanceof LinearRing), "not all linearrings");
        super($secret, ...ringArr);
    }

    get coordinates() {
        let lineArr = this[$components].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let ringArr = coords.map(LinearRing.from);
        return new Polygon(...ringArr);
    }

} // Polygon

class MultiPolygon extends Geometry {

    constructor(...polyArr) {
        _.assert(polyArr.every(poly => poly instanceof Polygon), "not all polygons");
        super($secret, ...pointArr);
    }

    get coordinates() {
        let polyArr = this[$components].map(poly => poly.coordinates);
        return polyArr;
    }

    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let polyArr = coords.map(Polygon.from);
        return new MultiPolygon(...polyArr);
    }

} // MultiPolygon

module.exports = Geometry;