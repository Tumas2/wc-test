import { NanoRenderStatefulElement } from '../../../swc.js';

export class MainHeader extends NanoRenderStatefulElement {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                background: #ffffff;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem 0;
            }
            .container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
            }
            .logo {
                font-weight: 700;
                font-size: 1.5rem;
                color: var(--text-color);
                text-decoration: none;
            }
            nav {
                display: flex;
                gap: 1.5rem;
            }
            router-link::part(link) {
                color: var(--text-color);
                text-decoration: none;
                font-weight: 500;
            }
            router-link::part(link):hover {
                color: var(--primary-color);
            }
        `);
        return [sheet];
    }

    view() {
        return `
            <div class="container">
                <router-link to="/" class="logo">Tums</router-link>
                <nav>
                    <router-link to="/">Home</router-link>
                    <router-link to="/blog/">Blog</router-link>
                </nav>
            </div>
        `;
    }
}

customElements.define('main-header', MainHeader);
