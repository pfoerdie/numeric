const { Point, MultiPoint } = Geometry = require("./Geometry.js");

let mp = MultiPoint.from([[1, 2], [5, 6], [-2, 4]]);
let p = Geometry.from({ type: "Point", coordinates: [1.26, -9.65] });

console.log(mp);
console.log(p.toJSON());
console.log(mp.coordinates);