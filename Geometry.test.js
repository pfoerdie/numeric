const Geometry = require("./Geometry.js");
const { Vec2 } = require("./Vector.js");
const geoDataDE = require("./data/germany.low_res.geo.json");
const { Point, LineString, Polygon, MultiPolygon, GeometryCollection } = Geometry;

let
    Pt1 = Point.from([.5, .5]),
    Pt2 = Point.from([.5, .5, 3.5, -2]),
    dePg = Geometry.from(geoDataDE.features[0].geometry),
    LS1 = LineString.from([
        [0, 0],
        [4, 4]
    ]),
    LS2 = LineString.from([
        [1, 1],
        [2, 2]
    ]),
    LS2b = LineString.from([
        [3, 4],
        [4, 5]
    ]),
    LS2c = LineString.from([
        [-1, -1],
        [-2, -2]
    ]),
    LS3 = LineString.from([
        [0, 0, 0],
        [10, 10, 10]
    ]),
    LS4 = LineString.from([
        [0, 1],
        [1, 0]
    ]),
    LS5 = LineString.from([
        [5, 5, 0],
        [5, 5, 10]
    ]);

console.log(JSON.stringify(LS3.coordinates));

console.log(Pt1.intersects(LS1));
console.log(LS2.contains(Pt1));
console.log(LS3.intersects(LS5));
console.log("should be true");
console.log(LS1.intersects(LS2));
console.log(LS2.intersects(LS1));
console.log("\nshould be false");
console.log(LS1.intersects(LS2b));
console.log(LS2b.intersects(LS1));
console.log("\nshould be false");
console.log(LS1.intersects(LS2c));
console.log(LS2c.intersects(LS1));

console.log(LS1.intersects(LS4));
console.log(LS1.intersects(LS2));
// console.log(LS1.intersects(LS3));
console.log(LS2.intersects(LineString.from([[10, 0], [10, 5]])));