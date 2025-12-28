# SWC (Stateful Web Components)

SWC is a lightweight, pure Vanilla JavaScript library for building state-driven, reactive Web Components without any external dependencies or build steps.

## Installation

Simply copy the `src/` folder into your project.
-   `src/StatefulElement.js`: The base component class.
-   `src/store.js`: The state store class.
-   `src/NanoRenderer.js`: (Optional) A tiny template renderer.
-   `src/dom-morph.js`: The DOM updating engine.

---

## 1. The Core: `StatefulElement`

At the heart of SWC is `StatefulElement`, a base class extending `HTMLElement`. It abstracts away the complexity of keeping your UI in sync with your data.

### Basic Example

```javascript
/* components/simple-toggle.js */
import { StatefulElement } from '../src/StatefulElement.js';
import { StateStore } from '../src/store.js';

// Define store instance
const uiStore = new StateStore({ active: false });

class SimpleToggle extends StatefulElement {
    getStores() {
        return {
            ui: uiStore
        };
    }

    view() {
        // Standard JS Template Literal
        const isActive = this.state.ui.active;
        return `
            <button onclick="toggle">
                Status: ${isActive ? 'ON' : 'OFF'}
            </button>
        `;
    }

    toggle() {
        uiStore.setState({ active: !this.state.ui.active });
    }
}
customElements.define('simple-toggle', SimpleToggle);
```

### Key Methods

#### `view()`
Returns the HTML template string for your component.
```javascript
view() {
   return `<div class="card">Hello ${this.state.name}</div>`;
}
```

#### `getTemplatePath()`
Optional. If you prefer keeping HTML in a separate file, return its absolute path here. SWC will fetch and cache it.
```javascript
getTemplatePath() {
    // Resolve path relative to this file
    return new URL('./markup.html', import.meta.url).pathname;
}
```

#### `getStyles()`
Returns an array of `CSSStyleSheet` objects. This is the modern way to apply styles to Shadow DOM, especially with CSS Modules.
```javascript
import styles from './style.css' with { type: 'css' };

getStyles() {
    return [styles];
}
```

