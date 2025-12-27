"use strict";

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

    /**
     * Subscribes a callback function to be executed whenever the state changes.
     * @param {Function} callback - The function to call on state updates.
     */
    subscribe(callback) {
        this._subscribers.add(callback);
    }

    /**
     * Unsubscribes a callback function from state updates.
     * @param {Function} callback - The function to remove.
     */
    unsubscribe(callback) {
        this._subscribers.delete(callback);
    }

    /**
     * Returns the current state of the store.
     * @returns {object} The current state object (shallow copy).
     */
    getState() {
        return this._state;
    }

    /**
     * Updates the store's state and notifies subscribers.
     * @param {object} newState - The new state properties to merge.
     */
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