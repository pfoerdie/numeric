const
    numeric = require('../src');

try {

    console.log(numeric);
    console.log(numeric.core.types.int8('1234'));
    console.log('123' instanceof numeric.core.types.int);
    console.log(numeric.core.types.int8('1234') instanceof numeric.core.types.int8);
    console.log();

} catch (err) {

    console.error(err);
    debugger;

}
