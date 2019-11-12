const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $type = Symbol(), $data = Symbol();

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
            _.assert(_.is.array(data) && data.length > 0 && data.every(child => child instanceof Geometry), "not all geometries");
        }
        _.define(this, $type, new.target.name);
        _.define(this, $data, data);
    }

    get length() {
        return this[$data].length;
    }

    get [Symbol.iterator]() {
        return this[$data][Symbol.iterator];
    }

    /**
     * Two sets A and B are equal, if for every point a in A and every poin b in B, also a is in B and b is in A.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     * @interface
     */
    equals(that) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A intersects a set B, if there exists a point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of disjoint
     * @param {Geometry} that 
     * @returns {boolean}
     * @interface
     */
    intersects(that) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A is disjoint with a set B, if there exists no point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of intersects
     * @param {Geometry} that 
     * @returns {boolean}
     */
    disjoint(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        // negate the opposite of disjoint
        return !this.intersects(that);
    }

    /**
     * A set A contains a set B, if for every point b in B, also b is in A.
     * If two sets contain each other, they must be equal.
     * - not symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     * @interface
     */
    contains(that) {
        _.assert(false, "interface not implemented");
    }

    /**
     * Two sets are touching, if they intersect and their intersection only includes their boundaries. 
     * Also the tangent vectors of both sets at the point(s) of intersection should point in the same direction. 
     * Also the intersection shall have at least 1 times less dimensionality than the maximum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     * @interface
     */
    touches(that) {
        _.assert(false, "interface not implemented");
    }

    /**
     * A set A overlaps a set B, if A intersects B but A does not touch B.
     * Also the intersection shall have at least the dimensionality of the minimum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     * @interface
     */
    overlaps(that) {
        _.assert(false, "interface not implemented");
    }

    /**
     * Returns the primitive value, which is a nested array with numbers.
     * @returns {Array<Array<number>>|...}
     */
    valueOf() {
        return this[$data].map(child => child.valueOf());
    }

    /**
     * Returns the geometry in its geojson representation.
     * {@link https://tools.ietf.org/html/rfc7946 The GeoJSON Format}
     * @returns {{type: string, coordinates: Array}}
     */
    toJSON() {
        return {
            "type": this[$type],
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

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // two points equal, if their vectors equal
                if (this === that) return true;
                let thisVec = this[$data];
                let thatVec = that[$data];
                return Vector.equality(thisVec, thatVec);
            case "MultiPoint": // use symmetry of equals for multipoints
                return that.equals(this);
            default: // nothing else equals to a point
                return false;
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // two points intersect, if they are equal
                return this.equals(that);
            default: // else use symmetry of intersects
                return that.intersects(this);
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // a point can only contain itself, if it is equal
                return this.equals(that);
            case "MultiPoint": // it can also contain multipoint, if every part of it is equal to this
                let thatPoints = that[$data];
                return thatPoints.every(p => this.equals(p));
            default: // nothing else can be contained by a point
                return false;
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // a point cannot touch any points
                return false;
            default: // else use symmetry of touches
                return that.touches(this);
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // points overlap, if they are equal
                return this.equals(that);
            default: // else use symmetry of overlaps
                return that.overlaps(this);
        }
    }

    /**
     * Returns the primitive value, which is an array with numbers.
     * @returns {Array<number>}
     */
    valueOf() {
        return this[$data].valueOf();
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new Point(Vector.from(param));
    }

}

class MultiPoint extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(child => child instanceof Point), "not all points");
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // this equals a point, if this contains just that equal point
                let thisPoints = this[$data];
                return thisPoints.length === 1 && thisPoints[0].equals(that);
            case "MultiPoint": // multipoints are equal, if they contain each other
                if (this === that) return true;
                return this.contains(that) && that.contains(this);
            default: // nothing else is equal to points
                return false;
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // a point intersects with this, if it is contained
                return this.contains(that);
            case "MultiPoint": // a multipoint intersects with this, if this contains some of its points
                let thatPoints = that[$data];
                return thatPoints.some(p => this.contains(p));
            default: // else use the symmetry of intersects
                return that.intersects(this);
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // this contains a point, if it is equal to some of this components
                let thisPoints = this[$data];
                return thisPoints.some(p => that.equals(p));
            case "MultiPoint": // this contains a multipoint, if this contains every point of it
                return that[$data].every(p => this.contains(p));
            default: // nothing except point can be contained
                return false;
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // points do not touch other points
            case "MultiPoint": // same with multipoints
                return false;
            default: // else use the symmetry of touches
                return that.touches(this);
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "Point": // a point overlaps this, if it is contained
                return this.contains(that);
            case "MultiPoint": // or intersects for multiple points, because points do not touch each other
                return this.intersects(that);
            default: // else use the symmetry of overlaps
                return that.overlaps(this);
        }
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiPoint(param.map(Point.from));
    }

}

class LineString extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(child => child instanceof Point), "not all points");
        _.assert(data.length >= 2, "too few points");
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            case "LineString": // linestrings are equal, if all points are equal in order or reverse order
                if (this === that) return true;
                let thisPoints = this[$data];
                let thatPoints = that[$data];
                if (thisPoints.length !== thatPoints.length) return false;
                let len = thisPoints.length;
                return thisPoints.every((p, i) => p.equals(thatPoints[i])) ||
                    thisPoints.every((p, i) => p.equals(thatPoints[len - 1 - i]));
            case "MultiLineString": // use symmetry of equals
                return that.equals(this);
            default: // nothing else is equal to a linestring
                return false;
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new LineString(param.map(Point.from));
    }

}

class MultiLineString extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(child => child instanceof LineString), "not all lines");
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            default:
                throw new Error("not implemented");
        }
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
        _.assert(Vector.equality(data[0][$data], data[data.length - 1][$data]), "not a ring");
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
        _.assert(data.every(child => child instanceof LinearRing), "not all linear rings");
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new Polygon(param.map(LinearRing.from));
    }

}

class MultiPolygon extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(child => child instanceof Polygon), "not all polygons");
    }

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            default:
                throw new Error("not implemented");
        }
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiPolygon(param.map(Polygon.from));
    }

}

class GeometryCollection extends Geometry {

    equals(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
            default:
                throw new Error("not implemented");
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
            default:
                throw new Error("not implemented");
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
            default:
                throw new Error("not implemented");
        }
    }

    touches(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
            default:
                throw new Error("not implemented");
        }
    }

    overlaps(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that[$type]) {
            // TODO
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
            default:
                throw new Error("not implemented");
        }
    }

    /**
     * Returns the primitive value, which is an array with geometries.
     * @returns {Array<Geometry>}
     */
    valueOf() {
        return this[$data].map(child => child.toJSON());
    }

    /**
     * Returns the GeometryCollection in its geojson representation.
     * @returns {{type: string, geometries: Array}}
     */
    toJSON() {
        return {
            "type": this[$type],
            "geometries": this.valueOf()
        };
    }

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new GeometryCollection(param.map(Geometry.from));
    }

}

module.exports = Geometry;