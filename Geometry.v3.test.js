const Geometry = require("./Geometry.v3.js");
const { Vec2 } = require("./Vector.js");
const geoDataDE = require("./data/germany.low_res.geo.json");
const { Point, LineString, Polygon, MultiPolygon, GeometryCollection } = Geometry;

let
    Pt1 = Point.from([.5, .5]),
    dePg = Geometry.from(geoDataDE.features[0].geometry),
    LS1 = LineString.from([
        [0, 0],
        [3, 3]
    ]),
    LS2 = LineString.from([
        [1, 1],
        [2, 2]
    ]),
    LS3 = LineString.from([
        [0, 1],
        [1, 0]
    ]);

console.log(Pt1.intersects(LS1));
console.log(LS2.contains(Pt1));
console.log(LS3.contains(Pt1));

// console.log(l1.intersects(l2));
// console.log(l1.intersects(l3));
// console.log(l1.intersects(LineString.from([[0, 1], [3, 4]])));