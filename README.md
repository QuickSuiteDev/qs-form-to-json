# @quicksuite/form-to-json

> Convert any escaped or normal HTML `<form>` markup into clean, typed JSON — with syntax highlighting, automatic type parsing, and a beautiful embedded viewer UI.  
> Part of the **QuickSuite Developer Toolkit Ecosystem** (https://quicksuite.dev)

---

## 🚀 Overview

`@quicksuite/form-to-json` is a zero‑dependency browser tool that:

- Accepts **escaped or normal HTML form markup**
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
- Renders beautiful **syntax-highlighted JSON** with a **Copy** button
- Works in plain JS, React, Vue, Next.js, etc.
- Returns a cleanup function for proper unmounting

---

## 📦 Installation

```bash
npm install @quicksuite/form-to-json
# or
yarn add @quicksuite/form-to-json
```

---

## 🧩 Usage

### Basic (Vanilla JS)

```html
<div id="form-json-root"></div>

<script type="module">
  import { renderFormJson } from "@quicksuite/form-to-json";

  // Mount the tool into a DOM element
  const cleanup = renderFormJson("form-json-root");

  // Later if needed:
  // cleanup();
</script>
```

---

## 🧠 How It Works

1. Paste escaped or normal HTML form markup  
2. Tool decodes and parses it  
3. Converts the form into structured JSON  
4. Displays a beautifully highlighted JSON block  
5. Copy result directly via the built‑in **COPY** button

---

## 🏗️ Framework Notes

### React / Next.js
Call `renderFormJson` **only on the client**, e.g. inside `useEffect`:

```tsx
useEffect(() => {
  const cleanup = renderFormJson("root-id");
  return cleanup;
}, []);
```

---

## 🎨 Screenshot (example)
*(placeholder – you can add an image in GitHub later)*

---

## 📄 License

MIT © QuickSuite / Burak Karakaya
