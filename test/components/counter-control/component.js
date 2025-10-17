// counter-control.js
import { StatefulElement } from '../../../src/StatefulElement.js';
import { counterStore } from '../../stores/counterStore.js';

import globalStyles from '../../global.css' with { type: 'css' };
import localStyles from './style.css' with { type: 'css' };

class CounterControl extends StatefulElement {

	getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname;
	}

    getStyles() {
      	return [globalStyles, localStyles];
    }

    /**
     * Required: Specify which store to listen to.
     */
    getStores() {
        return { counter: counterStore };
    }

    /**
     * This method is now automatically wired up by the `html` tag.
     */
    increment() {
        this.setState('counter', { count: this.state.counter.count + 1 });
        console.log('Increment button clicked!');
    }

    /**
     * Required: Define the component's UI using the `this.html` tag.
     */
    // view() {
	// 	if (!this.template) {
	// 		return this.html``; 
	// 	}

    //     let renderedHtml = this.template;

    //     // return this.html`<button onclick="increment">Increment Count</button>`;
	// 	return this.html`${renderedHtml}`;		
    // }
}

customElements.define('counter-control', CounterControl);