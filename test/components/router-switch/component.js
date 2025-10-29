import { StatefulElement, NanoRenderStatefulElement } from 'swc';
import { loadHTML } from '../../../src/html-loader.js';

class RouterSwitch extends StatefulElement {
    constructor() {
        super();
        this.style.display = 'block';
        /** @type {import('./router-store.js').RouterStore} */
        this.store = null;
    }

    connectedCallback() {
        const container = this.closest('router-container');
        if (!container || !container.store) {
            throw new Error('<router-switch> must be placed inside a <router-container>.');
        }
        this.store = container.store;

        // Register all child route paths with the central store
        const routes = Array.from(this.children)
            .filter(child => child.tagName === 'ROUTER-ROUTE')
            .map(child => child.getAttribute('path'));
        this.store.registerRoutes(routes);
        
        super.connectedCallback();
    }

    getStores() {
        // Provide the discovered store to the base class
        return { router: this.store };
    }

    async render() {
        this._syncState();
        const currentPath = this.state.router?.pathname;

        if (currentPath === undefined || currentPath === null) {
            this.html(['']);
            return;
        }

        let routeToRender = null;
        let catchAllRoute = null;
        let match = null;

        // Find the first matching route
        for (const child of this.children) {
            if (child.tagName !== 'ROUTER-ROUTE') continue;
            
            const routePath = child.getAttribute('path');
            if (routePath === '*') {
                catchAllRoute = child;
                continue;
            }

            // Use the store's own matching logic
            const routeMatch = this.store._matchPath(routePath, currentPath);
            if (routeMatch) {
                match = routeMatch;
                routeToRender = child;
                break; // Found the first match
            }
        }
        
        if (!routeToRender && catchAllRoute) {
            routeToRender = catchAllRoute;
            match = { params: {} }; // Reset params for catch-all
        }
        
        // Update the store with the params from the matched route
        const currentParams = JSON.stringify(this.state.router.params);
        const newParams = JSON.stringify(match ? match.params : {});
        if (currentParams !== newParams && this.store) {
            // Note: We only set params. The pathname is already set by the store.
            this.store.setState({ params: match ? match.params : {} });
        }
        
        let finalHtml = '';
        if (routeToRender) {
            const src = routeToRender.getAttribute('src');
            const noCache = routeToRender.hasAttribute('no-cache');
            if (src) {
                finalHtml = await loadHTML(src, !noCache);
            } else {
                finalHtml = routeToRender.innerHTML;
            }
        }

        const renderer = this.getRenderer();
        const context = { ...this.initialData(), ...this.state };
        this.html([renderer(finalHtml, context)]);
    }
}

customElements.define('router-switch', RouterSwitch);

