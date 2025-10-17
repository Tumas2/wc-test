// html-loader.js
const templateCache = new Map();

export function loadHTML(path) {
	if (templateCache.has(path)) {
		return templateCache.get(path);
	}

	const promise = fetch(path)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Failed to load HTML from ${path}`);
			}
			return response.text();
		});

	templateCache.set(path, promise);
	return promise;
}