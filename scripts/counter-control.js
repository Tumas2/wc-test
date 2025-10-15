// counter-control.js
import { StatefulElement } from './StatefulElement.js';
import { counterStore } from './userStore.js';

class CounterControl extends StatefulElement {

    /**
     * Required: Specify which store to listen to.
     */
    getStores() {
        return {
            counter: counterStore,
        };
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
    view() {
        return this.html`
      <style> 
        button { 
          padding: 8px 16px; 
          font-size: 16px;
          cursor: pointer;
          background-color: dodgerblue;
          color: white;
          border: none;
          border-radius: 4px;
        } 
      </style>
      
      <button onclick="increment">Increment Count</button>
    `;
    }
}

customElements.define('counter-control', CounterControl);