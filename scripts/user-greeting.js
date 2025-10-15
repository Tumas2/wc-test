// user-greeting.js
import { StatefulElement } from './StatefulElement.js';
import { counterStore, userStore } from './userStore.js';

class UserGreeting extends StatefulElement {

    /**
     * Required: Specify which store to listen to.
     */
    getStores() {
        return {
            // counter: counterStore,
            user: userStore,
        };
    }

    /**
     * Required: Define the component's UI.
     * This method is automatically called when the store updates.
     */
    view() {
        const { name } = this.state.user;

        this.shadowRoot.innerHTML = /*html*/`
        <style>
            h1 {
                font-family: sans-serif;
                color: #333;
            }
            span {
                color: purple;
                font-weight: bold;
            }
        </style>
        <h1>Welcome back, <span>${name}</span></span>!</h1>
    `;
    }
}

customElements.define('user-greeting', UserGreeting);