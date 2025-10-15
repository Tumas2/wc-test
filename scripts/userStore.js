import { StateStore } from "./store.js";

// Create and export a store instance for our user profile.
export const userStore = new StateStore({ 
    name: 'Guest', 
    lastLogin: null,
});

export const counterStore = new StateStore({ 
    count: 0, 
});