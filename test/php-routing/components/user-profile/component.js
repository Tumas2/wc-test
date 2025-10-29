import { NanoRenderStatefulElement } from 'swc';

class UserProfile extends NanoRenderStatefulElement {
    getStores() {
        const provider = this._findStoreProvider();

        return provider?.store
            ? { router: provider?.store }
            : {}
    }

    getTemplatePath = () => new URL('markup.html', import.meta.url).pathname

}

customElements.define('user-profile', UserProfile);

