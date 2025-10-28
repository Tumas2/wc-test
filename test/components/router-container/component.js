import { NanoRenderStatefulElement } from 'swc';

import 'stores/routerStore.js'; // Ensures the store is initialized

class RouterContainer extends NanoRenderStatefulElement {
    // This component is for initialization only and does not render content.
    view() {
        return `<slot></slot>`;
    }
}

customElements.define('router-container', RouterContainer);
