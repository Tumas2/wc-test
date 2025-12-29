import { NanoRenderStatefulElement } from '../../../swc.js';

export class HomePage extends NanoRenderStatefulElement {
    getStyles() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            :host {
                display: block;
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .hero {
                text-align: center;
                padding: 4rem 1rem;
                background: linear-gradient(to bottom, #dbeafe, #ffffff);
                border-radius: 1rem;
                margin-bottom: 3rem;
            }
            .hero h1 {
                font-size: 3rem;
                color: #1e3a8a;
                margin-bottom: 1rem;
            }
            .hero p {
                font-size: 1.25rem;
                color: #4b5563;
                max-width: 600px;
                margin: 0 auto;
            }
            section {
                margin-bottom: 3rem;
            }
            h2 {
                font-size: 2rem;
                border-bottom: 2px solid var(--border-color);
                padding-bottom: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .job-item {
                margin-bottom: 2rem;
            }
            .job-item h3 {
                font-size: 1.25rem;
                margin-bottom: 0.25rem;
            }
            .job-item .company {
                font-weight: 600;
                color: var(--primary-color);
            }
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 1rem;
            }
            .skill-tag {
                background: #f3f4f6;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                text-align: center;
                font-size: 0.875rem;
                color: #374151;
            }
        `);
        return [sheet];
    }

    computed() {
        return {
            history: [
                { role: "Teacher (Programming)", company: "Medieinstitutet", desc: "Teach programming throughout various parts of the year." },
                { role: "Teacher (Programming & Entrepreneurship)", company: "Consulting", desc: "Consulted at various times teaching various subjects, and help schools create courses." },
                { role: "Technical Architect", company: "BetUpmedia", desc: "Managed their entire tech stack, built requested features, helped with design, speed/CWV, and SEO." },
                { role: "Head of Research & Development", company: "Catena Media", desc: "Ran the R&D which primarily focused on researching/testing AI solutions for internal use." },
                { role: "Technical Lead", company: "Catena Media", desc: "Managed the North American tech team." },
                { role: "Architect", company: "Catena Media", desc: "Built various key products like an Ad-system to manage CTAs, User access/roles, Cache clearing, etc." },
                { role: "Full-stack Developer / Co-owner", company: "BestIn", desc: "Startup running several social media feeds and websites with affiliate links." },
                { role: "Full-stack Developer / Co-owner", company: "Flexeats", desc: "Built a real time ordering website for pre-ordering food from various restaurants." }
            ],
            skills: [
                "Bootstrap", "Cloudflare", "Cloudflare Workers", "CSS3", "Git", "HTML5", "JavaScript", "jQuery",
                "Markdown", "MongoDB", "MySQL", "Next.js", "Nginx", "Node.js", "NPM", "Photoshop", "PHP",
                "pnpm", "PostgreSQL", "Python", "Qwik", "React", "React Router", "Remix", "Sass", "SQLite",
                "Supabase", "Tailwind CSS", "TypeScript", "Vite.js", "WooCommerce", "WordPress"
            ]
        };
    }

    view() {
        return `
            <div class="hero">
                <h1>Team lead, developer, teacher.</h1>
                <p>I'm Thomas, a software developer and entrepreneur based in Stockholm Sweden. I'm a co-founder of several startups and also run my own IT-agency.</p>
            </div>

            <section>
                <h2>Work History</h2>
                {{#each state.history}}
                    <div class="job-item">
                        <h3>{{ this.role }}</h3>
                        <div class="company">{{ this.company }}</div>
                        <p>{{ this.desc }}</p>
                    </div>
                {{/each}}
            </section>

            <section>
                <h2>Skills</h2>
                <div class="skills-grid">
                    {{#each state.skills}}
                        <div class="skill-tag">{{ this }}</div>
                    {{/each}}
                </div>
            </section>
        `;
    }
}

customElements.define('home-page', HomePage);
