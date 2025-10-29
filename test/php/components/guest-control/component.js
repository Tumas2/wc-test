import { NanoRenderStatefulElement } from 'swc';
import { userStore } from 'stores/userStore.js';

import localStyles from './style.css' with { type: 'css' };

class GuestControl extends NanoRenderStatefulElement {

	getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname;
	}

    getStyles() {
      	return [localStyles];
    }

    getStores() {
        return { user: userStore };
    }

    onchange(e) {
        this.setState('user', { name: e.target.value });
    }
}

customElements.define('guest-control', GuestControl);