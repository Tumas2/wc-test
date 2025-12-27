/**
 * deeply morphs a DOM node to match a target node.
 * This function updates the existing DOM in place, preserving state like
 * input focus and CSS transitions.
 * 
 * @param {Node} fromNode - The existing DOM node to update.
 * @param {Node} toNode - The new DOM node (usually from a template) to match.
 */
export function morph(fromNode, toNode) {
    if (fromNode.isEqualNode(toNode)) return;

    // specialized update for input elements to preserve focus and selection
    if (fromNode.nodeName === 'INPUT' && toNode.nodeName === 'INPUT') {
        if (fromNode.value !== toNode.value) {
            fromNode.value = toNode.value;
        }
        if (fromNode.checked !== toNode.checked) {
            fromNode.checked = toNode.checked;
        }
        // dont return here, attributes might have changed
    }

    // specialized update for generic text nodes
    if (fromNode.nodeType === Node.TEXT_NODE && toNode.nodeType === Node.TEXT_NODE) {
        if (fromNode.textContent !== toNode.textContent) {
            fromNode.textContent = toNode.textContent;
        }
        return;
    }

    // sync attributes for element nodes
    if (fromNode.nodeType === Node.ELEMENT_NODE && toNode.nodeType === Node.ELEMENT_NODE) {
        // remove attributes that are not in the new node
        const fromAttrs = fromNode.attributes;
        for (let i = fromAttrs.length - 1; i >= 0; i--) {
            const attr = fromAttrs[i];
            if (!toNode.hasAttribute(attr.name)) {
                fromNode.removeAttribute(attr.name);
            }
        }

        // add or update attributes from the new node
        const toAttrs = toNode.attributes;
        for (let i = 0; i < toAttrs.length; i++) {
            const attr = toAttrs[i];
            if (fromNode.getAttribute(attr.name) !== attr.value) {
                fromNode.setAttribute(attr.name, attr.value);
            }
        }

        // Handle value property for inputs/textareas which might not be reflected in attributes
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(fromNode.nodeName)) {
            if (fromNode.value !== toNode.value) {
                fromNode.value = toNode.value;
            }
        }
    }

    // sync children
    const fromChildren = Array.from(fromNode.childNodes);
    const toChildren = Array.from(toNode.childNodes);

    for (let i = 0; i < toChildren.length; i++) {
        const toChild = toChildren[i];
        const fromChild = fromChildren[i];

        if (!fromChild) {
            // new node, just append it
            fromNode.appendChild(toChild.cloneNode(true));
        } else if (fromChild.nodeName !== toChild.nodeName || fromChild.nodeType !== toChild.nodeType) {
            // different node type, replace it
            fromNode.replaceChild(toChild.cloneNode(true), fromChild);
        } else {
            // same node type, recurse
            morph(fromChild, toChild);
        }
    }

    // remove extra children
    while (fromNode.childNodes.length > toChildren.length) {
        fromNode.removeChild(fromNode.lastChild);
    }
}
