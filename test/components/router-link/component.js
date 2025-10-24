import { StatefulElement } from '../../../src/StatefulElement.js';
import { navigate } from '../../stores/routerStore.js';

import { BASE_PATH } from '../../../router-config.js';

class RouterLink extends StatefulElement {
    constructor() {
        super();
        this.addEventListener('click', this.onClick);
    }
    
    onClick(event) {
        event.preventDefault();
        const to = this.getAttribute('to');
        if (to) {
            navigate(to);
        }
    }

    view() {
        const to = this.getAttribute('to') || '#';
        // Construct the full href for accessibility and "open in new tab"
        const fullHref = (BASE_PATH + to).replace(/\/\//g, '/');
        return `
            <a part="link" href="${fullHref}"><slot></slot></a>
        `;
    }
}

customElements.define('router-link', RouterLink);