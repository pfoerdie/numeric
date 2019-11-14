const { Point, LineString, Polygon, MultiPolygon, GeometryCollection } = Geometry = require("./Geometry.v2.js");
const geoDataDE = require("./data/germany.low_res.geo.json");
// const geoData = require("./data/countries.low_res.geo.json");

let poly = Geometry.from(geoDataDE.features[0].geometry);
// let poly2 = Polygon.from(geoDataDE.features[0].geometry.coordinates);
// let poly3 = Geometry.from(poly2.toJSON());

// console.log(JSON.stringify(poly, null, 2));

// console.log(poly.valueOf());
// console.log(poly2.valueOf());
// console.log(poly3.valueOf());

// console.log(JSON.stringify(
//     GeometryCollection.from([
//         // Geometry.from(geoDataDE.features[0].geometry),
//         MultiPolygon.from([
//             geoDataDE.features[0].geometry.coordinates
//         ]).toJSON(),
//         Point.from([42, 1]),
//         LineString.from([
//             [1, 3.141],
//             [1337, 69]
//         ])
//     ]),
//     null, 2
// ));

let
    l1 = LineString.from([
        [0, 0],
        [3, 3]
    ]),
    l2 = LineString.from([
        [1, 1],
        [2, 2]
    ]),
    l3 = LineString.from([
        [0, 1],
        [1, 0]
    ]);

console.log(l1.intersects(l2));
console.log(l1.contains(l2));
console.log(l1.intersects(l3));
console.log(l1.intersects(LineString.from([[0, 1], [3, 4]])));