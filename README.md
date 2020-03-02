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
import { publish } from '@tbusser/pub-sub';

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

# License
This project is released under the [MIT](https://choosealicense.com/licenses/mit/) license.
