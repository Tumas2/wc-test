import { NanoRenderStatefulElement } from 'swc';

import { routerStore } from '../../stores/routerStore.js'; // Ensures the store is initialized

class RouterRoute extends NanoRenderStatefulElement {
    getStores() {
        return { router: routerStore };
    }

    /**
     * We override the base render method for this component's special logic.
     * This ensures state is always synced before we try to use it.
     */
    render() {
        // First, sync state from the stores.
        this._syncState();

        // Guard against the state not being ready on the very first render cycle.
        if (!this.state.router) {
            this.html ``; // Render nothing if the router state isn't initialized yet.
            return;
        }

        const routePath = this.getAttribute('path');
        const currentPath = this.state.router.pathname;
        
        const match = this.matchPath(routePath, currentPath);

        // This side-effect updates the store with URL params if the route matches.
        if (match) {
            // FIX: Check if params are different before setting state to prevent infinite loop.
            const currentParams = JSON.stringify(this.state.router.params);
            const newParams = JSON.stringify(match.params);

            if (currentParams !== newParams) {
                routerStore.setState({ params: match.params });
            }
        }

        // Use the base html() method to render, which handles focus management.
        this.html([
            match ? `<slot></slot>` : ''
        ]);
    }

    /**
     * Matches a route path against the current URL path.
     * Supports dynamic segments (e.g., /users/:id).
     * @param {string} routePath The path pattern from the component's attribute.
     * @param {string} currentPath The current path from the router store.
     * @returns {object|null} A match object with params, or null.
     */
    matchPath(routePath, currentPath) {
        const paramNames = [];
        // Ensure routePath and currentPath are strings to prevent errors
        const safeRoutePath = String(routePath || '');
        const safeCurrentPath = String(currentPath || '');

        const regexPath = safeRoutePath.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^\\/]+)';
        });

        const regex = new RegExp(`^${regexPath}$`);
        const match = safeCurrentPath.match(regex);

        if (!match) return null;

        const params = paramNames.reduce((acc, name, index) => {
            acc[name] = match[index + 1];
            return acc;
        }, {});

        return { path: match[0], params };
    }

    // This component doesn't use a template file or an inline view.
    view() { return ''; }
}
customElements.define('router-route', RouterRoute);
