# @quicksuite/form-to-json

[![npm version](https://img.shields.io/npm/v/@quicksuite/form-to-json)](https://www.npmjs.com/package/@quicksuite/form-to-json)
[![npm downloads](https://img.shields.io/npm/dm/@quicksuite/form-to-json)](https://www.npmjs.com/package/@quicksuite/form-to-json)
[![license](https://img.shields.io/github/license/QuickSuiteDev/qs-form-to-json)](https://github.com/QuickSuiteDev/qs-form-to-json/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@quicksuite/form-to-json)](https://bundlephobia.com/package/@quicksuite/form-to-json)

Convert any escaped or normal HTML `<form>` markup into clean, typed JSON — with syntax highlighting, automatic type parsing, and a lightweight embedded viewer UI.  
Part of the **QuickSuite Developer Toolkit Ecosystem**: https://quicksuite.dev

---

## 🚀 Overview

`@quicksuite/form-to-json` is a zero‑dependency browser tool that:

- Accepts **escaped or normal HTML `<form>` markup**
- Parses it safely using `DOMParser`
- Converts the resulting `FormData` into a clean JSON object
- Automatically detects:
  - Numbers → `number`
  - `"true"` / `"false"` → `boolean`
  - `"null"` → `null`
  - Repeated fields → arrays
- Captures form metadata:
  - `__form__action`
  - `__form__method`
- Renders syntax‑highlighted JSON with a built‑in **COPY** button
- Works in plain JS, React, Vue, Next.js, etc.
- Returns a cleanup function so you can unmount the widget cleanly

---

## ✨ Features

- 📝 **Escaped or normal HTML support**  
  Paste raw HTML or HTML with entities like `&lt;` / `&gt;` — both are handled.

- 🧠 **Smart type parsing**  
  Strings like `"42"`, `"true"`, `"false"`, `"null"` are converted into proper JS types.

- 🧩 **Form‑aware metadata**  
  Automatically includes `__form__action` and `__form__method` based on the source `<form>`.

- 🎨 **Developer‑friendly viewer**  
  Syntax‑highlighted JSON output in a clean UI, plus a one‑click **COPY** button.

- 🔌 **Framework‑friendly**  
  Returns a cleanup function that removes listeners, DOM and styles — ideal for SPA frameworks.

- 🪶 **Zero dependencies**  
  No runtime dependencies — easy to drop into any front‑end stack.

---

## 📦 Installation

```bash
npm install @quicksuite/form-to-json
# or
yarn add @quicksuite/form-to-json
```

This package is designed for **browser environments**. It uses `document`, `DOMParser`, `FormData` and `navigator.clipboard`.

---

## 🧩 Quick Start (Vanilla JS)

```html
<div id="form-json-root"></div>

<script type="module">
  import { renderFormJson } from "@quicksuite/form-to-json";

  // Mount the tool into a DOM element
  const cleanup = renderFormJson("form-json-root");

  // Later, if you want to unmount it:
  // cleanup();
</script>
```

After mounting:

1. Paste escaped or normal HTML `<form>` markup into the textarea.  
2. Click **Convert & Format to JSON**.  
3. Inspect the syntax‑highlighted JSON and copy it with the **COPY** button.

---

## 🧠 API

### `renderFormJson(elementId: string): () => void`

Mounts the HTML Form → JSON converter into the target element.

- **`elementId`**: The `id` of the DOM element where the tool should be rendered.
- **Returns**: A **cleanup function** that:
  - Removes event listeners
  - Clears the container DOM
  - Removes injected styles

Use this cleanup in SPA frameworks to avoid memory leaks or duplicated styles on remount.

---

## 🏗️ Usage with Frameworks

### React / Next.js

Call `renderFormJson` **only on the client**, for example inside a `useEffect` hook:

```tsx
import { useEffect } from "react";
import { renderFormJson } from "@quicksuite/form-to-json";

export function FormJsonTool() {
  useEffect(() => {
    const cleanup = renderFormJson("form-json-root");
    return () => cleanup();
  }, []);

  return <div id="form-json-root" />;
}
```

> In Next.js, ensure this component is used in a **client component** (add `"use client"` at the top if needed).

### Vue (example)

```ts
import { onMounted, onBeforeUnmount } from "vue";
import { renderFormJson } from "@quicksuite/form-to-json";

export default {
  name: "FormJsonTool",
  setup() {
    let cleanup: (() => void) | null = null;

    onMounted(() => {
      cleanup = renderFormJson("form-json-root");
    });

    onBeforeUnmount(() => {
      if (cleanup) {
        cleanup();
      }
    });

    return {};
  },
};
```

```html
<template>
  <div id="form-json-root"></div>
</template>
```

---

## 🌐 Environment & Limitations

- Runs in **browsers** (not designed for Node.js without a DOM shim).
- Uses:
  - `document.createElement`
  - `DOMParser`
  - `FormData`
  - `navigator.clipboard`
- If `navigator.clipboard` is not available (older browsers / insecure contexts), the **COPY** button falls back to a manual copy prompt.

---

## 🔁 Versioning & Changelog

This project follows **semantic versioning**:

- **MAJOR**: breaking changes
- **MINOR**: new features, backwards compatible
- **PATCH**: bug fixes and small improvements

Changelog entries are managed per GitHub release. Each tag (`vX.Y.Z`) should include a short summary of changes.

---

## 📷 Screenshot

You can add a screenshot or GIF here once the package is live and rendered in your site or a Codesandbox demo.

---

## 🤝 Contributing

Issues and pull requests are welcome.

- GitHub: https://github.com/QuickSuiteDev/qs-form-to-json
- Please keep the scope focused: HTML Form → JSON parsing and viewer UX.

For larger ideas or ecosystem‑wide discussions, see the QuickSuite organization and website:

- https://github.com/QuickSuiteDev
- https://quicksuite.dev

---

## 📄 License

MIT © QuickSuite / Burak Karakaya
