export { StateStore } from '../../src/store.js';
export { loadHTML } from '../../src/html-loader.js';
export { StatefulElement } from '../../src/StatefulElement.js';
export { NanoRenderStatefulElement } from '../../src/NanoRenderer.js'


import { NanoRenderer } from '../../src/NanoRenderer.js'

import {
    RouterContainer,
    RouterSwitch,
    RouterRoute,
    RouterLink,
} from '../../src/router/index.js';

const renderer = new NanoRenderer();

export class NanoRenderRouterContainer extends RouterContainer {
    getRenderer = () => renderer.render
}

export class NanoRenderRouterSwitch extends RouterSwitch {
    getRenderer = () => renderer.render
}

// export class NanoRenderRouterRoute extends RouterRoute {
//     getRenderer = () => renderer.render
// }

export class NanoRenderRouterLink extends RouterLink {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.insertRule("a{color:var(--link-color);}");
        return [sheet];
    }

    getRenderer = () => renderer.render
}

customElements.define('router-container', NanoRenderRouterContainer);
customElements.define('router-switch', NanoRenderRouterSwitch);
// customElements.define('router-route', NanoRenderRouterRoute);
customElements.define('router-link', NanoRenderRouterLink);