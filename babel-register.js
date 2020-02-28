/**
 * This file is needed to run Mocha on TypeScript files. The extensions config
 * can't be passed along with using the command line option
 * "--required @babel/regiser". By referring to this file instead we can ensure
 * the TypeScript files are treated by Babel.
 *
 * @see {@link https://github.com/babel/babel/issues/8962}
 */
const register = require('@babel/register').default;

register({ extensions: ['.ts', '.tsx', '.js', '.jsx'] });
