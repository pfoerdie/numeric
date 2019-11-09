const _ = require("./tools.js");
const Vector = require("./Vector.js");
const $secret = Symbol(), $components = Symbol(), $positions = Symbol();

class Geometry {

    constructor(secret, ...components) {
        _.assert(new.target !== Geometry, "class is abstract");
        _.assert(secret === $secret, "constructor function is private");
        _.assert(components.every(val => val instanceof Geometry || val instanceof Position), "not all geometries or positions");
        _.define(this, "type", new.target.name);
        _.define(this, $components, components);
    }

    static from() {
        // TODO for all of them
    }

    static get Point() { return Point; }
    static get MultiPoint() { return MultiPoint; }
    static get LineString() { return LineString; }
    static get MultiLineString() { return MultiLineString; }
    static get Polygon() { return Polygon; }
    static get MultiPolygon() { return MultiPolygon; }
    static get GeometryCollection() { return GeometryCollection; }

} // Geometry

class GeometryCollection extends Geometry {

    constructor(...components) {
        super($secret, ...components);
        let valid = [Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon];
        _.assert(components.every(comp => valid.some(clss => comp instanceof clss)), "not all geometries");
    }

} // GeometryCollection

class Position extends Vector {

    constructor(...args) {
        super(...args);
        _.assert(this.length === 2 || this.length === 3, "only 2d and 3d vectors allowed");
        // NOTE this.type is not defined as for the geometries
    }

} // Position

class Point extends Geometry {

    constructor(pos) {
        _.assert(pos instanceof Position, "not a position");
        super($secret, pos);
    }

} // Point

class MultiPoint extends Geometry {

    constructor(...pointArr) {
        _.assert(pointArr.every(point => point instanceof Point), "not all points");
        _.assert(pointArr.length > 0, "too few points");
        super($secret, ...pointArr);
    }

} // MultiPoint

class Line extends Geometry {

    constructor(start, end) {
        _.assert(start instanceof Position && end instanceof Position, "not all positions");
        super($secret, start, end);
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

    // IDEA
    // _.assert(posArr.every(pos => pos instanceof Position), "not a position array");
    // let lineArr = posArr.slice(1).map((pos, i) => new Line(posArr[i], pos));
    // _.define(this, $positions, posArr);

} // LineString

class MultiLineString extends Geometry {

    constructor(...lineStrArr) {
        _.assert(lineStrArr.every(lineStr => lineStr instanceof LineString), "not all linestrings");
        super($secret, ...lineStrArr);
    }

} // MultiLineString

class LinearRing extends LineString {

    constructor(...lineArr) {
        super(...lineArr);
        _.assert(lineArr.length > 2, "too few lines");
        _.assert(lineArr[0][$components][0] === lineArr[lineArr.length - 1][$components][1], "the end does not match the beginning");
    }

} // LinearRing

class Polygon extends Geometry {

    constructor(...ringArr) {
        _.assert(ringArr.every(ring => ring instanceof LinearRing), "not all linearrings");
        super($secret, ...ringArr);
    }

} // Polygon

class MultiPolygon extends Geometry {

    constructor(...polyArr) {
        _.assert(polyArr.every(poly => poly instanceof Polygon), "not all polygons");
        super($secret, ...pointArr);
    }

} // MultiPolygon

module.exports = Geometry;