import { StatefulElement, NanoRenderStatefulElement } from 'swc';
import { loadHTML } from '../../../src/html-loader.js';

export class RouterSwitch extends NanoRenderStatefulElement {
    constructor() {
        super();
        this.style.display = 'block';
        /** @type {import('./router-store.js').RouterStore} */
        this.store = null;
    }

    connectedCallback() {
        // 1. Try to find a container in the light DOM (for top-level switches)
        let provider = this.closest('router-container');

        // 2. If not found, we're a nested switch in a shadow DOM. Get the host.
        if (!provider) {
            const rootNode = this.getRootNode();
            if (rootNode.host) {
                // The host will be the parent <router-switch>
                provider = rootNode.host;
            }
        }

        // 3. Check the provider for the store.
        if (!provider || !provider.store) {
            throw new Error('<router-switch> must be placed inside a <router-container> or another <router-switch>.');
        }
        this.store = provider.store;

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

        // --- THIS ENTIRE BLOCK HAS BEEN REMOVED TO PREVENT THE INFINITE LOOP ---
        // The router-store is now the single source of truth for params.
        // const currentParams = JSON.stringify(this.state.router.params);
        // const newParams = JSON.stringify(match ? match.params : {});
        // if (currentParams !== newParams && this.store) {
        //     this.store.setState({ params: match ? match.params : {} });
        // }
        // --- END OF REMOVED BLOCK ---

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

