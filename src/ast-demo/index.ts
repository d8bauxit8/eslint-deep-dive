import { format } from 'prettier';
import { convertSourceCodeToTokens, type Token } from './convert-source-code-to-tokens.util';
import { convertTokensToAST } from './convert-tokens-to-ast.util';
import { convertASTToSourceCode, type Program } from './convert-ast-to-source-code.util';

// Exercise: Try to make an AST object from the following source code.
// Scroll down for the solution
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

// Let's see how do these work together
console.log('Convert source code to tokens');
// First we have to create tokens from source code
const tokens: readonly Token[] = convertSourceCodeToTokens(jsCode);
console.log(tokens);
// Second, make an AST object form the tokens
const ast: Program = convertTokensToAST(tokens);
// It's just formatted better, so you can see it well in the console
void format(JSON.stringify(ast), { parser: 'json' }).then((formattedAST: string): void => {
  console.log(formattedAST);
  // Convert back to string from AST object
  void convertASTToSourceCode(ast).then(console.log);
});

//
//
//
//
//
//
// Solution of the AST object
// const jsCodeAST: Program = {
//   type: 'Program',
//   body: [
//     {
//       type: 'VariableDeclaration',
//       id: {
//         type: 'Identifier',
//         name: 'foo',
//       },
//       kind: 'const',
//       init: {
//         type: 'Literal',
//         value: 'bar',
//       },
//     },
//     {
//       type: 'VariableDeclaration',
//       id: {
//         type: 'Identifier',
//         name: 'ast',
//       },
//       kind: 'let',
//       init: {
//         type: 'Literal',
//         value: true,
//       },
//     },
//     {
//       type: 'IfStatement',
//       test: {
//         type: 'Expression',
//         left: {
//           type: 'Identifier',
//           name: 'foo',
//         },
//         operator: '===',
//         right: {
//           type: 'Literal',
//           value: 'bar',
//         },
//       },
//       consequent: [
//         {
//           type: 'VariableDeclaration',
//           id: {
//             type: 'Identifier',
//             name: 'bar',
//           },
//           kind: 'const',
//           init: {
//             type: 'Literal',
//             value: 'foo',
//           },
//         },
//       ],
//       alternate: [
//         {
//           type: 'IfStatement',
//           test: {
//             type: 'Expression',
//             left: {
//               type: 'Identifier',
//               name: 'ast',
//             },
//             operator: '!==',
//             right: {
//               type: 'Literal',
//               value: true,
//             },
//           },
//           consequent: [
//             {
//               type: 'VariableDeclaration',
//               id: {
//                 type: 'Identifier',
//                 name: 'done',
//               },
//               kind: 'let',
//               init: {
//                 type: 'Literal',
//                 value: 1,
//               },
//             },
//           ],
//           alternate: undefined,
//         },
//       ],
//     },
//   ],
// };
