const
    // numeric = require("numeric"),
    { Vec1, Vec2, Vec3 } = Vector = require("./Vector.js"),
    Matrix = require("./Matrix.js");

// console.log(Object.keys(numeric));

// let
//     v0 = new Vec2(1, 2),
//     v1 = Vector.from([1, 2, 3]);

// console.log(v0 instanceof Vec2, v1 instanceof Vec3);
// console.log(`Vec${v0.length}:`, v0);
// console.log(`Vec${v1.length}:`, v1);
// console.log(Vector.sum(v0, Vector.from([2, 3])));
// console.log(Vector.hadProd(new Vec3(3, Math.PI, 4), v1));
// console.log(Vector.scalarProd(v1, new Vec1(2)));
// console.log(Vector.inverse(Vector.sum(v0, Vector.from([0, -2]))));
// console.log(Vec2.of(3), Vector.of(2, 3));

// console.log(new Matrix(5, 2));

let A = new Vec3(1, 2, 2);
let B = new Vec3(5, -3, 2);
let C = Vector.crossProd(A, B);
let D = Vector.scalarProd(C, 1 / (Vector.euklDist(A) * Vector.euklDist(B)));
let E = Vector.hadProd(D, Vector.inverse(Vector.euklNorm(C)));
let theta = Math.asin(E.x);
console.log(theta * 180 / Math.PI);