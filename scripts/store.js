// store.js

export class StateStore {
    constructor(initialState) {
        this._state = initialState || {};
        this._subscribers = new Set();
    }

    subscribe(callback) {
        this._subscribers.add(callback);
    }

    unsubscribe(callback) {
        this._subscribers.delete(callback);
    }

    getState() {
        return this._state;
    }

    setState(newState) {
        this._state = { ...this._state, ...newState };
        this._subscribers.forEach(callback => callback());
    }
}