import { NanoRenderStatefulElement } from 'swc';

class UserProfile extends NanoRenderStatefulElement {
    // getStores() {

    //     const container = this.closest('router-container');
    //     if (!container) {
    //         throw new Error('Must be placed inside a <router-container>.');
    //     }

    //     return { router: container.store };
    // }

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

