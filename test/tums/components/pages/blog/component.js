import { NanoRenderStatefulElement, StateStore } from '../../../swc.js';

export const postStore = new StateStore({
    loading: true,
    posts: []
});


export class BlogPage extends NanoRenderStatefulElement {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host { display: block; }
            h2 { 
                font-size: 2.5rem; 
                margin-bottom: 2rem;
                color: #1f2937;
            }
            .post-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
            }
            .post-card {
                background: #fff;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                flex-direction: column;
            }
            .post-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .post-card h3 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }
            .post-card h3 a {
                color: #111827;
                text-decoration: none;
            }
            .post-card h3 a:hover {
                color: var(--primary-color);
            }
            .post-date {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 1rem;
            }
            .post-excerpt {
                color: #4b5563;
                margin-bottom: 1.5rem;
                font-size: 1rem;
                line-height: 1.5;
                flex-grow: 1;
            }
            .read-more {
                color: var(--primary-color);
                font-weight: 600;
                text-decoration: none;
                margin-top: auto;
            }
        `);
        return [sheet];
    }

    getStores() {
        return {
            postStore
        }
    }

    onMount() {
        const { loading } = postStore.getState();
        if (loading) {
            this.fetchPosts();
        }
    }

    async fetchPosts() {

        const ssrScript = this.querySelector('#server-data-blog');
        if (ssrScript) {
            try {
                const posts = JSON.parse(ssrScript.textContent);
                postStore.setState({ posts, loading: false });
            } catch (e) {
                console.log("No posts from SSR");
            }
        } else {
            try {
                const res = await fetch('https://api.tums.se/wp-json/wp/v2/posts?_fields=id,title,excerpt,slug,date');
                const posts = await res.json();
                postStore.setState({ posts, loading: false });
            } catch (err) {
                console.error(err);
                postStore.setState({ loading: false }); // Should handle error state
            }

        }

    }

    view() {
        return `
            <h2>Latest Posts</h2>
            
            {{#if postStore.loading}}
                <div class="loading">Loading posts...</div>
            {{/if}}

            <div class="post-grid">
                {{#each postStore.posts}}
                    <article class="post-card">
                        <div class="post-date">{{ this.date }}</div>
                        <h3>
                            <router-link to="/blog/{{ this.slug }}">{{{ safe this.title.rendered }}}</router-link>
                        </h3>
                        <div class="post-excerpt">{{{ this.excerpt.rendered }}}</div>
                        <router-link class="read-more" to="/blog/{{ this.slug }}">Read more →</router-link>
                    </article>
                {{/each}}
            </div>
        `;
    }
}

customElements.define('blog-page', BlogPage);
