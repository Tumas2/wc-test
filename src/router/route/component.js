import { StatefulElement } from '../../StatefulElement.js';
import { NanoRenderStatefulElement } from '../../NanoRenderer.js';

export class RouterRoute extends StatefulElement {
    view() {
        return `<slot></slot>`;
    }
}


