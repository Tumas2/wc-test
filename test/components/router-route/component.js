import { StatefulElement } from '../../../src/StatefulElement.js';
import { loadHTML } from '../../../src/html-loader.js';
import { routerStore } from '../../stores/routerStore.js'; // Import the router store

class RouterRoute extends StatefulElement {
    constructor() {
        super();
        this.style.display = 'none';
        this._loadedContent = null;
        this._hasLoaded = false;
    }

    /**
     * This component now needs to know about the router's state
     * to access URL parameters (like :id).
     */
    getStores() {
        return { router: routerStore };
    }

    /**
     * Called by <router-switch> when this route becomes active.
     */
    async activate() {
        this.style.display = 'block';
        const src = this.getAttribute('src');

        // Ensure the component's state is up-to-date before rendering
        this._syncState();

        // Get the chosen renderer (default or custom)
        const renderer = this.getRenderer();
        
        // Merge static data and dynamic state into a single context object
        const context = { ...this.initialData(), ...this.state };

        if (src && !this._hasLoaded) {
            this.html([`<p>Loading...</p>`]);
            try {
                const templateString = await loadHTML(src);
                this._loadedContent = templateString;
                this._hasLoaded = true;

                // FIX: Run the fetched template through the renderer with the state context
                const finalHtml = renderer(this._loadedContent, context);
                this.html([finalHtml]);

            } catch (err) {
                console.error(`Failed to load route content from ${src}:`, err);
                this.html([`<p>Error: Could not load content.</p>`]);
            }
        } else if (this._loadedContent) {
            // If already loaded, just re-render the cached content with the latest state
            const finalHtml = renderer(this._loadedContent, context);
            this.html([finalHtml]);
        } else {
            // If no 'src', render the slot to show projected components
            this.html([`<slot></slot>`]);
        }
    }

    /**
     * Called by <router-switch> when this route becomes inactive.
     */
    deactivate() {
        this.style.display = 'none';
    }

    view() {
        return `<slot></slot>`;
    }
}

customElements.define('router-route', RouterRoute);

