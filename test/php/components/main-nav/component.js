// counter-control.js
// import { HandlebarsStatefulElement } from '../../custom-renderer/handlebars/HandlebarsStatefulElement.js';
import { NanoRenderStatefulElement } from 'swc';
import { mainNavStore } from '../../stores/mainNavStore.js';

import navStructure from './nav-structure.json' with { type: 'json' };

import resetStyles from '../../minireset.min.css' with { type: 'css' };
import localStyles from './style.css' with { type: 'css' };

class MainNavigation extends NanoRenderStatefulElement {

    getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname;
    }

    getStyles() {
        return [
            resetStyles, 
            localStyles
        ];
    }

    initialData() {
        return navStructure;
    }

}

customElements.define('main-nav', MainNavigation);