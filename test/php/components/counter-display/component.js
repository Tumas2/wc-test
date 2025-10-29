// counter-display.js
import { NanoRenderStatefulElement } from 'swc';
import { counterStore } from 'stores/counterStore.js';

class CounterDisplay extends NanoRenderStatefulElement {

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
				color: #FFC107; 
				font-size: calc(1rem * calc(1 + calc({{counter.count}} / 10)));
			} 
		</style>
      	<h2>The current count is: {{counter.count}}</h2>`;
	}
}

customElements.define('counter-display', CounterDisplay);