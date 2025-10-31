import { CustomStatefulElement } from 'swc';

class MainHeader extends CustomStatefulElement {

    getTemplatePath() {
        return new URL('markup.html', import.meta.url).pathname;
    }

    initialData() {
        return {
            // name: 'Link',
            links: [
                {
                    to: '/',
                    name: 'Home'
                },
                {
                    to: '/posts',
                    name: 'Posts'
                },
                {
                    to: '/contact',
                    name: 'Contact'
                },
            ]
        }
    }

    // view() {
    //     return /*html*/`<header class="navigation py-2">
    //         <div class="flex gap-4 justify-between items-center max-w-content">
    //             <div class="font-black text-4xl">
    //                 <router-link to="/">TK</router-link>
    //             </div>

    //             <nav>
    //                 {{#each links}}
    //                     <router-link to="{{this.to}}">{{this.name}}</router-link>
    //                 {{/each}}
    //             </nav>

    //             <div></div>
    //         </div>
    //     </header>`;
    // }

}

customElements.define('main-header', MainHeader);