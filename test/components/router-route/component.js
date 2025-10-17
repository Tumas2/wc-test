import { StatefulElement } from '../../../src/StatefulElement.js';

class RouterRoute extends StatefulElement {
    // The constructor that was hiding the element has been removed.
    // The parent <router-switch> is now fully responsible for visibility.
    
    // This component no longer needs to connect to the store or perform any logic.
    getStores() { return {}; }

    view() { return `<slot></slot>`; }
}
customElements.define('router-route', RouterRoute);
