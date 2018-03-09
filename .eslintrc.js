module.exports = {
  "env": {
    "react-native/react-native": true
  },
  "extends": "airbnb",
  "parser": "babel-eslint",
  "plugins": [
    "react",
    "react-native"
  ],
  "rules": {
    "class-methods-use-this": "off",
    "comma-dangle": ["error", "never"],
    "indent": ["error", 2, {
        "SwitchCase": 1
    }],
    "global-require": "off",
    "no-underscore-dangle": ["error", {
        "allowAfterThis": true
    }],
    "radix": "off",
    "react/jsx-closing-bracket-location": [1, {
        "selfClosing": "after-props",
        "nonEmpty": "after-props"
    }],
    "react/jsx-curly-brace-presence": [1, {
        "props": "always"
    }],
    "react/forbid-prop-types": 0,
    "react/jsx-filename-extension": 0,
    "react/no-array-index-key": 0,
    "react/prop-types": ["error", {
        "ignore": ["theme", "style", "children"],
        "skipUndeclared": true
    }],
    "react/require-default-props": "off",
    "react-native/no-unused-styles": 2,
    "react-native/no-inline-styles": 2
  }
};
