import { StateStore } from "../../src/store.js";
import { BASE_PATH } from '../../router-config.js'


class RouterStore extends StateStore {
    constructor() {
        super({ pathname: null, params: {} });
        this._routes = []; // A registry for all route paths
        window.addEventListener('popstate', this._onURLChange.bind(this));
    }

    /**
     * Called by the <router-switch> to register all available route paths.
     * @param {string[]} routes - An array of path strings (e.g., ['/', '/about', '/users/:id']).
     */
    registerRoutes(routes) {
        this._routes = routes;
        // Perform an initial URL check now that we know the routes
        this._onURLChange();
    }

    _onURLChange() {
        const currentPath = this._getRelativePath();
        let params = {};
        
        // Find the matching route and extract its params
        for (const routePath of this._routes) {
            const match = this._matchPath(routePath, currentPath);
            if (match) {
                params = match.params;
                break;
            }
        }
        
        // Set the full state, including the calculated params
        this.setState({ pathname: currentPath, params });
    }

    _getRelativePath() {
        const path = window.location.pathname;
        if (path.startsWith(BASE_PATH)) {
            return '/' + path.substring(BASE_PATH.length);
        }
        return path;
    }

    _matchPath(routePath, currentPath) {
        const paramNames = [];
        const regexPath = String(routePath || '').replace(/:(\w+)/g, (_, name) => {
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

export const routerStore = new RouterStore();

export function navigate(to) {
    const fullPath = (BASE_PATH + to).replace(/\/\//g, '/');
    window.history.pushState({}, '', fullPath);
    routerStore._onURLChange();
}

