// counter-display.js
import { StatefulElement } from '../../../src/StatefulElement.js';
import { counterStore } from '../../stores/counterStore.js';

class CounterDisplay extends StatefulElement {

	getStores() {
		return {
			counter: counterStore,
		};
	}

	view() {
		return `
      	<style> 
			h2 { 
				font-family: sans-serif;
				color: steelblue; 
				font-size: calc(1rem * calc(1 + calc({{counter.count}} / 10)));
			} 
		</style>
      	<h2>The current count is: {{counter.count}}</h2>`;
	}
}

customElements.define('counter-display', CounterDisplay);