import { StateStore } from "swc";

export const userStore = new StateStore({ 
    name: 'Guest', 
    lastLogin: null,
    people: [
        "Yehuda Katz",
        "Alan Johnson",
        "Charles Jolley",
    ],
});