import { expect } from 'chai';
import { isNilOrEmpty } from './isNilOrEmpty';

describe('isNilOrEmpty()', () => {
	it('should return true when the input is null', () => {
		// @ts-ignore
		expect(isNilOrEmpty(null)).to.be.true;
	});

	it('should return true when the input is undefined', () => {
		expect(isNilOrEmpty(undefined)).to.be.true;
	});

	it('should return true when the input is an empty string', () => {
		expect(isNilOrEmpty('')).to.be.true;
	});

	it('should return true when the input contains only whitespace', () => {
		['   ', '\t', '\n', '   \n\t    '].forEach(value => {
			expect(isNilOrEmpty(value), `Error for value ${JSON.stringify(value)}`).to.be.true;
		});
	});

	it('should return false for a string containing not just whitespace', () => {
		['a', ' a', 'a ', '1 2 3'].forEach(value => {
			expect(isNilOrEmpty(value), `Error for value ${value}`).to.be.false;
		});
	});

	it('should return false for values not of type string', () => {
		[{}, [], 1].forEach(value => {
			// @ts-ignore
			expect(isNilOrEmpty(value), `Error for value ${JSON.stringify(value)}`).to.be.false;
		});
	});
});
