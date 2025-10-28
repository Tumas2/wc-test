"use strict";

import { loadHTML } from './html-loader.js';

/**
 * A state-driven base class for creating powerful, reactive Web Components.
 * It provides state management, optional Handlebars.js templating,
 * Declarative Shadow DOM hydration, and automatic focus management.
 * @class StatefulElement
 * @extends {HTMLElement}
 */
export class StatefulElement extends HTMLElement {
    /**
     * @private
     * @static
     * @type {Map<string, Function>}
     * @description Caches compiled Handlebars templates, keyed by component tag name.
     */
    static _templateCache = new Map();

    /**
     * Creates an instance of StatefulElement.
     */
    constructor() {
        super();

        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
        }

        // Adopt any stylesheets provided by the component subclass.
        this.shadowRoot.adoptedStyleSheets = this.getStyles();

        /**
         * The component's unified state object, derived from its stores.
         * @type {object}
         */
        this.state = {};

        /**
         * The component's template string, loaded from an external file or DSD.
         * @type {string | null}
         */
        this.template = null;

        /**
         * @private
         * @type {object | null}
         * @description Holds the map of store instances provided by the component.
         */
        this._stores = null;

        /**
         * @private
         * @type {Array<{element: Element, eventName: string, handler: Function}>}
         * @description Tracks attached event listeners for automatic cleanup.
         */
        this._eventListeners = [];