#### `getStores()`
Returns an object mapping names (e.g., 'user') to global `StateStore` instances. These become reactive parts of `this.state` (see [State & Data Flow](#2-state--data-flow)).
```javascript
getStores() {
    return {
        user: userStore // Access via this.state.user
    };
}
```

#### `computed(state)`
Override to calculate values derived from state for the template. Runs on every render.
```javascript
computed(state) {
    return {
        fullName: `${state.user.firstName} ${state.user.lastName}`,
        isReady: !state.ui.loading && state.user.loggedIn
    };
}
```

#### `onMount()` / `onUnmount()`
Lifecycle hooks called when the component is connected to or disconnected from the DOM. Use these for side effects like timers or API calls.
```javascript
onMount() {
    console.log('Mounted!');
    this.timer = setInterval(() => this.tick(), 1000);
}

onUnmount() {
    clearInterval(this.timer);
}
```

### Automatic Event Binding
Forget `addEventListener`. In your template, simply use standard attributes like `onclick`:
```html
<button onclick="handleClick">Click Me</button>
```
SWC automatically binds this to your class method `handleClick(e)`.

---

## 2. State & Data Flow

SWC uses a simple Pub/Sub system via `StateStore`.

### The Relationship
`StatefulElement` observes `StateStore` instances. When a store changes, the component re-renders automatically.

-   **Global/Shared State**: Define a `StateStore` instance outside your components and share it.
-   **Component Stores**: You can also create a fresh `StateStore` inside `getStores()` if you want state isolated to that component instance.

### Updating State
To update state, call `setState` directly on your `StateStore` instance:

```javascript
// Update the 'counter' store instance
counterStore.setState({ count: 5 }); 
```

### Resetting State
To revert a store to its initial state, use `resetState` on the store instance:

```javascript
counterStore.resetState();
```

### Advanced Capabilities

#### 1. Multiple Stores
Your component isn't limited to a single state source. You can subscribe to as many stores as you need. They are all merged into `this.state`.

```javascript
getStores() {
    return {
        user: userStore,      // methods: this.state.user.*
        theme: themeStore,    // methods: this.state.theme.*
        cart: cartStore       // methods: this.state.cart.*
    };
}
```

#### 2. Shared State
Different components can subscribe to the same store instance. If `Header` and `Profile` both subscribe to `userStore`, updating the user in one automatically re-renders the other.

---

## 3. Rendering System (Bring Your Own Renderer)

SWC is agnostic about *how* you generate HTML.

### How it works
The `getRenderer()` method in your component determines how the template string and data are combined.
-   **Default**: A "Raw" renderer that just returns the template string (no variable interpolation).
-   **Custom**: You can plug in any engine (Handlebars, Lit-html, etc.) by overriding `getRenderer()`.

The library provides a built-in efficient option: **NanoRenderer**.

### Defining a Custom Renderer

You can define a project-wide base class to enforce a specific renderer (e.g., NanoRenderer or a 3rd party one) for all your components:

```javascript
/* swc.js */
import { StatefulElement } from './src/StatefulElement.js';
import { NanoRenderer } from './src/NanoRenderer.js';

// Create a singleton instance of your renderer
const renderer = new NanoRenderer();

// Export a custom base class that uses it
export class CustomStatefulElement extends StatefulElement {
    getRenderer() { 
        return renderer.render; 
    }
}
```

Now, your components just extend `CustomStatefulElement`:

```javascript
import { CustomStatefulElement } from './swc.js';

class MyComponent extends CustomStatefulElement {
    // view() can now use {{ mustache }} syntax!
}
```

---

## 4. Showcase: `NanoRenderer`

`NanoRenderer` is a tiny, compiler-based renderer included with SWC. It supports mustache-like syntax (`{{ value }}`, `{{#if}}`, `{{#each}}`).

### Example: A Reactive Counter

```javascript
/* components/my-counter/component.js */
import { NanoRenderStatefulElement } from '../../src/NanoRenderer.js';
import { StateStore } from '../../src/store.js';

// 1. Shared Store (Singleton)
const counterStore = new StateStore({ count: 0 });

export class MyCounter extends NanoRenderStatefulElement {
    
    // 2. Connect Store
    getStores() {
        return {
            counter: counterStore
        };
    }

    // 3. Define Template with data binding
    view() {
        return `
            <div class="counter">
                <button onclick="decrement">-</button>
                <span>Count: {{ counter.count }}</span>
                <button onclick="increment">+</button>
            </div>
        `;
    }

    // 4. Update State
    increment() {
        counterStore.setState({ count: this.state.counter.count + 1 });
    }

    decrement() {
        counterStore.setState({ count: this.state.counter.count - 1 });
    }
}

customElements.define('my-counter', MyCounter);
```

### NanoRenderer Syntax Reference

`NanoRenderer` provides a focused set of features for logic-less templating:

#### 1. Interpolation
-   **Safe (Escaped)**: `{{ user.name }}`
-   **Unescaped (Raw HTML)**: `{{{ user.bio }}}`
-   **Fallbacks**: `{{ user.status || "Offline" }}`

#### 2. Conditionals
```html
{{#if state.isReady}}
    <p>Ready!</p>
{{else}}
    <p>Loading...</p>
{{/if}}
```

#### 3. Loops
Iterate over arrays. The current item properties are merged into scope, and `{{ this }}` refers to the item itself.
```html
<ul>
    {{#each state.items}}
        <li>{{ this.name }} (Index: {{ index }})</li>
    {{/each}}
</ul>
```

---

## Best Practices

### Folder-per-Component
Keep your component logic, styles, and markup in a dedicated folder.

```
/components/my-counter/
├── component.js   // The class definition
├── style.css      // Component-specific styles
└── markup.html    // HTML template (optional)
```

-   **Events**: Use standard `onclick="..."` attributes in templates; SWC automatically binds them to your class methods.