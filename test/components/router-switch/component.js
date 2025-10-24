import { StatefulElement } from '../../../src/StatefulElement.js';
import { routerStore } from '../../stores/routerStore.js';
import { loadHTML } from '../../../src/html-loader.js';

import globalStyles from '../../styles.css' with { type: 'css' };

class RouterSwitch extends StatefulElement {
    constructor() {
        super();
        this.style.display = 'block';
    }

    getStyles() {
        return [
            globalStyles, 
        ];
    }

    connectedCallback() {
        const routes = Array.from(this.children)
            .filter(child => child.tagName === 'ROUTER-ROUTE')
            .map(child => child.getAttribute('path'));
        routerStore.registerRoutes(routes);

        super.connectedCallback();
    }

    getStores() {
        return { router: routerStore };
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

        for (const child of this.children) {
            if (child.tagName !== 'ROUTER-ROUTE') continue;

            const routePath = child.getAttribute('path');
            if (routePath === '*') {
                catchAllRoute = child;
                continue;
            }

            const match = this.matchPath(routePath, currentPath);
            if (match) {
                routeToRender = child;
                break; // We only render the first match
            }
        }

        if (!routeToRender) {
            routeToRender = catchAllRoute;
        }

        let finalHtml = '';
        if (routeToRender) {
            const src = routeToRender.getAttribute('src');
            if (src) {
                finalHtml = await loadHTML(src);
            } else {
                finalHtml = routeToRender.innerHTML;
            }
        }

        const renderer = this.getRenderer();
        const context = { ...this.initialData(), ...this.state };
        this.html([renderer(finalHtml, context)]);
    }

    /**
     * Matches a route path against the current URL path.
     * Now supports wildcard (*) for nested routes.
     */
    matchPath(routePath, currentPath) {
        let isPrefixMatch = false;
        let pathPattern = String(routePath || '');

        // Handle wildcard for nested routes
        if (pathPattern.endsWith('/*')) {
            isPrefixMatch = true;
            pathPattern = pathPattern.slice(0, -2); // Remove '/*'
        }

        const paramNames = [];
        const regexPath = pathPattern.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^\\/]+)';
        });

        // If it's a prefix match, don't anchor the regex to the end ($)
        const regex = new RegExp(`^${regexPath}${isPrefixMatch ? '' : '$'}`);
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

