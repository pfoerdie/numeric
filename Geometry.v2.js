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
        _.assert(components.every(val => val instanceof Geometry || val instanceof Vector), "not all geometries or vectors");
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
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
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
            case "MultiPoint": // equals multiple points, if it equals them all
            case "GeometryCollection":
                return that[$components].every(thatC => this.equals(thatC));
            default: // points are not equal to anything else
                return false;
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only contain, if they are equal
                return this.equals(that);
            case "MultiPoint": // contains multiple points, if it contains them all
            case "GeometryCollection":
                return that[$components].every(thatC => this.contains(thatC));
            default: // points have no dimensionality, so they cannot contains anything else
                return false;
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
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
                return that.intersects(this);
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points can not touch each other, because they immediatly overlap
            case "MultiPoint":
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
            case "GeometryCollection": // TODO implement
                _.assert(false, "not implemented yet");
            default: // anything else is not equal to this
                return false;
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if it equals one of this components
                return this[$components].some(thisP => thisP.equals(that));
            case "MultiPoint": // contains multiple points, if it contains them all
                return that[$components].every(thatP => this.contains(thatP));
            case "GeometryCollection": // TODO implement
                _.assert(false, "not implemented yet");
            default: // points have no dimensionality, so they cannot contain lines etc
                return false;
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only overlap, if they are contained
                return this.contains(that);
            case "MultiPoint": // because points do not touch each other, they overlap if they intersect
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
        _.assert(false, "disabled"); // TODO enable
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

class Line extends Vector {

    /**
     * @param {Position} start 
     * @param {Position} end 
     * @constructs Line
     * @private
     */
    constructor(start, end) {
        _.assert(start instanceof Position && end instanceof Position, "not all positions");
        _.assert(start.length === end.length, "different length positions");
        _.assert(!start.equals(end), "line is too short");
        super(start.length);
        start.forEach((val, i) => { this[i] = end[i] - start[i]; });
        _.define(this, $components, [start, end]);
    }

    /** @throws {Error} */
    static from() {
        _.assert(false, "not available here");
    }

    equals(that) {
        _.assert(that instanceof Line, "only for lines");
        let [a0, a1] = this[$components], [b0, b1] = that[$components];
        return (this === that)
            || (Vector.equality(a0, b0) && Vector.equality(a1, b1))
            || (Vector.equality(a0, b1) && Vector.equality(a1, b0));
    }

    contains(that) {
        if (that instanceof Line)
            return this.contains(that[$components][0]) && this.contains(that[$components][1]);

        _.assert(that instanceof Position, "onyl for positions");

        let
            as = this[$components][0],
            av = this,
            bv = Vector.sum(that, Vector.negative(as)),
            p = Vector.hadProd(bv, Vector.inverse(av));

        if (p.some((val, i) =>
            (val === -Infinity || val === Infinity) &&
            (Math.abs(av[i]) >= Number.EPSILON || Math.abs(bv[i]) >= Number.EPSILON)
        )) return false;

        p = p.filter(val => val > - Infinity && val < Infinity);
        let avg = p.reduce(
            (acc, val, i) => (i * acc + val) / (i + 1)
        );

        return avg + Number.EPSILON >= 0 && avg - Number.EPSILON <= 1
            && p.every(val => Math.abs(val - avg) < Number.EPSILON);

        // NOTE is this infinity-part necessary?
    }

