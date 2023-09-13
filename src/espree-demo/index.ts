// ESLint uses this lib to create AST object.
import * as espree from 'espree';
import { format } from 'prettier';

// Before linting the ESLint parses JavaScript files to AST object.
// Here is a JS code that represents the contents of a file.
const jsCode = `
const foo = 'bar';
let ast = true;
if (foo === 'bar') {
    const bar = 'foo';
} else {
    if (ast !== true) {
        let done = 1;
    }
}
`;

// Tokens represent those units from which the code is built, like Keyword (const), Identifier (foo, bar), Punctuator (=, {, })
const tokens = espree.tokenize(jsCode, { ecmaVersion: 'latest' });
console.log(tokens);

// Espree parser takes a string representing a valid JavaScript program and produces a syntax tree,
// an ordered tree that describes the syntactic structure of the program.
// The resulting syntax tree is useful for various purposes, from program transformation to static program analysis.
const ast = espree.parse(jsCode, { ecmaVersion: 'latest' });
void format(JSON.stringify(ast), { parser: 'json' }).then(console.log);
