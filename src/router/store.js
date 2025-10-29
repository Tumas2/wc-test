import { StateStore } from "swc";


export class RouterStore extends StateStore {
    constructor(BASE_PATH = '/') {
        window.swc = { ...window?.swc }
        window.swc.router = { BASE_PATH }
        super({ pathname: null, params: {} });
        this._routes = new Set(); // Use a Set to avoid duplicate route paths
        window.addEventListener('popstate', this._onURLChange.bind(this));
    }

    /**
     * Called by <router-switch> components to register their available route paths.
     * @param {string[]} routes - An array of path strings.
     */
    registerRoutes(routes) {
        let hasNewRoutes = false;
        routes.forEach(route => {
            // Check if this is a route we haven't seen before.
            if (!this._routes.has(route)) {
                this._routes.add(route);
                hasNewRoutes = true;
            }
        });

        // FIX: Re-evaluate the URL if our knowledge of the application's routes has changed.
        // This is crucial for nested routes which register themselves after the initial page load.
        // This check also prevents infinite loops, as re-registering the same routes will not trigger a state change.
        if (hasNewRoutes) {
            this._onURLChange();
        }
    }

    _onURLChange() {
        const currentPath = this._getRelativePath();
        let bestMatch = null;

        // Find all matching routes and determine the most specific one.
        for (const routePath of this._routes) {
            const match = this._matchPath(routePath, currentPath);
            if (match) {
                // A longer matched path is considered more specific.
                if (!bestMatch || match.path.length > bestMatch.path.length) {
                    bestMatch = match;
                }
            }
        }

        const params = bestMatch ? bestMatch.params : {};
        this.setState({ pathname: currentPath, params });
    }

    _getRelativePath() {
        const path = window.location.pathname;
        if (path.startsWith(window.swc.router.BASE_PATH)) {
            // Ensure leading slash is present, but not duplicated
            return '/' + path.substring(window.swc.router.BASE_PATH.length).replace(/^\/+/, '');
        }
        return path;
    }

    _matchPath(routePath, currentPath) {
        let isPrefixMatch = false;
        let pathPattern = String(routePath || '');

        if (pathPattern.endsWith('/*')) {
            isPrefixMatch = true;
            pathPattern = pathPattern.slice(0, -2);
        }

        const paramNames = [];
        const regexPath = pathPattern.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^\\/]+)';
        });

        const regex = new RegExp(`^${regexPath}${isPrefixMatch ? '' : '$'}`);
        const match = String(currentPath || '').match(regex);

        if (!match) return null;

        const params = paramNames.reduce((acc, name, index) => {
            acc[name] = match[index + 1];
            return acc;
        }, {});

        return { path: match[0], params };
    }

    navigate(to) {
        const fullPath = (window.swc.router.BASE_PATH + to).replace(/\/\//g, '/');
        window.history.pushState({}, '', fullPath);
        this._onURLChange();
    }
}

// export const routerStore = new RouterStore(window.swc.router.BASE_PATH);