        /**
         * @private
         * @type {Function}
         * @description The callback function passed to stores, bound to this.render.
         */
        this._renderCallback = this.render.bind(this);
    }

    /**
     * Lifecycle method called when the component is added to the DOM.
     * Handles template loading, DSD hydration, store subscriptions,
     * the initial render, and the onMount hook.
     * @returns {Promise<void>}
     */
    async connectedCallback() {
        let clientTemplateFound = false;

        const templatePath = this.getTemplatePath();
        if (templatePath) {
            this.template = await loadHTML(templatePath);
            clientTemplateFound = true;
        }

        if (!clientTemplateFound) {
            const viewHtml = this.view();
            if (viewHtml) {
                this.template = viewHtml;
                clientTemplateFound = true;
            }
        }

        if (!clientTemplateFound && this.shadowRoot && !this.template) {
            this.template = this.shadowRoot.innerHTML;
        }

        this._stores = this.getStores();
        if (typeof this._stores !== 'object' || this._stores === null) {
            throw new Error('getStores() must be implemented and return an object of store instances.');
        }

        for (const key in this._stores) {
            this._stores[key].subscribe(this._renderCallback);
        }

        // Perform the initial render
        this.render();

        // Call the user-defined mount hook after everything is ready.
        this.onMount();
    }

    /**
     * @abstract
     * A lifecycle hook that subclasses can implement to run setup logic
     * after the component is first connected and rendered to the DOM.
     * Ideal for fetching data or setting up intervals.
     * @example
     * async onMount() {
     * const response = await fetch('/api/data');
     * const data = await response.json();
     * this.setState('myStore', { items: data });
     * }
     */
    onMount() {
        // This method is intended to be overridden by subclasses.
    }

    /**
     * Lifecycle method called when the component is removed from the DOM.
     * Handles cleanup of listeners, subscriptions, and calls the onUnmount hook.
     */
    disconnectedCallback() {
        this._removeEventListeners();
        if (this._stores) {
            for (const key in this._stores) {
                this._stores[key].unsubscribe(this._renderCallback);
            }
        }
        // Call the user-defined unmount hook
        this.onUnmount();
    }

    /**
     * @abstract
     * A lifecycle hook that subclasses can implement to run cleanup logic
     * when the component is removed from the DOM.
     * @example
     * onUnmount() {
     * // This store will be reset every time the user leaves this route
     * this.resetState('myRouteSpecificStore');
     * }
     */
    onUnmount() {
        // This method is intended to be overridden by subclasses.
    }

    /**
     * Updates the state of a specified store, triggering a re-render.
     * @param {string} storeName - The key of the store as defined in getStores().
     * @param {object} newState - The new state to merge into the store.
     */
    setState(storeName, newState) {
        const store = this._stores[storeName];
        if (store) {
            store.setState(newState);
        } else {
            console.warn(`Store with name "${storeName}" not found.`);
        }
    }

    /**
     * Resets a specific store to its initial state.
     * @param {string} storeName The key of the store as defined in getStores().
     */
    resetState(storeName) {
        const store = this._stores?.[storeName];
        if (store && typeof store.resetState === 'function') {
            store.resetState();
        } else {
            // console.warn(`Store with name "${storeName}" not found or it does not have a resetState method.`);
        }
    }

    /**
     * The main render method. It syncs state and it gets a renderer
     * from the component and uses it to process the template.
     */
    render() {
        this._syncState();
        const renderer = this.getRenderer();
        const templateString = this.template || this.view() || '';

        const staticData = this.initialData();
        const context = this.deepMergeObjects(staticData, this.state);

        const finalHtml = renderer(templateString, context);
        this.html([finalHtml]);
    }

    deepMergeObjects(obj1, obj2) {
        const result = { ...obj1 };

        for (let key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
                    result[key] = this.deepMergeObjects(obj1[key], obj2[key]);
                } else {
                    result[key] = obj2[key];
                }
            }
        }

        return result;
    }

    /**
     * @abstract
     * Subclasses can implement this to provide static, non-reactive data
     * to be used in the template.
     * @returns {object} An object of static data.
     */
    initialData() {
        return {}; // Default to no static data
    }

    /**
     * Subclasses can override this method to provide a different rendering engine.
     * If not overridden, it defaults to a simple built-in interpolator.
     * @returns {(template: string, data: object) => string} A function for rendering templates.
     */
    getRenderer() {
        // Return the built-in interpolator as the default.
        return this._interpolate;
    }

    // --- Abstract Methods (to be implemented by subclasses) ---

    /**
     * @abstract
     * Subclasses should implement this to provide a map of store instances.
     * @returns {Object.<string, {subscribe: Function, getState: Function, setState: Function}>} An object mapping names to stores.
     * @example
     * import { userStore } from './user-store.js';
     * 
     * getStores() {
     *     return {
     *         user: userStore
     *     };
     * }
     */
    getStores() {
        return {}
        // throw new Error('The getStores() method must be implemented by the subclass.');
    }

    /**
     * @abstract
     * Subclasses can implement this to provide a path to an external HTML template file.
     * @returns {string | null} A path to an HTML file, or null.
     * @example
     * getTemplatePath() {
     *     return new URL('template.html', import.meta.url).pathname;
     * }
     */
    getTemplatePath() {
        return null;
    }

    /**
     * @abstract
     * Subclasses can implement this to provide an array of imported CSSStyleSheet objects.
     * @returns {CSSStyleSheet[]} An array of stylesheets to adopt.
     * @example
     * import styles from './styles.css' with { type: 'css' };
     *
     * getStyles() {
     *     return [styles];
     * }
     */
    getStyles() {
        return [];
    }

    /**
     * @abstract
     * Subclasses can implement this to provide an inline template string.
     * It is used if getTemplatePath() is not provided.
     * @returns {string} An HTML string with placeholders.
     * @example
     * view() {
     *     return `<h2>Hello, {{user.name}}!</h2>`;
     * }
     */
    view() {
        return '';
    }

    // --- Internal Helper Methods ---

    /**
     * @private
     * Renders an HTML string, wires up event listeners, and manages focus.
     * @param {string[]} strings - The string parts of a template literal.
     * @param {...any} values - The interpolated values.
     */
    html(strings, ...values) {
        let activeElementId = null;
        let activeElementPath = null;
        let selectionStart, selectionEnd;
        const activeEl = this.shadowRoot.activeElement;

        if (activeEl) {
            if (activeEl.id) {
                activeElementId = activeEl.id;
            } else {
                activeElementPath = this._getElementPath(activeEl);
            }
            selectionStart = activeEl.selectionStart;
            selectionEnd = activeEl.selectionEnd;
        }

        this._removeEventListeners();
        const fullHtml = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
        // TODO: Switch to setHTML when in stable
        this.shadowRoot.setHTMLUnsafe(fullHtml);

        this.shadowRoot.querySelectorAll('*').forEach(element => {
            for (const attr of element.attributes) {
                if (attr.name.startsWith('on')) {
                    const eventName = attr.name.substring(2);
                    const handlerName = attr.value;
                    if (typeof this[handlerName] === 'function') {
                        const handler = this[handlerName].bind(this);
                        element.addEventListener(eventName, handler);
                        this._eventListeners.push({ element, eventName, handler });
                        element.removeAttribute(attr.name);
                    } else {
                        console.warn(`Method "${handlerName}" not found on component <${this.tagName.toLowerCase()}>.`);
                    }
                }
            }
        });

        let newActiveElement = null;
        if (activeElementId) {
            newActiveElement = this.shadowRoot.querySelector(`#${activeElementId}`);
        } else if (activeElementPath) {
            newActiveElement = this._getElementByPath(activeElementPath);
        }

        if (newActiveElement) {
            newActiveElement.focus();
            if (typeof selectionStart === 'number' && typeof newActiveElement.setSelectionRange === 'function') {
                newActiveElement.setSelectionRange(selectionStart, selectionEnd);
            }
        }
    }

    /**
     * @private
     * The built-in templating engine. Replaces {{key}} or {{key || 'fallback'}} placeholders.
     * @param {string} template - The template string.
     * @param {object} data - The state object.
     * @returns {string} The interpolated HTML string.
     */
    _interpolate(template, data) {
        if (!template) return '';

        // This regex now captures the key and an optional fallback value.
        // It matches: {{ key.path || 'fallback' }}
        return template.replace(/{{\s*([\w.]+)\s*(?:\|\|\s*(['"])(.*?)\2)?\s*}}/g, (match, key, quote, fallback) => {
            // 1. Resolve the key to get its value from the state object.
            const value = key.split('.').reduce((obj, prop) => obj && obj[prop], data);

            // 2. If the value is valid (not null or undefined), return it.
            if (value !== null && value !== undefined) {
                return value;
            }

            // 3. If the value is invalid, check if a fallback was provided.
            if (fallback !== undefined) {
                return fallback;
            }

            // 4. If no value and no fallback, return an empty string.
            return '';
        });
    }

    /**
     * @private
     * Syncs the component's `this.state` property with the latest state from all stores.
     */
    _syncState() {
        if (!this._stores) return;
        for (const key in this._stores) {
            this.state[key] = this._stores[key].getState();
        }
    }

    /**
     * @private
     * Removes all tracked event listeners to prevent memory leaks.
     */
    _removeEventListeners() {
        this._eventListeners.forEach(({ element, eventName, handler }) => {
            element.removeEventListener(eventName, handler);
        });
        this._eventListeners = [];
    }

    /**
     * @private
     * Calculates a positional path to an element within the shadow DOM.
     * @param {HTMLElement} element The element to find the path for.
     * @returns {number[]} An array of indices representing the path.
     */
    _getElementPath(element) {
        const path = [];
        let current = element;
        while (current && current.parentNode !== this.shadowRoot) {
            const parent = current.parentNode;
            if (!parent || !parent.children) return path; // Should not happen in valid DOM
            const index = Array.from(parent.children).indexOf(current);
            path.unshift(index);
            current = parent;
        }
        if (current) {
            const index = Array.from(this.shadowRoot.children).indexOf(current);
            path.unshift(index);
        }
        return path;
    }

    /**
     * @private
     * Finds an element within the shadow DOM using a positional path.
     * @param {number[]} path An array of indices.
     * @returns {Element | null} The found element or null.
     */
    _getElementByPath(path) {
        let element = this.shadowRoot;
        for (const index of path) {
            if (!element || !element.children || !element.children[index]) {
                return null;
            }
            element = element.children[index];
        }
        return element;
    }
}