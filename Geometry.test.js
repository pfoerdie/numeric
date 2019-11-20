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
        [3, 3]
    ]),
    LS2 = LineString.from([
        [1, 1],
        [2, 2]
    ]),
    LS3 = LineString.from([
        [0, 1, 5, 13],
        [1, 0, 2, -16]
    ]),
    LS4 = LineString.from([
        [0, 1],
        [1, 0]
    ]);

// console.log(JSON.stringify(LS3.coordinates));

// console.log(Pt1.intersects(LS1));
// console.log(LS2.contains(Pt1));
// console.log(LS3.contains(Pt2));

console.log(LS1.intersects(LS4));
console.log(LS1.intersects(LS2));
// console.log(LS1.intersects(LS3));
// console.log(LS2.intersects(LineString.from([[10, 0], [10, 5]])));