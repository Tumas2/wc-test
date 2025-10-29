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
     * Creates an instance of StatefulElement.
     */
    constructor() {
        super();

        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
        }

        this.shadowRoot.adoptedStyleSheets = this.getStyles();
        this.state = {};
        this.template = null;
        this._stores = null;
        this._eventListeners = [];
        this._renderCallback = this.render.bind(this);
    }

    /**
     * Lifecycle method called when the component is added to the DOM.
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

        this.render();
        this.onMount();
    }

    /**
     * Lifecycle method called when the component is removed from the DOM.
     */
    disconnectedCallback() {
        this._removeEventListeners();
        if (this._stores) {
            for (const key in this._stores) {
                this._stores[key].unsubscribe(this._renderCallback);
            }
        }
        this.onUnmount();
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
        const store = this._stores[storeName];
        if (store && typeof store.resetState === 'function') {
            store.resetState();
        } else {
            console.warn(`Store with name "${storeName}" not found or it does not have a resetState method.`);
        }
    }

    /**
     * The main render method. Passes template and data to the chosen renderer.
     * It syncs state and performs a one-level-deep merge of initialData and state.
     */
    render() {
        this._syncState(); // Populates this.state
        const initialComponentData = this.initialData();

        // Start with all properties from initialData
        const context = { ...initialComponentData };

        // Now, intelligently merge the state on top
        for (const key in this.state) {
            if (Object.prototype.hasOwnProperty.call(this.state, key)) {
                const stateValue = this.state[key];
                const initialValue = context[key];

                // If both the state value and the initial value are plain objects,
                // perform a one-level-deep merge.
                if (
                    typeof stateValue === 'object' && stateValue !== null && !Array.isArray(stateValue) &&
                    typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)
                ) {
                    context[key] = {
                        ...initialValue, // Start with initial data's properties
                        ...stateValue     // Override with state's properties
                    };
                } else {
                    // Otherwise, just let the state value replace the initial value.
                    context[key] = stateValue;
                }
            }
        }

        const renderer = this.getRenderer();
        const templateString = this.template || this.view() || '';

        // Pass the fully merged context to the renderer
        const finalHtml = renderer(templateString, context);

        this.html([finalHtml]);
    }

    // --- Abstract Methods (to be implemented by subclasses) ---

    /**
     * @abstract
     * Subclasses can implement this to provide a map of store instances.
     * Defaults to an empty object for components without state.
     * @returns {Object.<string, {subscribe: Function, getState: Function, setState: Function}>}
     */
    getStores() {
        return {}; // Default to no stores
    }

    /**
     * @abstract
     * Subclasses can implement this to provide a path to an external HTML template file.
     * @returns {string | null}
     */
    getTemplatePath() {
        return null;
    }

    /**
     * @abstract
     * Subclasses can implement this to provide an array of imported CSSStyleSheet objects.
     * @returns {CSSStyleSheet[]}
     */
    getStyles() {
        return [];
    }

    /**
     * @abstract
     * Subclasses can implement this to provide an inline template string.
     * @returns {string}
     */
    view() {
        return '';
    }

    /**
     * @abstract
     * Subclasses can implement this to provide static, non-reactive data.
     * @returns {object}
     */
    initialData() {
        return {};
    }

    /**
     * Subclasses can override this method to provide a different rendering engine.
     * If not overridden, it defaults to a "raw" renderer that does no interpolation.
     * @returns {(template: string, data: object) => string} A function for rendering templates.
     * @example
     * // To use your NanoRenderer:
     * import { NanoRenderer } from './NanoRenderer.js';
     * const nano = new NanoRenderer();
     * * getRenderer() {
     * return nano.render;
     * }
     */
    getRenderer() {
        return this._rawRenderer;
    }

    /**
     * @abstract
     * A lifecycle hook called after the component is first connected and rendered.
     */
    onMount() {
        // This method is intended to be overridden by subclasses.
    }

    /**
     * @abstract
     * A lifecycle hook called when the component is removed from the DOM.
     */
    onUnmount() {
        // This method is intended to be overridden by subclasses.
    }

    // --- Internal Helper Methods ---

    /**
     * @private
     * The default "raw" renderer. It does no processing and just returns the template string.
     * @param {string} template - The template string.
     * @returns {string} The original template string.
     */
    _rawRenderer(template) {
        return template || '';
    }

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
        this.shadowRoot.innerHTML = fullHtml;

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
            if (!parent || !parent.children) return path;
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
