import { StatefulElement } from '../../../src/StatefulElement.js';
import { routerStore } from '../../stores/routerStore.js';
import { loadHTML } from '../../../src/html-loader.js';

class RouterSwitch extends StatefulElement {
    constructor() {
        super();
        this.style.display = 'block';
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

        // FIX: Add a guard clause. Do not render anything until the router
        // store has a valid path. This prevents child components from being
        // created prematurely with an empty state.
        if (currentPath === undefined || currentPath === null) {
            this.html(['']); // Render nothing while waiting for the router to initialize
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

            const match = routerStore._matchPath(routePath, currentPath);
            if (match) {
                routeToRender = child;
                break;
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
}

customElements.define('router-switch', RouterSwitch);

