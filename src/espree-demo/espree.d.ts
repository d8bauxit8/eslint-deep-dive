declare module 'espree' {
  export const tokenize: (jsCode: string, options: { ecmaVersion: 'latest' }) => unknown;
  export const parse: (jsCode: string, options: { ecmaVersion: 'latest' }) => unknown;
}
