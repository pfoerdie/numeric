const { Point, MultiPoint, Polygon } = Geometry = require("./Geometry.js");
const geoDataDE = require("./data/germany.low_res.geo.json");
// const geoData = require("./data/countries.low_res.geo.json");

// let mp = MultiPoint.from([[1, 2], [5, 6], [-2, 4]]);
// let p = Geometry.from({ type: "Point", coordinates: [1.26, -9.65] });

// console.log(mp);
// console.log(p.toJSON());
// console.log(mp.valueOf());

// let poly = Geometry.from(geoDataDE.features[0].geometry);
let poly2 = Polygon.from(geoDataDE.features[0].geometry.coordinates);
let poly3 = Geometry.from(poly2.toJSON());

// console.log(poly.valueOf());
console.log(poly2.valueOf());
console.log(poly3.valueOf());