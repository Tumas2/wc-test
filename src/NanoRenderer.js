import { StatefulElement } from "swc";

/**
 * A simplified, regex-based template renderer.
 * @param {string} template - The template string (e.g., "Hello {{name}}").
 * @param {object} data - The data object to populate the template.
 * @returns {string} The rendered HTML string.
 */
export class NanoRenderer {
    // Regex patterns are defined as static properties for clarity and potential overriding.
    static REGEX_EACH = /{{\s*#each\s+([a-zA-Z0-9_.]+)\s*}}(.*?)(?:{{\s*else\s*}}(.*?))?{{\s*\/each\s*}}/gs;
    static REGEX_IF = /{{\s*#if\s+([a-zA-Z0-9_.]+)\s*}}(.*?)(?:{{\s*else\s*}}(.*?))?{{\s*\/if\s*}}/gs;
    static REGEX_UNESCAPED = /{{\s*{\s*([a-zA-Z0-9_.]+)\s*}\s*}}/g;
    static REGEX_ESCAPED = /{{\s*([a-zA-Z0-9_.]+)\s*}}/g;

    constructor() {
        this.maxIterations = 100; // Safety break to prevent infinite loops

        // Bind the 'this' context of the render method to this instance.
        // This ensures 'this' is always correct, even when the render
        // method is passed as a reference to another class or function.
        this.render = this.render.bind(this);
    }

    /**
     * Safely gets a nested property from an object using a dot-notation string.
     * @param {object} context - The data object to search.
     * @param {string} path - The dot-notation path (e.g., "user.name").
     * @returns {*} The value, or an empty string if not found.
     */
    #getValue(context, path) {
        if (path === 'this' && (typeof context !== 'object' || context === null)) {
            return context;
        }

        let current = context;
        const parts = path.split('.');

        try {
            for (const part of parts) {
                if (current === null || typeof current === 'undefined') {
                    return '';
                }
                current = current[part];
            }
            // Handle null/undefined values gracefully
            return current === null || typeof current === 'undefined' ? '' : current;
        } catch (e) {
            return '';
        }
    }

    /**
     * Escapes HTML special characters for safe rendering.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     */
    #escapeHTML(str) {
        if (typeof str !== 'string') str = String(str);
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    /**
     * Renders a template string with the given data.
     * @param {string} template - The template string (e.g., "Hello {{name}}").
     * @param {object} data - The data object to populate the template.
     * @returns {string} The rendered HTML string.
     */
    render(template, data) {
        let output = template;
        let iterations = 0;
        let lastOutput = '';

        // Keep processing until the template stops changing
        while (output !== lastOutput && iterations < this.maxIterations) {
            lastOutput = output;
            iterations++;

            // 1. Process {{#each}} blocks (with {{else}})
            output = output.replace(NanoRenderer.REGEX_EACH, (match, arrayName, eachContent, elseContent) => {
                const array = this.#getValue(data, arrayName);
                if (Array.isArray(array) && array.length > 0) {
                    return array.map(item => {
                        // Recursively render the inner content for each item.
                        return this.render(eachContent, item);
                    }).join('');
                } else if (elseContent !== undefined) {
                    // If array is empty or not an array, render the else block if it exists
                    return this.render(elseContent, data);
                }
                return ''; // If no array and no else block, remove the block
            });

            // 2. Process {{#if}} blocks (with {{else}})
            output = output.replace(NanoRenderer.REGEX_IF, (match, conditionName, ifContent, elseContent) => {
                const value = this.#getValue(data, conditionName);
                let isTruthy = false;

                // Check for "truthiness" (not false, null, undefined, 0, "", or empty array)
                if (Array.isArray(value)) {
                    isTruthy = value.length > 0;
                } else {
                    isTruthy = !!value;
                }

                if (isTruthy) {
                    return this.render(ifContent, data);
                } else if (elseContent !== undefined) {
                    // Render the else block if it exists
                    return this.render(elseContent, data);
                }
                return ''; // No match and no else block
            });
        }

        if (iterations === this.maxIterations) {
            console.error("Renderer reached max iterations. Possible infinite loop.");
            return "<p style='color:red;'>Error: Renderer timed out. Check for malformed blocks.</p>";
        }

        // 3. Process Unescaped (raw) variables: {{{variable}}}
        // This must be done *before* escaped variables.
        output = output.replace(NanoRenderer.REGEX_UNESCAPED, (match, path) => {
            return this.#getValue(data, path);
        });

        // 4. Process Escaped variables: {{variable}} or {{this}}
        output = output.replace(NanoRenderer.REGEX_ESCAPED, (match, path) => {
            const value = this.#getValue(data, path);
            return this.#escapeHTML(value);
        });

        return output;
    }
}


export class NanoRenderStatefulElement extends StatefulElement {
    getRenderer() {
        const renderer = new NanoRenderer();
        return renderer.render;
    }
}