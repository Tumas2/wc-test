import { NanoRenderStatefulElement, routerStore } from 'swc';

class UserProfile extends NanoRenderStatefulElement {
    getStores() {
        return { router: routerStore };
    }

    initialData(){
        return {
            
        }
    }

    view() {
        return `
            <h2>User Profile</h2>
            <p>Viewing profile for user: <strong>{{router.params.id}}</strong> <b>{{router.params.jd || '<i>Unknown</i>'}}</b></p>
        `;
    }
}

customElements.define('user-profile', UserProfile);

