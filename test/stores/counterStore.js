import { StateStore } from "../../src/store.js";

// const date = new Date();
export const counterStore = new StateStore({ 
    count: 0, 
    // seconds: date.getSeconds(),
    // minutes: date.getMinutes(),
    // hour: date.getHours()
});
