const size = 100;
const iterations = 10;
const count = 100;
const init = 10;

for (let k = 0; k < iterations; k++) {
    let p = init;
    let q = init;
    let ak = new Array(size).fill().map(() => .25 + 3.75 * Math.random());

    ak.reduce((acc, val) => acc + val);

    console.time(`p[k=${k}]`);
    for (let i = 0; i < count; i++) {
        // p = Math.pow(p, ak[i]);
        p += Math.sqrt(ak[i]);
    }
    console.timeEnd(`p[k=${k}]`);

    ak.reduce((acc, val) => acc + val);

    console.time(`q[k=${k}]`);
    for (let i = 0; i < count; i++) {
        // q = q ** ak[i];
        q += ak[i] ** .5;
    }
    console.timeEnd(`q[k=${k}]`);

    ak.reduce((acc, val) => acc + val);
    console.log("p: ~", Math.trunc(p * 1e2) / 1e2);
    console.log("q: ~", Math.trunc(q * 1e2) / 1e2);
}