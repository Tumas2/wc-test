export { loadHTML } from '../../src/html-loader.js';
export { StateStore } from '../../src/store.js';
export { StatefulElement } from '../../src/StatefulElement.js';
export { NanoRenderer, NanoRenderStatefulElement } from '../../src/NanoRenderer.js'

// export * from '../../src/router/index.js'
import { RouterStore } from  '../../src/router/index.js'

export const routerStore = new RouterStore(window.swc.router.BASE_PATH);