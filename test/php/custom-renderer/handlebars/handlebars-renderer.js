// handlebars-renderer.js
const templateCache = new Map();

export function handlebarsRenderer(templateString, data) {
    if (typeof Handlebars === 'undefined') {
        throw new Error('Handlebars.js is not loaded.');
    }

    // Use the template string itself as the cache key
    let templateFunc = templateCache.get(templateString);
    if (!templateFunc) {
        templateFunc = Handlebars.compile(templateString);
        templateCache.set(templateString, templateFunc);
    }
    return templateFunc(data);
}