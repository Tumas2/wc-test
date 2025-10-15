// counter-display.js
import { StatefulElement } from './StatefulElement.js';
import { counterStore } from './userStore.js';

class CounterDisplay extends StatefulElement {

    /**
     * Required: Tell the base class which store to listen to.
     */
    getStores() {
        return {
            counter: counterStore,
        };
    }

    /**
     * Required: Define the component's UI based on the store's state.
     * This is called automatically on state changes.
     */
    view() {
        this.shadowRoot.innerHTML = `
      <style> 
        h2 { 
          font-family: sans-serif;
          color: steelblue; 
        } 
      </style>
      <h2>The current count is: ${this.state.counter.count}</h2>
    `;
    }
}

customElements.define('counter-display', CounterDisplay);