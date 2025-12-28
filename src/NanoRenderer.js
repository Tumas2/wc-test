import { StatefulElement } from "./StatefulElement.js";

/**
 * A compiler-based template renderer.
 * Compiles templates into JavaScript functions for high performance.
 */
export class NanoRenderer {
    constructor() {
        this.cache = new Map();
        this.render = this.render.bind(this);
    }

    /**
     * Escapes a string to be safe for use in single-quoted string literals.
     * @param {string} str 
     * @returns {string}
     */
    str(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    /**
     * Compiles a template string into a render function.
     * @param {string} template 
     * @returns {Function}
     */
    compile(template) {
        if (typeof template !== 'string') return () => '';
        if (this.cache.has(template)) return this.cache.get(template);

        let code = "let out = '';\n";
        code += "const escape = (str) => String(str ?? '').replace(/[&<>'\"/]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',\"'\":'&#39;','\"':'&quot;','/':'&#x2F;'})[c]);\n";
        code += "const get = (path) => {\n";
        code += "  if (path === 'this') return data;\n";
        code += "  return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : undefined, data);\n";
        code += "};\n";
        code += "with(data) {\n";

        // Tokenize: Split by tags {{ ... }}
        // We use a regex that captures the content of the tag
        const tokens = template.split(/{{(.*?)}}/g);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (i % 2 === 0) {
                // Text node
                if (token) {
                    code += `out += ${JSON.stringify(token)};\n`;
                }
            } else {
                // Tag node
                const trimmed = token.trim();
                const parts = trimmed.split(/\s+/);
                const type = parts[0];
                const args = parts.slice(1).join(' ');

                if (type === '#if') {
                    // Safety: We treat args as a string path passed to get().
                    // We escape single quotes to prevent breaking the get('...') literal.
                    code += `if (get('${this.str(args)}')) {\n`;

                } else if (type === 'else') {
                    code += `} else {\n`;

                } else if (type === '/if') {
                    code += `}\n`;

                } else if (type === '#each') {
                    // {{#each list}}
                    code += `const list = get('${this.str(args)}');\n`;
                    code += `if (Array.isArray(list)) {\n`;
                    code += `  list.forEach((item, index) => {\n`;
                    code += `    const stack = data;\n`; // save parent
                    code += `    data = { ...data, ...item, this: item, index };\n`; // push scope

                } else if (type === '/each') {
                    code += `    data = stack;\n`; // pop scope
                    code += `  });\n`;
                    code += `}\n`;

                } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                    // {{{ unescaped }}}
                    // content is inside the extra braces: { value }
                    const raw = trimmed.slice(1, -1).trim();
                    // Check for fallback: var || "fallback"
                    const fallbackMatch = raw.match(/^(.*?)\s*\|\|\s*(["'])(.*?)\2$/);
                    let valExpr, fallback;
                    if (fallbackMatch) {
                        valExpr = `get('${this.str(fallbackMatch[1].trim())}')`;
                        fallback = JSON.stringify(fallbackMatch[3]); // JSON.stringify is already safe for literals
                        code += `out += (${valExpr} ?? ${fallback});\n`;
                    } else {
                        code += `out += (get('${this.str(raw)}') ?? '');\n`;
                    }

                } else {
                    // {{ variable }} (Escaped)
                    // Check for fallback
                    const fallbackMatch = trimmed.match(/^(.*?)\s*\|\|\s*(["'])(.*?)\2$/);
                    let valExpr, fallback;
                    if (fallbackMatch) {
                        valExpr = `get('${this.str(fallbackMatch[1].trim())}')`;
                        fallback = JSON.stringify(fallbackMatch[3]);
                        code += `out += escape(${valExpr} ?? ${fallback});\n`;
                    } else {
                        code += `out += escape(get('${this.str(trimmed)}') ?? '');\n`;
                    }
                }
            }
        }

        code += "}\nreturn out;";
        try {
            const fn = new Function('data', code);
            this.cache.set(template, fn);
            return fn;
        } catch (e) {
            console.error("NanoCompiler Error:", e);
            console.log("Generated Code:", code);
            return () => '';
        }
    }

    render(template, data) {
        try {
            const fn = this.compile(template);
            return fn(data || {});
        } catch (e) {
            console.error("NanoRenderer Runtime Error:", e);
            return '';
        }
    }
}

export class NanoRenderStatefulElement extends StatefulElement {
    getRenderer() {
        if (!this._nano) this._nano = new NanoRenderer();
        return this._nano.render;
    }
}