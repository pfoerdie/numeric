require("../src/index.js");

const example = {
    // Tensor: "./Tensor.example.js",
    Neuron: "./Neuron.example.js"
};

(async (/* async IIFE */) => {
    for (let name in example) {
        const timer = `\nExample<${name}>`;
        console.log(`${timer}: start\n`);
        console.time(timer);
        await require(example[name]);
        console.timeEnd(timer);
    }
})(/* async IIFE */);