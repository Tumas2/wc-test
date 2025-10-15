// StatefulElement.js

export class StatefulElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {}; // Initialize a unified state object
        this._stores = null; // To hold the stores map

        // The render callback now syncs state before calling the view
        this._renderCallback = () => {
            this._syncState();
            this.view();
        };
    }

    connectedCallback() {
        this._stores = this.getStores(); // Get the map of stores
        if (typeof this._stores !== 'object' || this._stores === null) {
            throw new Error('getStores() must return a valid object of store instances.');
        }

        // Subscribe to every store in the map
        for (const key in this._stores) {
            const store = this._stores[key];
            store.subscribe(this._renderCallback);
        }

        this.render(); // Initial render
    }

    disconnectedCallback() {
        if (!this._stores) return;
        // Unsubscribe from every store
        for (const key in this._stores) {
            this._stores[key].unsubscribe(this._renderCallback);
        }
    }

    /**
     * New namespaced setState.
     * @param {string} storeName - The key of the store in the getStores() map.
     * @param {object} newState - The new state to set.
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
     * Private method to build the unified this.state object.
     */
    _syncState() {
        for (const key in this._stores) {
            this.state[key] = this._stores[key].getState();
        }
    }

    render() {
        this._syncState(); // Sync state before the first render
        this.view();
    }

    /**
     * Abstract method: Subclasses must implement this to return their stores.
     * @returns {Object.<string, {subscribe, getState, setState}>}
     */
    getStores() {
        throw new Error('The getStores() method must be implemented by the subclass.');
    }


    // --- HTML Templating & Event Binding Logic ---

    html(strings, ...values) {
        const fullHtml = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
        this.shadowRoot.innerHTML = fullHtml;

        this.shadowRoot.querySelectorAll('*').forEach(element => {
            for (const attr of element.attributes) {
                if (attr.name.startsWith('on')) {
                    const eventName = attr.name.substring(2);
                    const handlerName = attr.value;

                    if (typeof this[handlerName] === 'function') {
                        element.addEventListener(eventName, this[handlerName].bind(this));
                        element.removeAttribute(attr.name);
                    } else {
                        console.warn(`Method "${handlerName}" not found on component <${this.tagName.toLowerCase()}>.`);
                    }
                }
            }
        });
    }

    // --- Component Lifecycle & Abstract Methods ---

    /**
     * Abstract method: Subclasses must implement this to define their UI.
     * It should return the result of the `this.html` tagged template literal.
     */
    view() {
        throw new Error('The view() method must be implemented and return this.html`...`');
    }
}