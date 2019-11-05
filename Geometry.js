const _ = require("./tools.js");
const { Vec2 } = require("./Vector.js");

class Geometry {

    constructor(coords) {
        _.assert(new.target !== Geometry, "abstract class");
        _.assert((new.target === Point) || (_.is.array(coords) && coords.every(geom => geom instanceof Geometry)), "invalid coords");
        _.define(this, "type", new.target.name);
        _.define(this, "coords", coords);
    }

    get coordinates() {
        return this.coords.map(geom => geom.coordinates);
    }

    toJSON() {
        return {
            type: this.type,
            coordinates: this.coordinates
        };
    }

    toString() {
        return `${this.type}{ ${this.coords.join(", ")} }`;
    }

    static get Point() {
        return Point;
    }

    static get MultiPoint() {
        return MultiPoint;
    }

    // TODO add all getters for the subclasses

    static from(param) {
        _.assert(_.is.object(param) && _.is.string(param.type) && _.is.array(param.coordinates), "invalid param");
        switch (param.type) {
            case "Point": return Point.from(param.coordinates);
            case "MultiPoint": return MultiPoint.from(param.coordinates);
            // TODO add all constructor from the subclasses
            default: throw new Error("type not available");
        }
    }

}

class Point extends Geometry {

    constructor(coords) {
        super(coords);
        _.assert(coords instanceof Vec2, "not a 2d vector");
    }

    get coordinates() {
        return Array.from(this.coords);
    }

    static from(pos) {
        _.assert(_.is.array(pos), "not an array");
        return new Point(Vec2.from(pos));
    }

}

class MultiPoint extends Geometry {

    constructor(coords) {
        super(coords);
        _.assert(coords.every(val => val instanceof Point), "not all points");
    }

    static from(arr) {
        _.assert(_.is.array(arr), "not an array");
        return new MultiPoint(arr.map(Point.from));
    }

}

// TODO add all possible subclasses: https://tools.ietf.org/html/rfc7946

module.exports = Geometry;