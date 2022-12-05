module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2020
	},
	'rules': {
		'prefer-arrow-callback': 'warn',
		'default-case': 'warn',
		'no-return-assign': 'warn',
		'no-nested-ternary': 'warn',
		'no-underscore-dangle': 'off',
		'no-console': 'warn',

		'object-curly-spacing': ['error', 'always'],
		'array-bracket-spacing': ['error', 'never'],

		'arrow-body-style': [
			'error',
			'as-needed'
		],

		'no-unused-vars': [
			'warn',
			{
				'argsIgnorePattern': '^_',
				'varsIgnorePattern': '^_'
			}
		],
		'consistent-return': 'warn',
		'no-multi-spaces': 'error',
		'indent': [
			'error',
			'tab',
			{ SwitchCase: 1 }
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
	}
};
