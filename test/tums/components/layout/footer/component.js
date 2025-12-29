import { NanoRenderStatefulElement } from '../../../swc.js';

export class MainFooter extends NanoRenderStatefulElement {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host { display: block; border-top: 1px solid var(--border-color); padding: 2rem 0; margin-top: auto; }
            .container { text-align: center; color: #6b7280; font-size: 0.875rem; }
        `);
        return [sheet];
    }
    view() {
        return `<div class="container">&copy; ${new Date().getFullYear()} Tums. Built with SWC.</div>`;
    }
}
customElements.define('main-footer', MainFooter);
