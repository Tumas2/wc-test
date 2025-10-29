import { StateStore } from "swc";

export const mainNavStore = new StateStore({ 
    items: [
        {
            href: '/index.html',
            name: 'Home'
        },
        {
            href: '/full-page.html',
            name: 'Full Page Demo'
        }
    ], 
});