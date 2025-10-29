// user-greeting.js
// import { HandlebarsStatefulElement } from '../../custom-renderer/handlebars/HandlebarsStatefulElement.js';
import { NanoRenderStatefulElement } from 'swc';
import { userStore } from '../../stores/userStore.js';

import componentStyle from './style.css' with { type: 'css' }

// class UserGreeting extends HandlebarsStatefulElement {
class UserGreeting extends NanoRenderStatefulElement {

    getStyles() {
        return [componentStyle]
    }

    getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname
    }

    initialData() {
        return {
            person: {
                name: "Alex",
                isAdmin: true,
                skills: ["JS", "HTML", "CSS"]
            }
        }
    }

    getStores() {
        return {
            // counter: counterStore,
            user: userStore,
        };
    }

}

customElements.define('user-greeting', UserGreeting);