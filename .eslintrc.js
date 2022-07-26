module.exports =  {
  parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
  extends:  [
      //'airbnb',
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    //'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    //'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
  },
  overrides: [
    {
      files: ["*.{ts}"]
    }
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [0],
    "@typescript-eslint/no-namespace": [0],
    "@typescript-eslint/prefer-namespace-keyword": [0],
    "@typescript-eslint/no-misused-new": [0],
    "@typescript-eslint/ban-types": [0],
    "@typescript-eslint/no-explicit-any": [0],
  }
};
