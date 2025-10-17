import { StatefulElement } from '../../../src/StatefulElement.js';
import { handlebarsRenderer } from './handlebars-renderer.js';

export class HandlebarsStatefulElement extends StatefulElement {
    getRenderer() {
        return handlebarsRenderer;
    }
}