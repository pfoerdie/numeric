const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $ = {
    type: Symbol(),
    data: Symbol()
};

// https://tools.ietf.org/html/rfc7946

class Geometry {

    constructor(data) {
        _.assert(new.target !== Geometry, "abstract class");
        if (new.target === Point) {
            _.assert(data instanceof Vector, "not a vector");
        } else {
            _.assert(_.is.array(data) && data.every(geom => geom instanceof Geometry), "not all geometries");
        }
        _.define(this, $.type, new.target.name);
        _.define(this, $.data, data);
    }

    valueOf() {
        return this[$.data].map(geom => geom.valueOf());
    }

    toJSON() {
        return {
            "type": this[$.type],
            "coordinates": this.valueOf()
        };
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

}

class Point extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.length === 2 || data.length === 3, "invalid length");
    }

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

}

class Polygon extends Geometry {

    constructor(data) {
        super(data);
        _.assert(data.every(geom => geom instanceof LinearRing), "not all linear rings");
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

    static from(param) {
        _.assert(_.is.array(param), "invalid param");
        return new MultiPolygon(param.map(Polygon.from));
    }

}

class GeometryCollection extends Geometry {

    valueOf() {
        return this[$.data].map(geom => geom.toJSON());
    }

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