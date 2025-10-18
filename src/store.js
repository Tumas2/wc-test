// store.js

export class StateStore {
    /**
     * @param {object} initialState The initial state of the store.
     */
    constructor(initialState) {
        /**
         * @private
         * @description A non-mutating copy of the original state.
         */
        this._initialState = { ...initialState } || {};

        /**
         * @private
         * @description The current state of the store.
         */
        this._state = { ...initialState } || {};
        
        /**
         * @private
         * @type {Set<Function>}
         */
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

    /**
     * Resets the store's state back to its original initial state.
     */
    resetState() {
        this._state = { ...this._initialState };
        // Notify subscribers that the state has changed
        this._subscribers.forEach(callback => callback());
    }
}