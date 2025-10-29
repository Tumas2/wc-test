import { NanoRenderStatefulElement, StatefulElement } from 'swc';

class RouterLink extends StatefulElement {
    constructor() {
        super();
        /** @type {import('./router-store.js').RouterStore} */
        this.store = null;
        this.addEventListener('click', this.onClick);
    }

    connectedCallback() {
        const container = this.closest('router-container');
        if (!container || !container.store) {
            throw new Error('<router-link> must be placed inside a <router-container>.');
        }
        this.store = container.store;
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
        // Get the base path from the store to build the correct href
        const fullHref = (this.store?.basePath + to).replace(/\/\//g, '/');
        return `<a href="${fullHref}"><slot></slot></a>`;
    }
}

customElements.define('router-link', RouterLink);