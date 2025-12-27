# SWC - AI Context & Documentation

## Project Overview
SWC (Stateful Web Components) is a pure Vanilla JavaScript library for building state-driven, reactive Web Components without external dependencies. It utilizes standard Web APIs like Custom Elements, Shadow DOM, and native Modules.

## Key Architecture

### 1. Component System (`StatefulElement`)
- **Base Class**: All components extend `StatefulElement` (inherits from `HTMLElement`).
- **Shadow DOM**: Uses `open` mode Shadow DOM for encapsulation. styles are applied via `adoptedStyleSheets` in `getStyles()`.
- **Rendering**:
    - **Templates**: Can be defined inline via `view()` or loaded externally via `getTemplatePath()`.
    - **Reactivity**: Uses a morphing algorithm (`dom-morph.js`) to update the DOM efficiently without full re-renders.
    - **Renderer**: Supports custom renderers via `getRenderer()`. Defaults to a raw string injector but `NanoRenderer` can be used for template interpolation.

### 2. State Management (`StateStore`)
- **Pattern**: Pub/Sub architecture.
- **Integration**: Components define dependent stores in `getStores()`.
- **Reactivity**: `StatefulElement` automatically subscribes to these stores and triggers `render()` on state changes.
- **Methods**: `getState()`, `setState()`, `resetState()`, `subscribe()`, `unsubscribe()`.

### 3. DOM Morphing & Events
- **Morphing**: Updates DOM nodes in place to preserve state (focus, selection).
- **Event Binding**:
    - **Convention**: Use `on*` attributes in your HTML templates (e.g., `onclick="handleClick"`).
    - **Magic**: `StatefulElement` automatically converts these to `data-swc-event-*` and binds them to the component instance's methods (e.g., `this.handleClick`).
    - **Stability**: Event listeners are managed and cleaned up automatically.

## Utilities (Optional)

### Router (`router/`)
*Note: This is an extra utility/module and not part of the core library.*
- **Declarative**: Uses custom elements for routing structure.
- **Components**:
    - `<router-container base-path="...">`: Root container.
    - `<router-switch>`: Renders the first matching route.
    - `<router-route path="..." src="...">`: Defines a route. Supports lazy loading HTML via `src`.
    - `<router-link to="...">`: Intercepts clicks for seamless navigation.
- **Backend Integration**: Designed to work with PHP or other backends by checking `base-path` and handling initial server-side renders if needed.

## Coding Conventions

- **No Build Step**: Code should be valid ES modules runnable directly in the browser.
- **File Structure**:
    - `src/`: Core library code.
    - `test/`: Usage examples and testing playground.
- **Imports**: Use full relative paths with extensions (e.g., `import ... from './file.js'`).
- **CSS**: Define styles in `getStyles()` returning `CSSStyleSheet` objects constructed from text.

## Use Cases
- Components should be self-contained.
- Routing logic is handled by the `router/` components but fits within the standard component model.
- External HTML templates are supported for complex views to keep JS clean.

## Testing
- **Location**: `test/` directory.
- **Structure**: Each folder within `test/` represents a separate isolated project/test case.
- **Run**: Serve the root via a web server (e.g., Apache/PHP).
    - **Test Root**: `http://swc.test:8080/test/`
    - **Specific Test Example**: `http://swc.test:8080/test/php-routing` (for routing components).
- **Method**: Currently manual/visual verification in the browser.
