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
        code += "const sanitize = (str) => {\n";
        code += "  const doc = new DOMParser().parseFromString(str || '', 'text/html');\n";
        code += "  // Remove dangerous tags\n";
        code += "  const badTags = ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta'];\n";
        code += "  badTags.forEach(tag => doc.querySelectorAll(tag).forEach(el => el.remove()));\n";
        code += "  // Remove event handlers and javascript: URIs\n";
        code += "  const all = doc.querySelectorAll('*');\n";
        code += "  all.forEach(el => {\n";
        code += "    Array.from(el.attributes).forEach(attr => {\n";
        code += "      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);\n";
        code += "      if ((attr.name === 'href' || attr.name === 'src') && attr.value.trim().toLowerCase().startsWith('javascript:')) el.removeAttribute(attr.name);\n";
        code += "    });\n";
        code += "  });\n";
        code += "  return doc.body.innerHTML;\n";
        code += "};\n";

        code += "const get = (path) => {\n";
        code += "  if (path === 'this') return data;\n";
        code += "  return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : undefined, data);\n";
        code += "};\n";
        code += "with(data) {\n";

        // Tokenize: Split by tags {{ ... }} or {{{ ... }}}
        // We use a regex that captures the entire tag including braces
        const tokens = template.split(/((?:{{{[\s\S]*?}}})|(?:{{[\s\S]*?}}))/g);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (i % 2 === 0) {
                // Text node
                if (token) {
                    code += `out += ${JSON.stringify(token)};\n`;
                }
            } else {
                // Tag node
                const isTriple = token.startsWith('{{{');
                // Remove braces
                const content = isTriple ? token.slice(3, -3) : token.slice(2, -2);

                const trimmed = content.trim();
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
                    code += `{\n`; // Open new scope
                    code += `const list = get('${this.str(args)}');\n`;
                    code += `if (Array.isArray(list)) {\n`;
                    code += `  list.forEach((item, index) => {\n`;
                    code += `    const stack = data;\n`; // save parent
                    code += `    data = { ...data, ...item, this: item, index };\n`; // push scope

                } else if (type === '/each') {
                    code += `    data = stack;\n`; // pop scope
                    code += `  });\n`;
                    code += `}\n`;
                    code += `}\n`; // Close new scope

                } else if (isTriple) {
                    // {{{ unescaped }}}
                    let raw = trimmed;
                    let isSafe = false;

                    // Check for 'safe' keyword: {{{ safe content }}}
                    if (raw.startsWith('safe ')) {
                        isSafe = true;
                        raw = raw.substring(5).trim();
                    }

                    // Check for fallback: var || "fallback"
                    const fallbackMatch = raw.match(/^(.*?)\s*\|\|\s*(["'])(.*?)\2$/);
                    let valExpr, fallback;

                    if (fallbackMatch) {
                        valExpr = `get('${this.str(fallbackMatch[1].trim())}')`;
                        fallback = JSON.stringify(fallbackMatch[3]); // JSON.stringify is already safe for literals
                    } else {
                        valExpr = `get('${this.str(raw)}')`;
                        fallback = "''";
                    }

                    if (isSafe) {
                        code += `out += sanitize(${valExpr} ?? ${fallback});\n`;
                    } else {
                        code += `out += (${valExpr} ?? ${fallback});\n`;
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