    intersects(that) {
        _.assert(that instanceof Line, "only for lines");

        let
            as = this[$components][0],
            av = this,
            bs = that[$components][0],
            bv = that;

        let q = ((bs[0] - as[0]) - (bs[1] - as[1]) * (av[0] / av[1])) / ((bv[1]) * (av[0] / av[1]) - (bv[0]));
        if (q === -Infinity || q === Infinity) {
            q = ((bs[1] - as[1]) - (bs[0] - as[0]) * (av[1] / av[0])) / ((bv[0]) * (av[1] / av[0]) - (bv[1]));
        }

        let p = ((bs[0] - as[0]) + q * bv[0]) / (av[0]);
        if (p === -Infinity || p === Infinity) {
            p = ((bs[1] - as[1]) + q * bv[1]) / (av[1]);
        }

        return p + Number.EPSILON >= 0 && p - Number.EPSILON <= 1 && q + Number.EPSILON >= 0 && q - Number.EPSILON <= 1;

        // TODO deviding by zero might become a problem!!
        // NOTE the third component of the position is never used
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
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "LineString": // linestring equal if all their lines equal in order or reverse order
                let len = this[$components].length;
                if (that[$components].length !== len) return false;
                return this[$components].every((thisL, i) => thisL.equals(that[$components][i]))
                    || this[$components].every((thisL, i) => thisL.equals(that[$components][len - 1 - i]));
            // REM linestring can also be equal, if the corners are shifted but stay on the line, currently returns false
            case "MultiLineString":
            case "GeometryCollection": // use symmetry for multilinestring and collections
                return that.equals(this);
            default: // nothing else is equal
                return false;
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if some line contains its position
                let thatP = that[$components][0];
                return this[$components].some(thisL => thisL.contains(thatP));
            case "MultiPoint": // contains multiple points, if all of them are contained
                return that[$components].every(thatP => this.contains(thatP));
            case "LineString":
                return that[$components].every(thatL => this[$components].some(thisL => thisL.contains(thatL)));
            // REM linestrings can also contain, if the corners are shifted but stay on line, currently returns false.
            case "MultiLineString": // multilinestrings are contained, if this contains every part of it (same with collections)
            case "GeometryCollection":
                return that[$components].every(thatC => this.contains(thatC));
            default: // everything else is not contained
                return false;
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only intersect, if they are contained
                return this.contains(that);
            case "MultiPoint": // multi points intersect, if some of them are contained
                return that[$components].some(thatPt => this.contains(thatPt));
            case "LineString": // linestrings intersect, if some of each lines intersects
                return this[$components].some(thisL => that[$components].some(thatL => thisL.intersects(thatL)));
            default: // else use symmetry of intersects
                return that.intersects(this);
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
                let len = this[$components].length;
                return this[$components][0].equals(that[$components][0])
                    || this[$components][len - 1].equals(that[$components][0]);
            case "MultiPoint":
                return that[$components].every(thatP => this.touches(thatP));
            case "LineString": // TODO implement
            case "MultiLineString": // TODO implement
            case "GeometryCollection": // TODO implement
                _.assert(false, "not implemented yet");
            default: // else use symmetry of touches
                return that.touches(this);
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
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "LineString": // equals linestrings, if everyline equals
                return this[$components].every(thisLS => thisLS.equals(that));
            // REM can also equal, if its distributed over the multilinestring, currently returns false
            case "MultiLineString":
                return this.contains(that) && that.contains(this);
            case "GeometryCollection": // use symmetry for collections
                return that.equals(this);
            default: // nothing else is equal
                return false;
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // contains a point, if some line contains its position
                return this[$components].some(thisLS => thisLS.contains(that));
            case "MultiPoint": // contains multiple points, if all of them are contained
                return that[$components].every(thatP => this.contains(thatP));
            case "LineString": // linestrings are contained, if its lines are all contained by one of this linestrings
                return that[$components].every(thatL => this[$components].some(thisLS => thisLS[$components].some(thisL => thisL.intersects(thatL))));
            case "MultiLineString": // multilinestrings are contained, if all its parts art contained
                return that[$components].every(thatLS => this.contains(thatLS));
            case "GeometryCollections":
                _.assert(false, "not implemented yet"); // TODO implement
            default: // nothing else can be contained
                return false;
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point": // points only intersect, if they are contained
                return this.contains(that);
            case "MultiPoint": // multi points intersect, if some of them are contained
                return that[$components].some(thatPt => this.contains(thatPt));
            case "LineString": // linestrings intersect, if they intersects some of this parts
                return this[$components].some(thisLS => thisLS.intersects(that));
            case "MultiLineString":
                return this[$components].some(thisLS => that[$components].some(thatLS => thisLS.intersects(thatLS)));
            case "GeometryCollection": // use symmetry of intersects
                return that.intersects(this);
            default: // else use symmetry of intersects
                return that.intersects(this);
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
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
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Polygon":
            case "MultiPolygon":
            case "GeometryCollection":
                _.assert(false, "not implemented yet"); // TODO implement
            default:
                return false;
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
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
        super($secret, ...polyArr);
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
        _.assert(that instanceof Geometry, "not a geometry");
        if (this === that) return true;
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    contains(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    overlaps(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    intersects(that) {
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

    touches(that) {
        _.assert(false, "disabled"); // TODO enable
        _.assert(that instanceof Geometry, "not a geometry");
        switch (that.type) {
            case "Point":
            default:
                _.assert(false, "not implemented yet"); // TODO implement
        }
    }

} // MultiPolygon

module.exports = Geometry;
