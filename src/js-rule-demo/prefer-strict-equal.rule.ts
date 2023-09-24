import type { AST, Rule } from 'eslint';
import type * as ESTree from 'estree';

// Let's write a rule which prefer to use strict equals in the conditions in JavaScript files.
export const RULE_NAME = 'prefer-strict-equal' as const;

const NOT_ALLOWED_OPERATORS: readonly string[] = ['==', '!='];

const operatorsFilter =
  (allowedOperatorTypes: 'only-equals' | 'only-not-equals' | string) =>
  (operator: (typeof NOT_ALLOWED_OPERATORS)[number]): boolean => {
    if (allowedOperatorTypes == 'only-equals') {
      return operator === '==';
    }

    if (allowedOperatorTypes == 'only-not-equals') {
      return operator === '!=';
    }

    return true;
  };

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
    // It is needed for the fixer
    suggestReplaceEqualOperator: "'Replace '{{actualOperator}}' to '{{expectedOperator}}'",
  },
  // This schema responsible for the option parameters
  schema: [
    {
      enum: ['only-equals', 'only-not-equals'],
    },
  ],
};

// ESLint rule consists of one required property and two optionals. The optionals are that I mentioned above and the schema.
// (schema is potentially planned to be no longer be optional in v9)
export default {
  meta,
  // The create method responsible for the rule's logic.
  create(context: Rule.RuleContext): Rule.RuleListener {
    // Get the options from the context to use it later
    const allowedOperatorTypes: 'only-equals' | 'only-not-equals' | string = context.options[0] || '';

    return {
      // Let's filter the node. The keys can be a node type (AST type), selector or event name.
      // In this current example we look for the BinaryExpression nodes.
      BinaryExpression(node: ESTree.BinaryExpression) {
        // This node is a BinaryExpression that contains left and right nodes and an operator property
        const { operator, left, right } = node;
        if (NOT_ALLOWED_OPERATORS.filter(operatorsFilter(allowedOperatorTypes)).includes(operator)) {
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
                // This object is used in string that tells the user what will happen if they run the fixing
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