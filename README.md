# Pub/sub [![Build Status](https://travis-ci.com/tbusser/pub-sub.svg?branch=master)](https://travis-ci.com/tbusser/pub-sub)

A publish/subscribe mechanism, written in TypeScript, to communicate between modules/classes without introducing any tight coupling.

## Installation
To add the library to your project, you can install it using your favorite package manager like so:
```bash
npm install --save-dev @ictoanen/pub-sub
```

or
```bash
yarn add -D @ictoanen/pub-sub
```

## Usage

### Publishing events
See the example below for a basic example on how to publish an event. It will publish an event named `test-event`. Any code listening to the event will receive the object passed along as the second parameter. This does not have to be an object, it can be any type you want.
```js
import { publish } from '@ictoanen/pub-sub';

const detail = {
    foo: 'bar'
};

const event = publish('test-event', detail);
```

### Subscribing to events
In order to listen for an event you will need the `subscribe` method. See below for a basic example:
```js
import { subscribe } from '@ictoanen/pub-sub';

// This will log whatever detail was sent along with the event.
subscribe('test-event', (event) => console.log('Received the test event', event.detail));
```
A method can subscribe to an event only once. Calling `subscribe` twice with the same event handler will not cause the handler to get called twice when the event is published.

### Unsubscribing from events
To unsubscribe from an event call the `unsubscribe` method with the same method that was used to subscribe to an event.
```js
import {
    subscribe,
    unsubscribe
} from '@ictoanen/pub-sub';

function handler(event) {
    console.log('Received the test event', event.detail);
}

// Subscribe to the test event.
subscribe('test-event', handler);
// Unsubscribe from the test event.
unsubscribe('test-event', handler)
```

### Cancelling events
By default an event can't be cancelled. If you do need an event which can be cancelled by one of the subscribers, the third parameter of the `publish` method will have to be used.
```js
const event = publish('test-event', detail, { cancellable: true });
if (event.defaultPrevented) {
    // The event has been cancelled by a subscriber.
}
```
Publishing an event with the `cancellable` option set to true will allow subscribers to call the `preventDefault()` method on the event.
```js
subscribe('test-event', (event) => event.preventDefault());
```
Calling `preventDefault` on an event which isn't cancellable will have no effect.

## Strong typed events with TypeScript
If you're using TypeScript you can use this package to create strong typed events. In order to do this you will need to create a file where the signature for the `publish` and `subscribe` methods are overloaded. In this same file you can also setup the coupling between event name and the data type of the `detail` property of the events. See the code example below for a reference implementation, assume this file is named `events.ts`:
```typescript
import { Action } from '@ictoanen/pub-sub';

// The interface the for the detail property which will be used when the
// demo event is published.
interface DemoEventDetail {
	/** A message to be displayed to the user. */
	message: string;
	/** Indicates whether or not the action was a success. */
	success: boolean;
}

// A unique key per strong typed event is needed so the key can be mapped to
// an interface.
const
	KEY_DEMO_EVENT = 'KEY_DEMO_EVENT';

// A mapping between the key and the interface to use for the detail property.
type EventDetailMapping = {
	[KEY_DEMO_EVENT]: DemoEventDetail
};

interface TypedCustomEvent<K extends keyof EventDetailMapping> {}

// The definition for the event, this will be used to piece together which
//interface will be used when this event is published or subscribed to.
export const DEMO_EVENT: TypedCustomEvent<typeof KEY_DEMO_EVENT> = KEY_DEMO_EVENT;


/**
 * Add overloads which will add strong typing for events.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/21566}
 */
declare module '@ictoanen/pub-sub/publisher/publisher' {
	export function publish<K extends keyof EventDetailMapping>(
		event: TypedCustomEvent<K>,
		detail: EventDetailMapping[K],
		options?: PublishOptions
	): Action<EventDetailMapping[K]>;

	export function subscribe<K extends keyof EventDetailMapping>(
		event: TypedCustomEvent<K>,
		callback: (action: Action<EventDetailMapping[K]>) => void,
		options?: SubscribeOptions
	): boolean;
}
```

With this in place it is now possible to import the `publish` and `subscribe` methods from the NPM package and have intellisense for the detail property of received events and when publishing a strong typed event.
```typescript
import {subscribe, publish} from '@ictoanen/pub-sub';
import { DEMO_EVENT } from './events';

subscribe(DEMO_EVENT, event => event.detail?.message);
```

In a code editor the strong typed event will look like this:
![image](https://user-images.githubusercontent.com/5519027/75864930-0b8e2800-5e03-11ea-8017-cceec58e4487.png)
As you can see on line 4, there is intellisense for the detail property of the event. This is done solely based on the event name used to subscribe the handler.

In line 6 there is an error indicating that the detail for the `DEMO_EVENT` does not have a property named `foo`. This will warn you when publishing events with missing or unknown properties.


# License
This project is released under the [MIT](https://choosealicense.com/licenses/mit/) license.
