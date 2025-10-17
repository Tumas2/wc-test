import { StateStore } from "../../src/store.js";

import { BASE_PATH } from '../../router-config.js'

export const routerStore = new StateStore({
    pathname: getRelativePath(window.location.pathname),
    params: {}
});

function getRelativePath(fullPath) {
    if (fullPath.startsWith(BASE_PATH)) {
        let relativePath = fullPath.substring(BASE_PATH.length);
        if (!relativePath.startsWith('/')) {
            relativePath = '/' + relativePath;
        }
        return relativePath;
    }
    return fullPath;
}

/**
 * Navigates to a new app-relative path.
 * @param {string} relativePath - The path within the app (e.g., '/about').
 */
export function navigate(relativePath) {
    // FIX: Ensure the BASE_PATH is prepended to the path used for the browser URL bar.
    const fullPath = (BASE_PATH + relativePath).replace(/\/\//g, '/');
    
    // This updates the URL in the browser's address bar.
    window.history.pushState({}, '', fullPath);
    
    // This updates the internal state so the correct component renders.
    routerStore.setState({ pathname: relativePath });
}

window.addEventListener('popstate', () => {
    const relativePath = getRelativePath(window.location.pathname);
    routerStore.setState({ pathname: relativePath });
});