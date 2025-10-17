import { StatefulElement } from '../../../src/StatefulElement.js';
import { routerStore } from '../../stores/routerStore.js'; // Ensures the store is initialized

class UserProfile extends StatefulElement {
    getStores() {
        return { router: routerStore };
    }
    view() {
        const userId = this.state.router.params.id || 'Unknown';
        return `
            <h2>User Profile</h2>
            <p>Viewing profile for user: <strong>${userId}</strong></p>
        `;
    }
}
customElements.define('user-profile', UserProfile);
