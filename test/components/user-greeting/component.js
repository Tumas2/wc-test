// user-greeting.js
import { HandlebarsStatefulElement } from '../../custom-renderer/handlebars/HandlebarsStatefulElement.js';
// import { StatefulElement } from '../../../src/StatefulElement.js';
import { userStore } from '../../stores/userStore.js';

import componentStyle from './style.css' with { type: 'css' }

class UserGreeting extends HandlebarsStatefulElement {

    getStyles(){
        return [componentStyle]
    }

    getTemplatePath(){
        return new URL('markup.html', import.meta.url).pathname;
    }

    getStores() {
        return {
            // counter: counterStore,
            user: userStore,
        };
    }

}

customElements.define('user-greeting', UserGreeting);