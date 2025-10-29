import { StatefulElement } from '../../StatefulElement.js';

export class RouterContainer extends StatefulElement {
    // This component is for initialization only and does not render content.
    view() {
        return `<slot></slot>`;
    }
}

customElements.define('router-container', RouterContainer);
