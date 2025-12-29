import { NanoRenderStatefulElement } from '../../../swc.js';

export class PostPage extends NanoRenderStatefulElement {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host { display: block; max-width: 800px; margin: 0 auto; }
            .back-link {
                display: inline-block;
                margin-bottom: 2rem;
                color: #6b7280;
                font-weight: 500;
            }
            article {
                background: #fff;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
            }
            h1 {
                font-size: 2.5rem;
                color: #111827;
                margin-bottom: 0.5rem;
            }
            .meta {
                color: #6b7280;
                margin-bottom: 2rem;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 1rem;
            }
            .content {
                font-size: 1.125rem;
                line-height: 1.8;
                color: #374151;
            }
            /* WP Content Styles */
            .content h2 { margin-top: 2rem; font-size: 1.8rem; }
            .content h3 { margin-top: 1.5rem; font-size: 1.5rem; }
            .content p { margin-bottom: 1.5rem; }
            .content pre {
                background: #f3f4f6;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
            }
            .content img {
                border-radius: 0.5rem;
                margin: 1rem 0;
            }
        `);
        return [sheet];
    }

    computed() {
        const ssrScript = this.querySelector('#server-data-post');
        if (ssrScript) {
            try {
                const post = JSON.parse(ssrScript.textContent);
                return { post, loading: false };
            } catch (e) {
                console.error("Failed to parse SSR data", e);
            }
        }
        return { post: null, loading: true };
    }

    onMount() {
        if (this.state.loading) {
            this.fetchPost();
        }
    }

    async fetchPost() {
        // Extract slug from URL. Simple approach for now.
        const pathParts = window.location.pathname.split('/');
        const slug = pathParts[pathParts.length - 1]; // Assumes /blog/:slug

        if (!slug) return;

        try {
            const res = await fetch(`https://api.tums.se/wp-json/wp/v2/posts?slug=${slug}&_fields=id,title,content,date`);
            const data = await res.json();
            if (data && data.length > 0) {
                this.setState({ post: data[0], loading: false });
            } else {
                this.setState({ loading: false, error: "Post not found" });
            }
        } catch (err) {
            console.error(err);
            this.setState({ loading: false, error: "Failed to load" });
        }
    }

    view() {
        const { post, loading, error } = this.state;

        if (loading) return `<div>Loading post...</div>`;
        if (error) return `<div>Error: ${error}</div>`;
        if (!post) return `<div>Post not found</div>`;

        return `
            <div>
                <router-link to="/swc/test/tums/blog" class="back-link">← Back to Blog</router-link>
                <article>
                    <h1>{{{ post.title.rendered }}}</h1>
                    <div class="meta">Published on ${new Date(post.date).toLocaleDateString()}</div>
                    <div class="content">
                        {{{ post.content.rendered }}}
                    </div>
                </article>
            </div>
        `;
    }
}

customElements.define('post-page', PostPage);
