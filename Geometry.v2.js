const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $secret = Symbol(), $class = Symbol(), $components = Symbol();

class Geometry {

    /**
     * @param {Symbol} secret 
     * @param {...(Geometry|Position)} components
     * @constructs Geometry
     * @abstract
     * @private
     */
    constructor(secret, ...components) {
        _.assert(new.target !== Geometry, "class is abstract");
        _.assert(secret === $secret, "constructor function is private");
        _.assert(components.every(val => val instanceof Geometry || val instanceof Position), "not all geometries or positions");
        _.define(this, $class, new.target);
        _.define(this, $components, components);
    }

    /** @type {GeoJSON~Geometry#type} */
    get type() {
        return this[$class].name;
    }

    /** @throws {Error} */
    get coordinates() {
        _.assert(false, "not available here");
    }

    /** @throws {Error} */
    get geometries() {
        _.assert(false, "not available here");
    }

    /** @returns {GeoJSON~Geometry} */
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

    /**
     * @param {GeoJSON~Geometry} param 
     * @returns {Geometry}
     */
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
     * @param {Geometry} that 
     * @returns {boolean}
     */
    equals(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A contains a set B, if for every point b in B, also b is in A.
     * If two sets contain each other, they must be equal.
     * - not symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    contains(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A overlaps a set B, if A intersects B but A does not touch B.
     * Also the intersection shall have at least the dimensionality of the minimum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    overlaps(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A intersects a set B, if there exists a point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of disjoint
     * @param {Geometry} that 
     * @returns {boolean}
     */
    intersects(that) {
        _.assert(false, "not available here");
    }

    /**
     * Two sets are touching, if they intersect and their intersection only includes their boundaries. 
     * Also the tangent vectors of both sets at the point(s) of intersection should point in the same direction. 
     * Also the intersection shall have at least 1 times less dimensionality than the maximum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    touches(that) {
        _.assert(false, "not available here");
    }

    /**
     * A set A is disjoint with a set B, if there exists no point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of intersects
     * @param {Geometry} that 
     * @returns {boolean}
     */
    disjoint(that) {
        return !this.intersects(that);
    }

} // Geometry

class GeometryCollection extends Geometry {

    /**
     * @param  {...(Point|MultiPoint|LineString|MultiLineString|Polygon|MultiPolygon)} geomArr 
     * @constructs GeometryCollection
     */
    constructor(...geomArr) {
        super($secret, ...geomArr);
        let valid = [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon];
        _.assert(geomArr.every(comp => valid.some(clss => comp instanceof clss)), "not all valid geometries");
    }

    /** 
     * The value of "geometries" is an array. Each element of this array is a GeoJSON Geometry object.
     * @type {GeoJSON~GeometryCollection#geometries}
     */
    get geometries() {
        let collection = this[$components].map(geom => geom.toJSON());
        return collection;
    }

    /** @returns {GeoJSON~GeometryCollection} */
    toJSON() {
        return {
            "type": this.type,
            "geometries": this.geometries
        };
    }

    /**
     * @param {GeoJSON~GeometryCollection#geometries} geoms 
     * @returns {GeometryCollection}
     */
    static from(geoms) {
        _.assert(_.is.array(geoms) && geoms.length > 0, "not an array");
        let geomArr = geoms.map(Geometry.from);
        return new GeometryCollection(...geomArr);
    }

    equals(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    contains(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    overlaps(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    intersects(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    touches(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

} // GeometryCollection

class Position extends Vector {

    /**
     * @param  {...number} args 
     * @constructs Position
     * @private
     */
    constructor(...args) {
        _.assert(args.length === 2 || args.length === 3, "only 2d and 3d vectors allowed");
        _.assert(args.every(_.is.number), "not all numbers");
        super(args.length);
        args.forEach((val, i) => { this[i] = val; });
    }

    /**
     * @param {GeoJSON~Position} args 
     * @returns {Position}
     */
    static from(args) {
        _.assert(_.is.array(args) || args instanceof Vector, "not an array");
        return new Position(...args);
    }

    equals(that) {
        _.assert(that instanceof Position, "only for positions");
        return this === that || Vector.equality(this, that);
    }

} // Position

class Point extends Geometry {

    /**
     * @param {Position} pos 
     * @constructs Point 
     */
    constructor(pos) {
        _.assert(pos instanceof Position, "not a position");
        super($secret, pos);
    }

    /** 
     * For type "Point", the "coordinates" member is a single position.
     * @type {GeoJSON~Point#coordinates} 
     */
    get coordinates() {
        let pos = this[$components][0];
        return Array.from(pos);
    }

    /**
     * @param {GeoJSON~Point#coordinates} coords 
     * @returns {Point}
     */
    static from(coords) {
        let pos = Position.from(coords);
        return new Point(pos);
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point": // points equal, if there positions equal
                return this[$components][0].equals(that[$components][0]);
            default: // else use symmetry of equals
                return that.equals(this);
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only contain, if they are equal
                return this.equals(that);
            default: // points have no dimensionality, so they have to be equal to contain
                return that.equals(this);
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only overlap, if they are equal
                return this.equals(that);
            default: // else use symmetry of overlaps
                return that.overlaps(this);
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only intersect, if they are equal
                return this.equals(that);
            default: // else use symmetry of intersects
                return that.overlaps(this);
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points can not touch each other, because they immediatly overlap
                return false;
            default: // else use symmetry of touches
                return that.touches(this);
        }
    }

} // Point

class MultiPoint extends Geometry {

    /**
     * @param  {...Point} pointArr 
     * @constructs MultiPoint
     */
    constructor(...pointArr) {
        _.assert(pointArr.every(point => point instanceof Point), "not all points");
        _.assert(pointArr.length > 0, "too few points");
        super($secret, ...pointArr);
    }

    /** 
     * For type "MultiPoint", the "coordinates" member is an array of positions.
     * @type {GeoJSON~MultiPoint#coordinates} 
     */
    get coordinates() {
        let posArr = this[$components].map(point => point.coordinates);
        return posArr;
    }

    /**
     * @param {GeoJSON~MultiPoint#coordinates} coords 
     * @returns {MultiPoint}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let pointArr = coords.map(Point.from);
        return new MultiPoint(...pointArr);
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point": // equals a points, if every component equals that point
                return this[$components].every(thisP => thisP.equals(that));
            case "MultiPoint": // equals if they both contain each other
                return this.contains(that) && that.contains(this);
            default: // else use symmetry of equals
                return that.equals(this);
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if it equals one of this components
                return this[$components].some(thisP => thisP.equals(that));
            case "MultiPoint": // contains multiple points, if it contains them all
                return that[$components].every(thatP => this.contains(thatP));
            default: // points have no dimensionality, so they have to be equal to contain
                return that.equals(this);
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only overlap, if they are contained
                return this.contains(that);
            case "MultiPoint": // because points do not touc heach other, they overlap if they intersect
                return this.intersects(that);
            default: // else use symmetry of overlaps
                return that.overlaps(this);
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points intersect, if they are contained
                return this.contains(that);
            case "MultiPoint": // intersects, if some of its points are contained
                return that[$components].some(thatP => this.contains(thatP));
            default: // else use symmetry of intersects
                return that.intersects(this);
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points do not touch other points
            case "MultiPoint": // or multiple points
                return false;
            default: // else use symmetry of touches
                return that.touches(this);
        }
    }

} // MultiPoint

class Line extends Geometry {

    /**
     * @param {Position} start 
     * @param {Position} end 
     * @constructs Line
     * @private
     */
    constructor(start, end) {
        _.assert(start instanceof Position && end instanceof Position, "not all positions");
        _.assert(!start.equals(end), "line is too short");
        super($secret, start, end);
    }

    /** @throws {Error} */
    static from() {
        _.assert(false, "not available here");
    }

    contains(that) {
        if (that instanceof Line)
            return this.contains(that[$components][0]) && this.contains(that[$components][1]);

        _.assert(that instanceof Position, "onyl for positions");

        let
            thisStart = this[$components][0],
            thisEnd = this[$components][1],
            thisDir = Vector.sum(thisEnd, Vector.negative(thisStart)),
            thatDir = Vector.sum(that, Vector.negative(thisStart)),
            factors = Vector.hadProd(thatDir, Vector.inverse(thisDir));

        factors = factors.map((val, i) => (val < Infinity && val > - Infinity) ? val :
            Math.abs(thisDir[i]) < Number.EPSILON && Math.abs(thatDir[i]) < Number.EPSILON);

        if (factors.some(val => val === false)) return false;
        factors = factors.filter(val => val !== true);

        let average = factors.reduce((acc, val, i) => (i * acc + val) / (i + 1));
        return average + Number.EPSILON >= 0 && average - Number.EPSILON <= 1 &&
            factory.every(val => Math.abs(val - average) < Number.EPSILON);
    }

    intersects(that) {
        _.assert(that instanceof Line, "only for lines");
        let
            thisStart = this[$components][0],
            thisEnd = this[$components][1],
            thisDir = Vector.add(thisEnd, Vector.negative(thisStart)),
            thatStart = that[$components][0],
            thatEnd = that[$components][1],
            thatDir = Vector.add(thatEnd, Vector.negative(thatStart));

        _.assert(false, "not implemented jet"); // TODO
    }

} // Line

class LineString extends Geometry {

    /**
     * @param  {...Line} lineArr 
     * @constructs LineString
     */
    constructor(...lineArr) {
        _.assert(lineArr.every(line => line instanceof Line), "not all lines");
        _.assert(lineArr.length > 0, "too few lines");
        _.assert(lineArr.every((line, i) => i === 0 || line[$components][0] === lineArr[i - 1][$components][1]), "lines does not match up");
        super($secret, ...lineArr);
    }

    /** 
     * For type "LineString", the "coordinates" member is an array of two or more positions.
     * @type {GeoJSON~LineString#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$components];
        let posArr = lineArr.map(line => line[$components][0]);
        posArr.push(lineArr[lineArr.length - 1][$components][1]);
        return posArr;
    }

    /**
     * @param {GeoJSON~LineString#coordinates} coords 
     * @returns {LineString}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let posArr = coords.map(Position.from);
        let lineArr = posArr.slice(1).map((pos, i) => new Line(posArr[i], pos));
        return new LineString(...lineArr);
    }

    equals(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point":
            default:
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if some line contains its position
                return this[$components].some(thisL => thisL.contains(that[$components][0]));
            case "MultiPoint": // contains multiple points, if all of them are contained
                return that[$components].every(thatP => this.contains(thatP));
            case "LineString":
            case "MultiLineString":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    overlaps(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    intersects(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    touches(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

} // LineString

class MultiLineString extends Geometry {

    /**
     * @param  {...LineString} lineStrArr 
     * @constructs MultiLineString
     */
    constructor(...lineStrArr) {
        _.assert(lineStrArr.every(lineStr => lineStr instanceof LineString), "not all linestrings");
        super($secret, ...lineStrArr);
    }

    /** 
     * For type "MultiLineString", the "coordinates" member is an array of LineString coordinate arrays.
     * @type {GeoJSON~MultiLineString#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$components].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    /**
     * @param {GeoJSON~MultiLineString#coordinates} coords 
     * @returns {MultiLineString}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let lineStrArr = coords.map(LineString.from);
        return new MultiLineString(...lineStrArr);
    }

    equals(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point":
            default:
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if some line contains its position
                return this[$components].some(thisLS => thisLS.contains(that));
            case "MultiPoint": // contains multiple points, if all of them are contained
                return that[$components].every(thatP => this.contains(thatP));
            case "LineString":
            case "MultiLineString":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    overlaps(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    intersects(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    touches(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

} // MultiLineString

class LinearRing extends LineString {

    /**
     * @param  {...Line} lineArr 
     * @constructs LinearRing
     * @private
     */
    constructor(...lineArr) {
        super(...lineArr);
        _.assert(lineArr.length > 2, "too few lines");
        _.assert(lineArr[0][$components][0] === lineArr[lineArr.length - 1][$components][1], "the end does not match the beginning");
    }

    /**
     * @param {GeoJSON~LinearRing#coordinates} coords 
     * @returns {LinearRing}
     */
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

    /**
     * @param  {...LinearRing} ringArr 
     * @constructs Polygon
     */
    constructor(...ringArr) {
        _.assert(ringArr.every(ring => ring instanceof LinearRing), "not all linearrings");
        super($secret, ...ringArr);
    }

    /** 
     * For type "Polygon", the "coordinates" member MUST be an array of linear ring coordinate arrays.
     * @type {GeoJSON~Polygon#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$components].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    /**
     * @param {GeoJSON~Polygon#coordinates} coords 
     * @returns {Polygon}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let ringArr = coords.map(LinearRing.from);
        return new Polygon(...ringArr);
    }

    equals(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point":
            default:
        }
    }

    contains(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    overlaps(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    intersects(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    touches(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

} // Polygon

class MultiPolygon extends Geometry {

    /**
     * @param  {...Polygon} polyArr 
     * @constructs MultiPolygon
     */
    constructor(...polyArr) {
        _.assert(polyArr.every(poly => poly instanceof Polygon), "not all polygons");
        super($secret, ...pointArr);
    }

    /** 
     * For type "MultiPolygon", the "coordinates" member is an array of Polygon coordinate arrays.
     * @type {GeoJSON~MultiPolygon#coordinates} 
     */
    get coordinates() {
        let polyArr = this[$components].map(poly => poly.coordinates);
        return polyArr;
    }

    /**
     * @param {GeoJSON~MultiPolygon#coordinates} coords 
     * @returns {MultiPolygon}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let polyArr = coords.map(Polygon.from);
        return new MultiPolygon(...polyArr);
    }

    equals(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point":
            default:
        }
    }

    contains(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    overlaps(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    intersects(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

    touches(that) {
        _.assert(false, "not implemented yet"); // TODO implement
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
        }
    }

} // MultiPolygon

module.exports = Geometry;