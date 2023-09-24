// In this example I have created a simple tokenizer (it is not included all JS conventions).
// With that you can get to know how dose tokenizer work.

// What kind of tokens do we have to distinguish in this example?
export type TokenType =
  | 'Keyword' // const, let, if
  | 'Punctuator' // ; ( ) { }
  | 'Identifier' // variable names
  | 'String' // string literal: 'foo'
  | 'Number' // 123
  | 'Boolean'; // true, false

// This is the interface of the token which contains all necessary data from which we need
export interface Token<T extends TokenType = TokenType, V extends string = string> {
  readonly type: T;
  readonly value: V;
  readonly start: number;
  readonly end: number;
}

// These matchers responsible for detecting what type is the following token in the given string.
const isKeyword = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*(?:if|const|let|else)/m;
  const match = line.match(regExp);
  return ['Keyword', match ? match[0].length : -1];
};

const isPunctuator = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*(?:[=!]==|[=!]=|[(){};=])/m;
  const match = line.match(regExp);
  return ['Punctuator', match ? match[0].length : -1];
};

const isBoolean = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*(?:true|false)/m;
  const match = line.match(regExp);
  return ['Boolean', match ? match[0].length : -1];
};

const isNumber = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*[0-9]+/m;
  const match = line.match(regExp);
  return ['Number', match ? match[0].length : -1];
};

const isIdentifier = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*[a-zA-Z][a-zA-Z0-9]*/m;
  const match = line.match(regExp);
  return ['Identifier', match ? match[0].length : -1];
};

const isString = (line: string): readonly [TokenType, number] => {
  const regExp = /^\s*(?:'[^']*'|"[^"]*")/m;
  const match = line.match(regExp);
  return ['String', match ? match[0].length : -1];
};

const tokenMatchers: readonly ((line: string) => readonly [TokenType, number])[] = [isKeyword, isPunctuator, isBoolean, isNumber, isString, isIdentifier];

// Let's find the token
const findToken = (line: string, previousTokenOfEndIndex: number): Token | undefined => {
  for (const matcher of tokenMatchers) {
    const [type, lengthOfMatch] = matcher(line);
    if (lengthOfMatch !== -1) {
      const rawValue = line.substring(0, lengthOfMatch);
      const value = type === 'String' ? rawValue.trimStart().replace(/["']/g, '') : rawValue.trimStart();
      const start = previousTokenOfEndIndex + (rawValue.length - value.length);
      const end = previousTokenOfEndIndex + lengthOfMatch;
      return { type, value, start, end };
    }
  }
  return undefined;
};

// Let's find all tokens in the given string (this string does not contain Enter)
const convertLineToTokens = (line: string): readonly Token[] => {
  const tokens: Token[] = [];
  let token: Token | undefined;
  let previousTokenOfEndIndex = 0;
  while ((token = findToken(line, previousTokenOfEndIndex))) {
    line = line.slice(token.end - previousTokenOfEndIndex);
    previousTokenOfEndIndex = token.end;
    tokens.push(token);
  }

  return tokens;
};

// Let's find all tokens in the given source code
export const convertSourceCodeToTokens = (sourceCode: string): readonly Token[] => {
  const lines: readonly string[] = sourceCode.trim().split('\n');
  const tokens: Token[] = [];
  let previousProcessedLineEndOfIndex = 0;
  lines.forEach((line: string) => {
    const lineTokens = convertLineToTokens(line);
    tokens.push(
      ...lineTokens.map((token: Token) => ({
        ...token,
        start: token.start + previousProcessedLineEndOfIndex,
        end: token.end + previousProcessedLineEndOfIndex,
      }))
    );
    previousProcessedLineEndOfIndex = previousProcessedLineEndOfIndex + line.length - 1;
  });
  return tokens;
};
