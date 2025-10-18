import { loadHTML } from '../../../src/html-loader.js';
import { StatefulElement } from '../../../src/StatefulElement.js';
import { routerStore } from '../../stores/routerStore.js';

class RouterSwitch extends StatefulElement {
    constructor() {
        super();
        this.style.display = 'block';
    }

    getStores() {
        return { router: routerStore };
    }

    /**
     * The render method now destroys and re-creates the route content.
     */
    async render() {
        this._syncState();
        const currentPath = this.state.router?.pathname;
        if (currentPath === undefined) return;

        let match = null;
        let routeToRender = null;
        let catchAllRoute = null;

        // Find the first matching route or the catch-all
        for (const child of this.children) {
            if (child.tagName !== 'ROUTER-ROUTE') continue;

            const routePath = child.getAttribute('path');
            if (routePath === '*') {
                catchAllRoute = child;
                continue;
            }

            if (!match) {
                const routeMatch = this.matchPath(routePath, currentPath);
                if (routeMatch) {
                    match = routeMatch;
                    routeToRender = child;
                }
            }
        }

        // If no specific route matched, use the catch-all
        if (!routeToRender && catchAllRoute) {
            routeToRender = catchAllRoute;
            match = { params: {} };
        }

        // Update the store with the new params
        const currentParams = JSON.stringify(this.state.router.params);
        const newParams = JSON.stringify(match ? match.params : {});
        if (currentParams !== newParams) {
            routerStore.setState({ params: match ? match.params : {} });
        }

        // Get the content for the matched route
        let finalHtml = '<p>Route not found</p>'; // Default content
        if (routeToRender) {
            const src = routeToRender.getAttribute('src');
            if (src) {
                // If there's a src, lazy-load the content from the file
                finalHtml = await loadHTML(src);
            } else {
                // Otherwise, use the content from inside the <router-route> tag
                finalHtml = routeToRender.innerHTML;
            }
        }

        // Render the final HTML into this component's shadow DOM
        // The renderer will process any placeholders in the loaded content
        const renderer = this.getRenderer();
        const context = { ...this.initialData(), ...this.state };
        this.html([renderer(finalHtml, context)]);
    }

    /**
     * Matches a route path against the current URL path.
     * @param {string} routePath The path pattern from the component's attribute.
     * @param {string} currentPath The current path from the router store.
     * @returns {object|null} A match object with params, or null.
     */
    matchPath(routePath, currentPath) {
        const paramNames = [];
        let pathPattern = String(routePath || '');

        if (pathPattern === '*') {
            pathPattern = '.*';
        }

        const regexPath = pathPattern.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^\\/]+)';
        });

        const regex = new RegExp(`^${regexPath}$`);
        const match = String(currentPath || '').match(regex);

        if (!match) return null;

        const params = paramNames.reduce((acc, name, index) => {
            acc[name] = match[index + 1];
            return acc;
        }, {});

        return { path: match[0], params };
    }
}

customElements.define('router-switch', RouterSwitch);

