import { StatefulElement } from '../../StatefulElement.js';
import { navigate } from '../store.js';

export class RouterLink extends StatefulElement {
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
        const fullHref = (window.swc.router.BASE_PATH + to).replace(/\/\//g, '/');
        return `
            <a part="link" href="${fullHref}"><slot></slot></a>
        `;
    }
}

customElements.define('router-link', RouterLink);