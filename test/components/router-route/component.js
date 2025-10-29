import { StatefulElement, NanoRenderStatefulElement } from 'swc';

class RouterRoute extends StatefulElement {
    view() {
        return `<slot></slot>`;
    }
}

customElements.define('router-route', RouterRoute);

