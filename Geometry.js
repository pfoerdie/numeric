const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $ = { type: Symbol(), data: Symbol() };

class Geometry {

    /**
     * Constructs a geometry with given data.
     * @param {Vector|Array<Geometry>} data 
     * @constructs Geometry
     */
    constructor(data) {
        _.assert(new.target !== Geometry, "abstract class");
        if (new.target === Point) {
            _.assert(data instanceof Vector, "not a vector");
        } else {
            _.assert(_.is.array(data) && data.length > 0 && data.every(geom => geom instanceof Geometry), "not all geometries");
        }
        _.define(this, $.type, new.target.name);
        _.define(this, $.data, data);
    }

    /**
     * Two sets A and B are equal, if for every point a in A and every poin b in B, also a is in B and b is in A.
     * - symmetric
     * @param {Geometry} geom 
     * @returns {boolean}
     * @interface
     */
    equals(geom) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A intersects a set B, if there exists a point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of disjoint
     * @param {Geometry} geom 
     * @returns {boolean}
     * @interface
     */
    intersects(geom) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A is disjoint with a set B, if there exists no point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of intersects
     * @param {Geometry} geom 
     * @returns {boolean}
     */
    disjoint(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // negate the opposite of disjoint
        return !this.intersects(geom);
    }

    /**
     * A set A contains a set B, if for every point b in B, also b is in A.
     * If two sets contain each other, they must be equal.
     * - not symmetric
     * @param {Geometry} geom 
     * @returns {boolean}
     * @interface
     */
    contains(geom) {
        _.assert(false, "interface not implemented");
    }

    /**
     * Two sets are touching, if they intersect and their intersection only includes their boundaries. 
     * Also the tangent vectors of both sets at the point(s) of intersection should point in the same direction. 
     * Also the intersection shall have at least 1 times less dimensionality than the maximum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} geom 
     * @returns {boolean}
     * @interface
     */
    touches(geom) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A overlaps a set B, if A intersects B but A does not touch B.
     * Also the intersection shall have at least the dimensionality of the minimum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} geom 
     * @returns {boolean}
     * @interface
     */
    overlaps(geom) {
        _.assert(false, "interface not implemented");
    }

    /**
     * Returns the primitive value, which is a nested array with numbers.
     * @returns {Array<Array<number>>|...}
     */
    valueOf() {
        return this[$.data].map(geom => geom.valueOf());
    }

    /**
     * Returns the geometry in its geojson representation.
     * {@link https://tools.ietf.org/html/rfc7946 The GeoJSON Format}
     * @returns {{type: string, coordinates: Array}}
     */
    toJSON() {
        return {
            "type": this[$.type],
            "coordinates": this.valueOf()
        };
    }

    static from(param) {
        _.assert(_.is.object(param) && _.is.string(param.type) && _.is.array(param.coordinates), "invalid param");
        switch (param.type) {
            case "Point": return Point.from(param.coordinates);
            case "MultiPoint": return MultiPoint.from(param.coordinates);
            case "LineString": return LineString.from(param.coordinates);
            case "MultiLineString": return MultiLineString.from(param.coordinates);
            case "Polygon": return Polygon.from(param.coordinates);
            case "MultiPolygon": return MultiPolygon.from(param.coordinates);
            case "GeometryCollection": return GeometryCollection.from(param.geometries);
            default: throw new Error("type not available");
        }
    }

    static get Point() {
        return Point;
    }

    static get MultiPoint() {
        return MultiPoint;
    }

    static get LineString() {
        return LineString;
    }

    static get MultiLineString() {
        return MultiLineString;
    }

    static get Polygon() {
        return Polygon;
    }

    static get MultiPolygon() {
        return MultiPolygon;
    }

    static get GeometryCollection() {
        return GeometryCollection;
    }

}

