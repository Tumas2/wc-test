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

    getStores() {
        return { counter: counterStore };
    }

    increment() {
        this.setState('counter', { count: this.state.counter.count + 1 });
        console.log('Increment button clicked!');
    }

    onUnmount() {
        this.resetState('counter');
    }

}

customElements.define('counter-control', CounterControl);