import { Expression, Identifier, IfStatement, Literal, Program, Statement, VariableDeclaration } from './convert-ast-to-source-code.util';
import { Token } from './convert-source-code-to-tokens.util';

// Let's define the token types
type ExpressionTokens = [Token<'Identifier'> | LiteralToken, Token<'Punctuator', '!==' | '===' | '!=' | '=='>, Token<'Identifier'> | LiteralToken];

type LiteralToken = Token<'String'> | Token<'Number'> | Token<'Boolean'>;

type VariableDeclarationTokens = [Token<'Identifier'>, Token<'Punctuator', '='>, LiteralToken, Token<'Punctuator', ';'>];

type Matcher<T> = readonly [T, number];

// We need type guards
const isKeywordToken = (token: Token): token is Token<'Keyword'> => token.type === 'Keyword';

const isPunctuatorToken = (token: Token): token is Token<'Punctuator'> => token.type === 'Punctuator';

const isIdentifierToken = (token: Token): token is Token<'Identifier'> => token.type === 'Identifier';

const isLiteralToken = (token: Token): token is LiteralToken => ['String', 'Number', 'Boolean'].includes(token.type);

const isValidConditionOperatorToken = (token: Token<'Punctuator'>): token is Token<'Punctuator', '!==' | '===' | '!=' | '=='> => ['===', '!===', '==', '!=='].includes(token.value);

const isNumberOfTokens3 = (tokens: readonly Token[]): tokens is readonly [Token, Token, Token] => tokens.length === 3;
const isNumberOfTokensAtLeast2 = (tokens: readonly Token[]): tokens is readonly [Token, Token, ...(readonly Token[])] => tokens.length >= 2;
const isNumberOfTokens4 = (tokens: readonly Token[]): tokens is readonly [Token, Token, Token, Token, ...(readonly Token[])] => tokens.length === 4;

const isExpressionTokens = (tokens: readonly Token[]): tokens is ExpressionTokens =>
  isNumberOfTokens3(tokens) &&
  (isLiteralToken(tokens[0]) || isIdentifierToken(tokens[0])) &&
  isPunctuatorToken(tokens[1]) &&
  isValidConditionOperatorToken(tokens[1]) &&
  (isLiteralToken(tokens[2]) || isIdentifierToken(tokens[2]));

const isScopeTokens = (tokens: readonly Token[]): tokens is readonly [Token<'Punctuator', '{'>, Token, ...(readonly Token[])] =>
  isNumberOfTokensAtLeast2(tokens) && isPunctuatorToken(tokens[0]) && tokens[0].value === '{';

const isIfToken = (token: Token<'Keyword'>): token is Token<'Keyword', 'if'> => token.value === 'if';
const isElseToken = (token: Token<'Keyword'>): token is Token<'Keyword', 'else'> => token.value === 'else';

const isVariableDeclarationTokens = (tokens: readonly Token[]): tokens is VariableDeclarationTokens =>
  isNumberOfTokens4(tokens) &&
  isIdentifierToken(tokens[0]) &&
  isPunctuatorToken(tokens[1]) &&
  (isLiteralToken(tokens[2]) || isIdentifierToken(tokens[2])) &&
  isPunctuatorToken(tokens[3]);

const isVariableDeclarationToken = (token: Token<'Keyword'>): token is Token<'Keyword', 'const' | 'let'> => ['const', 'let'].includes(token.value);

// And also mappers
const mapMatcherToT = <T>([value]: Matcher<T>): T => value;