class Point extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.length === 2 || data.length === 3, "invalid length");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // two points equal, if their vectors equal
        if (geom instanceof Point) return this === geom || Vector.equality(this[$.data], geom[$.data]);
        // use symmetry of equals for multipoints
        if (geom instanceof MultiPoint) return geom.equals(this);
        // nothing else equals to a point
        return false;
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // two points intersect, if they are equal
        if (geom instanceof Point) return this.equals(geom);
        // else use symmetry of intersects
        return geom.intersects(this);
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // a point can only contain itself, if it is equal
        if (geom instanceof Point) return this.equals(geom);
        // it can also contain multipoint, if every part of it is equal to this
        if (geom instanceof MultiPoint) return geom[$.data].every(p => this.equals(p));
        // nothing else can be contained by a point
        return false;
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // a point cannot touch any points
        if (geom instanceof Point) return false;
        // else use symmetry of touches
        return geom.touches(this);
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // points overlap, if they are equal
        if (geom instanceof Point) return this.equals(geom);
        // else use symmetry of overlaps
        return geom.overlaps(this);
    }

    /**
     * Returns the primitive value, which is an array with numbers.
     * @returns {Array<number>}
     */
    valueOf() {
        return this[$.data].valueOf();
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new Point(Vector.from(param));
    }

}

class MultiPoint extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof Point), "not all points");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // this equals a point, if this contains just that equal point
        if (geom instanceof Point) return this[$.data].length === 1 && this[$.data][0].equals(geom);
        // multipoints are equal, if they contain each other
        if (geom instanceof MultiPoint) return this === geom || this.contains(geom) && geom.contains(this);
        // nothing else is equal to points
        return false;
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // a point intersects with this, if it is contained
        if (geom instanceof Point) return this.contains(geom);
        // a multipoint intersects with this, if this contains some of its points
        if (geom instanceof MultiPoint) return geom[$.data].some(p => this.contains(p));
        // else use the symmetry of intersects
        return geom.intersects(this);
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // this contains a point, if it is equal to some of this components
        if (geom instanceof Point) return this[$.data].some(p => geom.equals(p));
        // this contains a multipoint, if this contains every point of it
        if (geom instanceof MultiPoint) return geom[$.data].every(p => this.contains(p));
        // nothing except point can be contained
        return false;
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // points do not touch other points
        if (geom instanceof Point) return false;
        // same with multipoints
        if (geom instanceof MultiPoint) return false;
        // else use the symmetry of touches
        return geom.touches(this);
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        // a point overlaps this, if it is contained
        if (geom instanceof Point) return this.contains(geom);
        // or intersects for multiple points, because points do not touch each other
        if (geom instanceof MultiPoint) return this.intersects(geom);
        // else use the symmetry of overlaps
        return geom.overlaps(this);
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiPoint(param.map(Point.from));
    }

}

class LineString extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof Point), "not all points");
        _.assert(data.length >= 2, "too few points");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new LineString(param.map(Point.from));
    }

}

class MultiLineString extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof LineString), "not all lines");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiLineString(param.map(LineString.from));
    }

}

class LinearRing extends LineString {

    constructor(data) {
        super(data);
        _.assert(data.length >= 4, "too few points");
        _.assert(Vector.equality(data[0][$.data], data[data.length - 1][$.data]), "not a ring");
        data[data.length - 1] = data[0];
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new LinearRing(param.map(Point.from));
    }

    static get name() {
        return LineString.name;
    }

}

class Polygon extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof LinearRing), "not all linear rings");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new Polygon(param.map(LinearRing.from));
    }

}

class MultiPolygon extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof Polygon), "not all polygons");
    }

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiPolygon(param.map(Polygon.from));
    }

}

class GeometryCollection extends Geometry {

    equals(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    intersects(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    contains(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    touches(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    overlaps(geom) {
        _.assert(geom instanceof Geometry, "not a geometry");
        throw new Error("not implemented");
        // TODO operator
    }

    /**
     * Returns the primitive value, which is an array with geometries.
     * @returns {Array<Geometry>}
     */
    valueOf() {
        return this[$.data].map(geom => geom.toJSON());
    }

    /**
     * Returns the GeometryCollection in its geojson representation.
     * @returns {{type: string, geometries: Array}}
     */
    toJSON() {
        return {
            "type": this[$.type],
            "geometries": this.valueOf()
        };
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new GeometryCollection(param.map(Geometry.from));
    }

}

module.exports = Geometry;