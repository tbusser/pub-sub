import { expect } from 'chai';
import { spy } from 'sinon';
import { Action } from './Action/Action';
import { once, publish, subscribe, unsubscribe } from './index';

/* ========================================================================== *\
	PRIVATE VARIABLES
\* ========================================================================== */
const
	invalidSubscribers = ['a', 1, {}, new Date(), [], null, undefined];



/* ========================================================================== *\
	HELPER METHODS
\* ========================================================================== */
function generateUniqueEventName() {
	return `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}



/* ========================================================================== *\
	TESTS
\* ========================================================================== */
describe('publisher', () => {
	let testEvent: string;

	beforeEach(() => testEvent = generateUniqueEventName());

	describe('subscribe()', () => {
		it('should accept a function as a subscriber', () => {
			expect(subscribe(testEvent, () => {})).to.be.true;
		});

		it('should reject a subscriber which is not a function', () => {
			invalidSubscribers.forEach(subscriber => {
				// @ts-ignore
				expect(subscribe(testEvent, subscriber)).to.be.false;
			});
		});

		it('should reject a subscriber which is already subscribed', () => {
			const
				subscriber = () => {};
			subscribe(testEvent, subscriber);
			expect(subscribe(testEvent, subscriber)).to.be.false;
		});

		it('should reject a subscriber with a max call count of 0 or less', () => {
			[0, -10, -Infinity].forEach(maxCallCount => {
				expect(subscribe(testEvent, () => {}, { maxCallCount })).to.be.false;
			});
		});
	});

	describe('publish', () => {
		it('should return the published action', () => {
			const
				payload = `payload-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
				action = publish(testEvent, payload);

			expect(action).to.be.an.instanceof(Action);
			expect(action.detail).to.equal(payload);
		});

		it('should call the subscribers for the event', () => {
			const
				subscriber = spy(),
				payload = `payload-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

			subscribe(testEvent, subscriber);
			publish(testEvent, payload);

			expect(subscriber.calledOnce).to.be.true;
		});

		it('should remove subscribers when their max call is reached', () => {
			const
				maxCallCount = 2,
				subscriber = spy(),
				maxCallSubscriber = spy();

			subscribe(testEvent, subscriber);
			subscribe(testEvent, maxCallSubscriber, { maxCallCount });

			for (let index = 0; index <= maxCallCount; index++) {
				publish(testEvent);
			}

			expect(subscriber.callCount).to.equal(maxCallCount + 1);
			expect(maxCallSubscriber.callCount).to.equal(maxCallCount);
		});

		describe('cancelling an action', () => {
			it('should by default not allow an action to be cancelled', () => {
				// Add a subscriber which will try to cancel the action.
				subscribe(testEvent, action => action.preventDefault());
				// Publish an action which should not be cancellable.
				const action = publish(testEvent);

				expect(action.cancelable).to.be.false;
				expect(action.defaultPrevented).to.be.false;
			});

			it('should allow an action to be cancelled when the option is set', () => {
				// Add a subscriber which will try to cancel the action.
				subscribe(testEvent, action => action.preventDefault());
				// Publish a cancellable action.
				const action = publish(testEvent, null, { cancellable: true });

				expect(action.cancelable).to.be.true;
				expect(action.defaultPrevented).to.be.true;
			});
		});
	});

	describe('unsubscribe', () => {
		it('should do nothing for an event without subscribers', () => {
			expect(unsubscribe(testEvent, () => {})).to.be.false;
		});

		it('should do nothing for an invalid subscriber', () => {
			invalidSubscribers.forEach(subscriber => {
				// @ts-ignore
				expect(unsubscribe(testEvent, subscriber)).to.be.false;
			});
		});

		it('should do nothing for an unknown subscriber', () => {
			subscribe(testEvent, () => {});
			expect(unsubscribe(testEvent, () => {})).to.be.false;
		});

		it('should remove an existing subscriber', () => {
			const subscriber = spy();

			subscribe(testEvent, subscriber);
			expect(unsubscribe(testEvent, subscriber)).to.be.true;

			publish(testEvent, null);
			expect(subscriber.called).to.be.false;
		});
	});

	describe('once', () => {
		it('should remove the subscriber after the first call', () => {
			const subscriber = spy();

			once(testEvent, subscriber);
			publish(testEvent);
			publish(testEvent);

			expect(subscriber.calledOnce).to.be.true;
		});

		it('should ignore the provided maxCallCount in the options', () => {
			const subscriber = spy();

			once(testEvent, subscriber, { maxCallCount: 10});
			publish(testEvent);
			publish(testEvent);

			expect(subscriber.calledOnce).to.be.true;
		});
	});

	describe('scoped events', () => {
		it('should only call subscribers in the same scope', () => {
			const
				scope = 'test',
				subscriber = spy(),
				scopedSubscriber = spy();

			subscribe(testEvent, subscriber);
			subscribe(testEvent, scopedSubscriber, { scope });

			publish(testEvent, null, { scope });

			expect(subscriber.notCalled).to.be.true;
			expect(scopedSubscriber.called).to.be.true;
		});
	});
});
