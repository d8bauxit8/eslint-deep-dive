import { format } from 'prettier';
// We have talked about AST in the ReadMe, so let's make a simple AST example together
//
// Let's say, we want to represent conditional blocks and variables with an AST object (variable, if, else)
// Every program have (at least) an entry point.
export interface Program {
  readonly type: 'Program';
  // The program body could contain Statement(s)
  readonly body: readonly Statement[];
}

export type Statement = VariableDeclaration | IfStatement;

export interface Expression {
  readonly type: 'Expression';
  readonly left: Identifier | Literal;
  readonly operator: '===' | '!==' | '==' | '!=';
  readonly right: Identifier | Literal;
}

// VariableDeclaration have an id and an init value
// Question: Dose VariableDeclaration always need init value?
// You can find the answer on the bottom of this file
export interface VariableDeclaration {
  readonly type: 'VariableDeclaration';
  readonly id: Identifier;
  readonly kind: 'const' | 'let';
  readonly init: Literal;
}

export interface Literal {
  readonly type: 'Literal';
  readonly value: string | number | boolean;
}

export interface Identifier {
  readonly type: 'Identifier';
  readonly name: string;
}

export interface IfStatement {
  readonly type: 'IfStatement';
  readonly test: Expression;
  // The true branch of condition could contain Statement(s)
  readonly consequent: readonly Statement[];
  // Might be the false branch of the condition has Statement(s) or undefined
  readonly alternate: readonly Statement[] | undefined;
}

// These type guards responsible for figuring out the type of the given Statement.
const isVariableDeclaration = (tree: Statement): tree is VariableDeclaration => tree.type === 'VariableDeclaration';
const isIfStatement = (tree: Statement): tree is IfStatement => tree.type === 'IfStatement';

const isIdentifier = (tree: Identifier | Literal): tree is Identifier => tree.type === 'Identifier';
const isLiteral = (tree: Identifier | Literal): tree is Literal => tree.type === 'Literal';

const throwError = (tree: Statement) => {
  throw new Error(`It is not a valid body!\nThe given piece of code: ${typeof tree === 'object' ? JSON.stringify(tree) : tree}`);
};

// We need mappers to make string from a given piece of AST object.
const mapIdentifierToSource = (tree: Identifier): string => `${tree.name}`;

const mapLiteralToSource = (tree: Literal): string => `${typeof tree.value === 'string' ? `'${tree.value}'` : tree.value}`;

const mapVariableDeclarationToSource = (tree: VariableDeclaration): string => `${tree.kind} ${mapIdentifierToSource(tree.id)} = ${mapLiteralToSource(tree.init)};`;

const mapExpressionToSource = (tree: Identifier | Literal): string =>
  isIdentifier(tree) ? mapIdentifierToSource(tree) : isLiteral(tree) ? mapLiteralToSource(tree) : throwError(tree);

const mapIfStatementToSource = (tree: IfStatement): string => {
  const left = mapExpressionToSource(tree.test.left);
  const right = mapExpressionToSource(tree.test.right);
  const statementSource = tree.consequent.map(mapStatementToSource).join('');
  const elseSource = tree.alternate ? [` else {`, tree.alternate.map(mapStatementToSource).join(''), `}`].join('') : undefined;
  return [`if(${left} ${tree.test.operator} ${right}) {`, statementSource, `}${elseSource ?? ''}`].join('');
};

const mapStatementToSource = (tree: Statement): string => {
  return isVariableDeclaration(tree) ? mapVariableDeclarationToSource(tree) : isIfStatement(tree) ? mapIfStatementToSource(tree) : throwError(tree);
};

export const convertASTToSourceCode = ({ body }: Program): Promise<string> => {
  try {
    const sourceCode = body.map(mapStatementToSource).join('');
    return format(sourceCode, { parser: 'babel' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Promise.resolve(error.message);
    }
  }
  return Promise.resolve('');
};

// Question: Dose VariableDeclaration always need init value?
// Actually no, if you just want to define a variable, not declare.
// For instance: let foo;
