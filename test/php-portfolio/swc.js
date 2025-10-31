export { StateStore } from '../../src/store.js';
export { loadHTML } from '../../src/html-loader.js';
export { StatefulElement } from '../../src/StatefulElement.js'
export { NanoRenderStatefulElement } from '../../src/NanoRenderer.js'

import { StatefulElement } from '../../src/StatefulElement.js';
import { NanoRenderer } from '../../src/NanoRenderer.js'

import {
    RouterContainer,
    RouterSwitch,
    RouterRoute,
    RouterLink,
} from '../../src/router/index.js';

import globalStyles from './output.css' with { type: 'css' };

const renderer = new NanoRenderer();

export class CustomStatefulElement extends StatefulElement {
    getRenderer = () => renderer.render
    getStyles = () => [globalStyles]
}

export class NanoRenderRouterContainer extends RouterContainer {
    getRenderer = () => renderer.render
    getStyles = () => [globalStyles]
}

export class NanoRenderRouterSwitch extends RouterSwitch {
    getRenderer = () => renderer.render
    getStyles = () => [globalStyles]
}

// export class NanoRenderRouterRoute extends RouterRoute {
//     getRenderer = () => renderer.render
//     getStyles = () => [globalStyles]
// }

export class NanoRenderRouterLink extends RouterLink {
    getRenderer = () => renderer.render
    getStyles = () => [globalStyles]
}

customElements.define('router-container', NanoRenderRouterContainer);
customElements.define('router-switch', NanoRenderRouterSwitch);
// customElements.define('router-route', NanoRenderRouterRoute);
customElements.define('router-link', NanoRenderRouterLink);