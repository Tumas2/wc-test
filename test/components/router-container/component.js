import { StatefulElement } from '../../../src/StatefulElement.js';

import '../../stores/routerStore.js'; // Ensures the store is initialized

class RouterContainer extends StatefulElement {
    // This component is for initialization only and does not render content.
    view() {
        return `<slot></slot>`;
    }
}

customElements.define('router-container', RouterContainer);
