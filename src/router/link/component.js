import { NanoRenderStatefulElement, StatefulElement } from 'swc';

export class RouterLink extends StatefulElement {
    constructor() {
        super();
        /** @type {import('./router-store.js').RouterStore} */
        this.store = null;
        this.addEventListener('click', this.onClick);
    }

    connectedCallback() {
        // 1. Try to find a container in the light DOM (for top-level links)
        let provider = this.closest('router-container');

        // 2. If not found, we're likely in a shadow DOM. Get the host element.
        if (!provider) {
            const rootNode = this.getRootNode();
            if (rootNode.host) {
                // The host will be the <router-switch> that rendered us.
                provider = rootNode.host;
            }
        }

        // 3. Check the provider for the store.
        if (!provider || !provider.store) {
            throw new Error('<router-link> must be placed inside a <router-container> or <router-switch>.');
        }

        this.store = provider.store;
        super.connectedCallback();
    }

    onClick(event) {
        event.preventDefault();
        const to = this.getAttribute('to');
        if (to && this.store) {
            this.store.navigate(to);
        }
    }

    view() {
        const to = this.getAttribute('to') || '#';
        // Get the base path from the store (which we are guaranteed to have by this point)
        const basePath = this.store ? this.store.basePath : '/';
        const fullHref = (basePath + to).replace(/\/\//g, '/');
        return `<a part="link" href="${fullHref}"><slot></slot></a>`;
    }
}