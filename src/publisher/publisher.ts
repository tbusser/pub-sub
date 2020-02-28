/* ========================================================================== *\
	IMPORTS
\* ========================================================================== */
import { isNilOrEmpty } from "../isNilOrEmpty/isNilOrEmpty";
import { Action } from '../Action/Action';



/* ========================================================================== *\
	TYPE DEFINITIONS
\* ========================================================================== */
type Subscriber = (action: Action<any>) => void;
type Subscriptions = Map<Subscriber, InternalSubscribeOptions>;
type EventSubscribers = Map<string, Subscriptions>;

export interface SubscribeOptions {
	/**
	 * The number of times the subscriber should be called. Once the max call
	 * count is reached the subscriber to the event will automatically
	 * be unsubscribed.
	 */
	maxCallCount?: number;

	/**
	 * The scope of the event.
	 */
	scope?: string;
}

interface InternalSubscribeOptions extends SubscribeOptions{
	/**
	 * The number of times the subscriber has received the event.
	 */
	callCount: number;
	maxCallCount: number;
}

export interface PublishOptions {
	/**
	 * When set to true subscribers will have the option to "cancel" the event,
	 * this can be used to indicate to the publisher of the event that the
	 * action it is about to take should not be done.
	 */
	cancellable?: boolean;
	/**
	 * The scope of the event, this should match the value used to subscribe to
	 * the event.
	 */
	scope?: string;
}



/* ========================================================================== *\
	PRIVATE VARIABLES
\* ========================================================================== */
const
	defaultSubscribeOptions: InternalSubscribeOptions = {
		callCount: 0,
		maxCallCount: Infinity
	},
	subscribers: EventSubscribers = new Map();



/* ========================================================================== *\
	PRIVATE METHODS
\* ========================================================================== */
/**
 * Takes the name of an event and applies the scope to it when a scope
 * is provided.
 *
 * @param event The base name of the event.
 * @param scope An optional scope to add to the base event name.
 *
 * @returns Returns the name of the event.
 */
function getEventName(event: string, scope?: string): string {
	return (isNilOrEmpty(scope))
		? event
		: `${event}${scope}`;
}

/**
 * Returns the subscribers for an event.
 *
 * @param event The name of the event (scoped) whose subscriptions should
 *        be returned.
 * @param registerNewEvent Be default an unknown event will not be added to the
 *        internal administration of events. When set to true an unknown event
 *        will be added to the administration.
 */
function getEventSubscriptions(event: string, registerNewEvent: boolean = false): Subscriptions {
	const isNewEvent = !subscribers.has(event),
		subscriptions = subscribers.get(event) ?? new Map();

	if (isNewEvent && registerNewEvent) {
		subscribers.set(event, subscriptions);
	}

	return subscriptions;
}



/* ========================================================================== *\
	PUBLIC API
\* ========================================================================== */
/**
 * Adds a subscriber for an event, the subscriber will be unsubscribed from the
 * event after the first time the event is published after subscribing to it.
 *
 * @param event The name of the event to subscribe to.
 * @param callback The method to call when the event is published.
 * @param options Optional options for subscribing to the event.
 *
 * @returns Returns true when the subscriber has successfully subscribed to
 *          the specified event.
 */
function once(
	event: string,
	callback: Subscriber,
	options?: SubscribeOptions
): boolean;

function once(
	event: string,
	callback: Subscriber,
	options?: SubscribeOptions
): boolean {
	const
		subscribeOptions: SubscribeOptions = { ...options, maxCallCount: 1 };

	return subscribe(event, callback, subscribeOptions);
}

/**
 * Publishes an event to all its subscribers.
 *
 * @param event The name of the event to publish.
 * @param detail Optional payload for the event.
 * @param options Optional options for publishing the event.
 *
 * @returns Returns the action which was published.
 */
function publish(
	event: string,
	detail?: any,
	options?: PublishOptions
): Action<any>;

function publish(
	event: string,
	detail?: any,
	options?: PublishOptions
): Action<any> {
	const
		eventName = getEventName(event, options?.scope),
		subscriptions = getEventSubscriptions(eventName),
		action = new Action(detail, options?.cancellable);

	subscriptions.forEach((options, subscriber) => {
		// First adjust the call count so if the subscriber throws an exception
		// the internal administration has already been taken care of.
		options.callCount++;
		if (options.callCount >= options.maxCallCount) {
			unsubscribe(eventName, subscriber);
		}

		subscriber(action);
	});

	return action;
}

/**
 * Adds a subscriber to an event.
 *
 * @param event The name of the event to subscribe to.
 * @param callback The method to call when the event is published.
 * @param options Optional options for subscribing to the event.
 *
 * @returns Returns true when the subscriber has successfully subscribed to
 *          the specified event.
 */
function subscribe(
	event: string,
	callback: Subscriber,
	options?: SubscribeOptions
): boolean;

function subscribe(
	event: string,
	callback: Subscriber,
	options?: SubscribeOptions
): boolean {
	const
		subscribeOptions: InternalSubscribeOptions = { ...defaultSubscribeOptions, ...options };

	if (
		typeof callback !== 'function' ||
		subscribeOptions.maxCallCount <= 0
	) {
		return false;
	}

	const
		eventName = getEventName(event, subscribeOptions.scope),
		subscriptions = getEventSubscriptions(eventName, true);

	if (subscriptions.has(callback)) {
		return false;
	}

	subscriptions.set(callback, subscribeOptions);
	return true;
}

/**
 * Removes a subscriber from an event.
 *
 * @param event The name of the event to subscribe to.
 * @param callback The method to call when the event is published.
 * @param scope The scope of the event which was used when the subscriber was
 *        added to the event.
 *
 * @returns Returns true when the subscription for the subscriber has
 *          been cancelled.
 */
function unsubscribe(
	event: string,
	callback: (issue: Action<any>) => void,
	scope?: string
): boolean;

function unsubscribe(
	event: string,
	callback: (issue: Action<any>) => void,
	scope?: string
): boolean {
	if (typeof callback !== 'function') {
		return false;
	}

	const
		eventName = getEventName(event, scope),
		subscriptions = getEventSubscriptions(eventName);

	return subscriptions.delete(callback);
}



/* ========================================================================== *\
	EXPORTS
\* ========================================================================== */
export {
	once,
	publish,
	subscribe,
	unsubscribe
};
