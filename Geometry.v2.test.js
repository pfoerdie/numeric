const { Point, MultiPoint, Polygon } = Geometry = require("./Geometry.v2.js");
const geoDataDE = require("./data/germany.low_res.geo.json");
// const geoData = require("./data/countries.low_res.geo.json");

let poly = Geometry.from(geoDataDE.features[0].geometry);
// let poly2 = Polygon.from(geoDataDE.features[0].geometry.coordinates);
// let poly3 = Geometry.from(poly2.toJSON());

console.log(JSON.stringify(poly, null, 2));

// console.log(poly.valueOf());
// console.log(poly2.valueOf());
// console.log(poly3.valueOf());