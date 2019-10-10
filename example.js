const
    // numeric = require("numeric"),
    { Vec1, Vec2, Vec3 } = Vector = require("./Vector.js"),
    Matrix = require("./Matrix.js");

// console.log(Object.keys(numeric));

let
    v0 = new Vec2(1, 2),
    v1 = Vector.from([1, 2, 3]);

console.log(v0 instanceof Vec2, v1 instanceof Vec3);
console.log(`Vec${v0.length}:`, v0);
console.log(`Vec${v1.length}:`, v1);
console.log(Vector.add(v0, Vector.from([2, 3])));
console.log(Vector.hadMult(new Vec3(3, Math.PI, 4), v1));

console.log(new Matrix(5, 2));