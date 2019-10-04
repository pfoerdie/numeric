const
    { Vec2, Vec3 } = Vector = require("./Vector.js");

let
    v0 = new Vec2(1, 2),
    v1 = Vector.from([1, 2, 0]);

console.log(v0 instanceof Vector);
console.log(`Vec${v0.length}:`, v0);
console.log(`Vec${v1.length}:`, v1);
console.log(Vector.add(v0, new Vec2(2, 3)));
console.log(Vector.add(new Vec3(3, 5.5), v1));