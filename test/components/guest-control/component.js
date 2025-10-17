import { StatefulElement } from '../../../src/StatefulElement.js';
import { userStore } from '../../stores/userStore.js';

import globalStyles from '../../global.css' with { type: 'css' };
import localStyles from './style.css' with { type: 'css' };

class GuestControl extends StatefulElement {

	getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname;
	}

    getStyles() {
      	return [globalStyles, localStyles];
    }

    getStores() {
        return { user: userStore };
    }

    onchange(e) {
        this.setState('user', { name: e.target.value });
    }
}

customElements.define('guest-control', GuestControl);