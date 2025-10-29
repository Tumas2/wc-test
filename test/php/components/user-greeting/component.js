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

    // initialData() {
    //     return {
    //         person: {
    //             name: "Alex",
    //             isAdmin: true,
    //             skills: ["JS", "HTML", "CSS"]
    //         }
    //     }
    // }

    getStores() {
        return {
            // counter: counterStore,
            user: userStore,
        };
    }

    // async onMount() {
    //     const res  = await fetch(`http://localhost/swc/test/php/api/?route=beep`);
    //     const data = await res.json()

    //     console.log(data)

    //     this.setState('user', {
    //         ...data
    //     });
    // }

}

customElements.define('user-greeting', UserGreeting);