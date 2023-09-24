import { Linter } from 'eslint';
import rule, { RULE_NAME } from './prefer-strict-equal.rule';

// Here is a JS code that represents the contents of a file.
const jsCode = `
if (foo == 'bar') {
    const bar = 'foo';
} else {
    if (ast != true) {
        const done = 1;
    }
}
`;

const linter: Linter = new Linter();
// Define rule that we want to use it
linter.defineRule(RULE_NAME, rule);
// Add this rule to the config
const config: Linter.Config = {
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    [RULE_NAME]: 'error',
  },
};

// Call a verify method on linter instance
const messages: readonly Linter.LintMessage[] = linter.verify(jsCode, config);
console.log(messages);

// // We could use ESLint (API) too, but in this case we do not need the whole functionality of ESLint.
// import { ESLint } from 'eslint';
// // This is the name of the plugin that our rule belongs to
// const PLUGIN_NAME = '@eslint-deep-dive';
// // Let's test it
// // 1. Add the plugin (including the rule) to ESLint
// // 2. Add this plugin to the config
// // 3. Add rule to the rules' config
// const eslint = new ESLint({
//   baseConfig: {
//     parserOptions: {
//       ecmaVersion: 'latest',
//     },
//     // 2. Add plugin to the config
//     plugins: [PLUGIN_NAME],
//     rules: {
//       // 3. Add rule to the rules' config
//       [`${PLUGIN_NAME}/${RULE_NAME}`]: 'error',
//     },
//   },
//   // 1. Add the plugin (including the rule) to ESLint
//   plugins: {
//     [PLUGIN_NAME]: {
//       rules: {
//         [RULE_NAME]: rule,
//       },
//     },
//   },
// });
// // Lint source code
// eslint.lintText(jsCode).then(console.log);
