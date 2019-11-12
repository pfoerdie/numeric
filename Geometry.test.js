const { Point, MultiPoint, Polygon } = Geometry = require("./Geometry.js");
const geoDataDE = require("./data/germany.low_res.geo.json");

// const geoData = require("./data/countries.low_res.geo.json");

// let mp = MultiPoint.from([[1, 2], [5, 6], [-2, 4]]);
// let p = Geometry.from({ type: "Point", coordinates: [1.26, -9.65] });

// console.log(mp);
// console.log(p.toJSON());
// console.log(mp.valueOf());

// // let poly = Geometry.from(geoDataDE.features[0].geometry);
// let poly2 = Polygon.from(geoDataDE.features[0].geometry.coordinates);
// let poly3 = Geometry.from(poly2.toJSON());

// // console.log(poly.valueOf());
// console.log(poly2.valueOf());
// console.log(poly3.valueOf());

// console.time("time");
// let p0 = Point.from([0, 1, 2]);
// let p1 = MultiPoint.from([
//     [2, 1, 5],
//     [Number.EPSILON, 1 - Number.EPSILON, 2 + Number.EPSILON],
//     [9, -5, 1]
// ]);
// let res = p1.contains(p0);
// console.timeEnd("time");

// console.log("contains?", res);

let tests = [{
    "type": "Point",
    "coordinates": [0, 1, 2],
    "with": [{
        "type": "Point",
        "coordinates": [0, 1, 3],
        "is": {
            "equals": false,
            "intersects": false,
            "disjoint": true,
            "contains": false,
            "touches": false,
            "overlaps": false
        }
    }, {
        "type": "MultiPoint",
        "coordinates": [[0, 1, 2]],
        "is": {
            "equals": true,
            "intersects": true,
            "disjoint": false,
            "contains": true,
            "touches": false,
            "overlaps": true
        }
    }]
}];

let index = 0;
for (let first of tests) {
    let firstGeom = Geometry.from(first);
    for (let second of first.with) {
        let secondGeom = Geometry.from(second);
        console.log(`~ test ${index++}:`);
        for (let [method, expected] of Object.entries(second.is)) {
            let result = firstGeom[method](secondGeom);
            (expected === result ? console.log : console.warn)(first.type, method, second.type, "=", result);
        }
    }
}