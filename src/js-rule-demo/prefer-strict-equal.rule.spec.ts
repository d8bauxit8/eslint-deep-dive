import { RuleTester } from 'eslint';
import rule, { RULE_NAME } from './prefer-strict-equal.rule';

const ruleTester: RuleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `if(true === 'bar') {}`,
    },
    {
      code: `if(true !== 'bar') {}`,
    },
    {
      code: `if(true == 'bar') {}`,
      options: ['only-not-equals'],
    },
    {
      code: `if(true != 'bar') {}`,
      options: ['only-equals'],
    },
  ],
  invalid: [
    {
      code: `if(true == 'bar') {}`,
      errors: [
        {
          messageId: 'preferStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceEqualOperator',
              data: {
                actualOperator: '==',
                expectedOperator: '===',
              },
              output: `if(true === 'bar') {}`,
            },
          ],
        },
      ],
    },
    {
      code: `if(true != 'bar') {}`,
      errors: [
        {
          messageId: 'preferStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceEqualOperator',
              data: {
                actualOperator: '!=',
                expectedOperator: '!==',
              },
              output: `if(true !== 'bar') {}`,
            },
          ],
        },
      ],
    },
    {
      code: `if(true == 'bar') {}`,
      options: ['only-equals'],
      errors: [
        {
          messageId: 'preferStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceEqualOperator',
              data: {
                actualOperator: '==',
                expectedOperator: '===',
              },
              output: `if(true === 'bar') {}`,
            },
          ],
        },
      ],
    },
    {
      code: `if(true != 'bar') {}`,
      options: ['only-not-equals'],
      errors: [
        {
          messageId: 'preferStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceEqualOperator',
              data: {
                actualOperator: '!=',
                expectedOperator: '!==',
              },
              output: `if(true !== 'bar') {}`,
            },
          ],
        },
      ],
    },
  ],
});
