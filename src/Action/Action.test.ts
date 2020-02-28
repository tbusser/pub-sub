import { expect } from 'chai';
import { Action } from './Action';

describe('Action', () => {
	it('should have an undefined detail when it is not set', () => {
		[new Action(), new Action(null), new Action(undefined)].forEach(action => {
			expect(action.detail).to.be.undefined;
		})
	});

	it('should have a readonly copy of the payload', () => {
		const
			payload = 'payload',
			action = new Action(payload);

		expect(action.detail).to.equal(payload);
		// @ts-ignore
		expect(() => action.detail = 'a').to.throw(TypeError);
	});

	describe('cancellable', () => {
		it('should not be cancellable by default', () => {
			const
				action = new Action();

			expect(action.cancelable).to.be.false;
		});

		it('should ignore calls to preventDefault() when not cancellable', () => {
			const
				action = new Action();
			action.preventDefault();

			expect(action.defaultPrevented).to.be.false;
		});

		it('should process calls to preventDefault() when cancellable', () => {
			const
				action = new Action(null, true);
			action.preventDefault();

			expect(action.cancelable).to.be.true;
			expect(action.defaultPrevented).to.be.true;
		});
	});
});
