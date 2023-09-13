import type { AST, Rule } from 'eslint';
import type * as ESTree from 'estree';

// Let's write a rule which prefer to use strict equals in the conditions in JavaScript files.
export const RULE_NAME = 'prefer-strict-equal' as const;

const NOT_ALLOWED_OPERATORS: readonly string[] = ['==', '!='];

// This object responsible for Rule's configurations and meta information
const meta: Rule.RuleMetaData = {
  type: 'suggestion',
  docs: {
    description: 'Prefer `===` condition instead of `==`',
    recommended: false,
  },
  hasSuggestions: true,
  fixable: 'code',
  messages: {
    preferStrictEqual: 'Prefer `===` condition instead of `==`',
    suggestReplaceEqualOperator: "'Replace '{{actualOperator}}' to '{{expectedOperator}}'",
  },
};

// ESLint rule consists of one required property and two optionals. The optionals are that I mentioned above and the schema.
// (schema is potentially planned to be no longer be optional in v9)
export default {
  meta,
  // The create method responsible for the rule's logic.
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      BinaryExpression(node: ESTree.BinaryExpression) {
        // This node is a BinaryExpression that contains left and right nodes and an operator property
        const { operator, left, right } = node;
        if (NOT_ALLOWED_OPERATORS.includes(operator)) {
          // Get the given operator's token that contains range, source location and value.
          const operatorToken = context.sourceCode.getFirstTokenBetween(left, right, (token: AST.Token): boolean => token.value === operator);

          if (!operatorToken) {
            return;
          }

          const expectedOperator = `${operator}=` as const;

          // If we want to report an issue, call 'report' method with the necessary properties on the context instance.
          context.report({
            node,
            loc: operatorToken.loc,
            messageId: 'preferStrictEqual',
            // If we want to fix this issue automatically, create a suggestion
            suggest: [
              {
                messageId: 'suggestReplaceEqualOperator',
                // Fixer is an optional feature. Sometimes there is no possibility to fix a given rule
                fix: (fixer: Rule.RuleFixer): Rule.Fix => fixer.replaceText(operatorToken, expectedOperator),
                data: {
                  actualOperator: operator,
                  expectedOperator,
                },
              },
            ],
          });
        }
      },
    };
  },
};
