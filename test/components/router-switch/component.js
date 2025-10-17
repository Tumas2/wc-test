import { StatefulElement } from '../../../src/StatefulElement.js';
import { routerStore } from '../../stores/routerStore.js';

class RouterSwitch extends StatefulElement {
    constructor() {
        super();
        // FIX: Ensure the switch itself is a block container so it can host
        // the visible block-level route components.
        this.style.display = 'block';
    }

    getStores() {
        return { router: routerStore };
    }

    render() {
        this._syncState();

        const currentPath = this.state.router?.pathname;
        if (currentPath === undefined) {
            return; // Exit early if the path isn't available yet
        }

        let hasMatch = false;
        let catchAllRoute = null;

        for (const child of this.children) {
            if (child.tagName === 'ROUTER-ROUTE' && child.getAttribute('path') === '*') {
                catchAllRoute = child;
                break;
            }
        }

        for (const child of this.children) {
            if (child.tagName !== 'ROUTER-ROUTE' || child.getAttribute('path') === '*') {
                continue;
            }

            const routePath = child.getAttribute('path');
            const match = this.matchPath(routePath, currentPath);

            if (match && !hasMatch) {
                hasMatch = true;
                child.style.display = 'block';
                const currentParams = JSON.stringify(this.state.router.params);
                const newParams = JSON.stringify(match.params);
                if (currentParams !== newParams) {
                    routerStore.setState({ params: match.params });
                }
            } else {
                child.style.display = 'none';
            }
        }

        if (catchAllRoute) {
            catchAllRoute.style.display = hasMatch ? 'none' : 'block';
        }

        this.html([
            `<slot></slot>`
        ]);
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

    view() { return `<slot></slot>`; }
}

customElements.define('router-switch', RouterSwitch);