const mapLiteralTokenToLiteral = (token: LiteralToken): Literal => ({
  type: 'Literal',
  value: token.type === 'String' ? token.value.replace(/["']/g, '') : token.type === 'Number' ? parseInt(token.value) : token.value === 'true',
});

const mapConditionValue = (token: Token<'Identifier'> | LiteralToken): Literal | Identifier =>
  isIdentifierToken(token)
    ? {
        type: 'Identifier',
        name: token.value,
      }
    : mapLiteralTokenToLiteral(token);

const mapExpressionTokensToExpression = ([left, operator, right]: ExpressionTokens): Expression => ({
  type: 'Expression',
  left: mapConditionValue(left),
  operator: operator.value,
  right: mapConditionValue(right),
});

const filterScopeTokens = ([, ...tokens]: readonly [Token<'Punctuator', '{'>, ...(readonly Token[])]): readonly Token[] => {
  let scopeLevel = 0;
  let tokenIndex = 0;
  for (const token of tokens) {
    if (isPunctuatorToken(token)) {
      if (token.value === '}') {
        if (scopeLevel === 0) {
          break;
        } else {
          scopeLevel--;
        }
      }

      if (token.value === '{') {
        scopeLevel++;
      }
    }
    tokenIndex++;
  }

  return tokens.slice(0, tokenIndex);
};

const mapTokensToMatcherIfStatement = (tokens: readonly [Token<'Keyword', 'if'>, ...(readonly Token[])]): Matcher<IfStatement> => {
  let nextIndex = 6;
  const expressionTokens = tokens.slice(1, 6).slice(1, 4);
  if (!isExpressionTokens(expressionTokens)) {
    throw new Error(`Invalid expression tokens at ${tokens[0].start} - ${tokens[tokens.length - 1]?.end}`);
  }

  const consequentScopeTokens = tokens.slice(6);
  if (!isScopeTokens(consequentScopeTokens)) {
    throw new Error(`Invalid bracket token in a consequent scope at ${consequentScopeTokens[0]?.start} - ${consequentScopeTokens[0]?.end}`);
  }
  const filteredConsequentScopeTokens = filterScopeTokens(consequentScopeTokens);
  nextIndex += 2 + filteredConsequentScopeTokens.length;

  let alternate = undefined;
  const elseToken = tokens[nextIndex];
  if (elseToken && isKeywordToken(elseToken) && isElseToken(elseToken)) {
    nextIndex++;
    const alternateScopeTokens = tokens.slice(nextIndex);
    if (!isScopeTokens(alternateScopeTokens)) {
      throw new Error(`Invalid bracket token in an alternate scope at ${alternateScopeTokens[0]?.start} - ${alternateScopeTokens[0]?.end}`);
    }
    const filteredAlternateScopeTokens = filterScopeTokens(alternateScopeTokens);
    nextIndex += 2 + filteredAlternateScopeTokens.length;
    alternate = mapTokensToMatcherStatementList(filteredAlternateScopeTokens).map(mapMatcherToT);
  }

  return [
    {
      type: 'IfStatement',
      test: mapExpressionTokensToExpression(expressionTokens),
      consequent: mapTokensToMatcherStatementList(filteredConsequentScopeTokens).map(mapMatcherToT),
      alternate,
    },
    nextIndex,
  ];
};

const mapTokensToMatcherVariableDeclaration = (tokens: readonly [Token<'Keyword', 'const' | 'let'>, ...(readonly Token[])]): Matcher<VariableDeclaration> => {
  const nextIndex = 5;
  const variableDeclarationTokens = tokens.slice(1, nextIndex);
  if (!isVariableDeclarationTokens(variableDeclarationTokens)) {
    throw new Error(`Invalid variable declaration tokens at ${tokens[0].start} - ${tokens[tokens.length - 1]?.end}`);
  }

  return [
    {
      type: 'VariableDeclaration',
      kind: tokens[0].value,
      id: {
        type: 'Identifier',
        name: variableDeclarationTokens[0].value,
      },
      init: mapLiteralTokenToLiteral(variableDeclarationTokens[2]),
    },
    nextIndex,
  ];
};

const mapTokensToMatcherStatement = ([token, ...tokens]: readonly Token[]): Matcher<Statement> => {
  if (token && isKeywordToken(token)) {
    if (isIfToken(token)) {
      return mapTokensToMatcherIfStatement([token, ...tokens]);
    } else if (isVariableDeclarationToken(token)) {
      return mapTokensToMatcherVariableDeclaration([token, ...tokens]);
    }
  }

  throw new Error(`Unsupported keyword`);
};

const mapTokensToMatcherStatementList = (tokens: readonly Token[]): readonly Matcher<Statement>[] => {
  const statements = new Set<readonly [Statement, number]>();
  for (let i = 0; i < tokens.length; ) {
    const statement = mapTokensToMatcherStatement(tokens.slice(i));
    i += statement[1];
    statements.add(statement);
  }
  return Array.from(statements.values());
};

export const convertTokensToAST = (tokens: readonly Token[]): Program => {
  const statements = mapTokensToMatcherStatementList(tokens).map(mapMatcherToT);
  return {
    type: 'Program',
    body: statements,
  };
};
