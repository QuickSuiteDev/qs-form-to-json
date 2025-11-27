/**
 * Decodes HTML entities (e.g., &lt; to <).
 * @param {string} encodedHtml The escaped HTML string.
 * @returns {string} The decoded HTML string.
 */
function decodeHtmlEntities(encodedHtml) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = encodedHtml;
    return textarea.value;
}

/**
 * Converts a FormData object into a simple JavaScript object (JSON format).
 * @param {FormData} formData The FormData object.
 * @param {HTMLFormElement} form The original form element.
 * @returns {Object} The resulting data object.
 */
function formDataToJson(formData, form) {
    const result = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.warn(`Skipping file input: ${key}`);
            continue; 
        }

        let parsedValue = value;
        
        if (typeof parsedValue === 'string') {
            parsedValue = parsedValue.trim();
            
            // Try to parse to Number
            if (!isNaN(parsedValue) && parsedValue !== '') {
                if (String(Number(parsedValue)) === parsedValue || String(parseInt(parsedValue)) === parsedValue) {
                    parsedValue = Number(parsedValue);
                }
            } 
            // Try to parse to Boolean/Null
            else if (parsedValue.toLowerCase() === 'true') {
                parsedValue = true;
            } else if (parsedValue.toLowerCase() === 'false') {
                parsedValue = false;
            } else if (parsedValue.toLowerCase() === 'null') {
                parsedValue = null;
            }
        }

        if (Object.prototype.hasOwnProperty.call(result, key)) {
            result[key] = [].concat(result[key], parsedValue);
        } else {
            result[key] = parsedValue;
        }
    }

    result["__form__action"] = form.action || "";
    result["__form__method"] = form.method ? form.method.toUpperCase() : "GET";

    return result;
}

/**
 * Parses an escaped HTML form string into a JSON object.
 * @param {string} escapedHtml The escaped or normal HTML string.
 * @param {string} formSelector The selector used to find the form element.
 * @returns {Object} The parsed form data JSON object.
 */
function parseEscapedFormHtmlToJson(escapedHtml, formSelector = "form") {
    if (escapedHtml.trim() === "") {
        throw new Error("Input is empty.");
    }

    const cleanedHtml = escapedHtml.replace(/\\"/g, '"');
    const decoded = decodeHtmlEntities(cleanedHtml);

    const parser = new DOMParser();
    const doc = parser.parseFromString(decoded, "text/html");
    
    const form = doc.querySelector(formSelector);
    if (!form) {
        throw new Error(`Form not found. Selector: "${formSelector}". Ensure the input HTML contains a <form> tag.`);
    }

    const formData = new FormData(form);
    const json = formDataToJson(formData, form);

    return json;
}

/**
 * Takes a JSON object, formats it with 2-space indentation, and applies syntax highlighting.
 * @param {Object} json The JSON object to highlight.
 * @returns {string} The highlighted HTML string.
 */
function highlightJson(json) {
    let formattedJson = JSON.stringify(json, null, 2);
    formattedJson = formattedJson.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 1. Highlight Keys
    formattedJson = formattedJson.replace(/"([^"]+)":/g, (match, key) => {
        if (!key.startsWith('__form__')) {
             return `<span class="json-key">"${key}"</span>:`;
        }
        return `<span class="json-action">"${key}"</span>:`;
    });
    
    // 2. Highlight Strings (VALUES)
    formattedJson = formattedJson.replace(/:\s*("(\\"|[^"])*")/g, (match, p1) => {
        if (p1.includes('__form__')) {
            return `:<span class="json-action">${p1}</span>`;
        }
        return `:<span class="json-string">${p1}</span>`;
    });
    
    // 3. Highlight Numbers, Booleans, and Null
    formattedJson = formattedJson.replace(/(\b\d+(\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g, '<span class="json-number">$1$3</span>');
    
    // 4. Highlight Brackets and Commas (Punctuation)
    formattedJson = formattedJson.replace(/(\{|\}|\[|\]|,)/g, '<span class="json-punctuation">$1</span>');

    return formattedJson;
}


// ----------------------------------------------------------------------
// --- MOUNTING AND UI LOGIC FOR NPM PACKAGE ---
// ----------------------------------------------------------------------

const STYLE_ID = 'json-form-tool-styles';

/**
 * Creates and appends the necessary CSS styles to the document head.
 * @returns {HTMLStyleElement} The created style element.
 */
function createStyles() {
    // Check if styles are already present (important for React HMR/fast refresh)
    if (document.getElementById(STYLE_ID)) {
        return null;
    }
    
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        :root {
            --primary-color: #007bff;
            --primary-hover: #0056b3;
            --code-bg: #272822;
            --text-color: #343a40;
        }
        .html-form-json-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-width: 900px;
            margin: auto;
            background: #fff;
        }
        .html-form-json-container h1 { font-size: 1.5rem; color: var(--primary-color); text-align: center; margin-bottom: 25px; }
        .html-form-json-container h2 { color: var(--text-color); border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; font-size: 1.25rem; }
        .html-form-json-container textarea {
            width: 100%; height: 180px; padding: 12px; margin-bottom: 15px;
            border: 2px solid #ced4da; border-radius: 8px; box-sizing: border-box;
            font-family: Consolas, monospace; resize: vertical;
        }
        .controls { margin-bottom: 20px; display: flex; justify-content: flex-end; }
        .format-btn {
            padding: 10px 20px; background-color: var(--primary-color); color: white; border: none;
            border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;
        }
        .output-container {
            position: relative; margin-top: 15px; padding: 20px; background-color: var(--code-bg);
            border-radius: 8px; min-height: 100px; overflow-x: auto;
        }
        .json-output {
            white-space: pre-wrap; word-wrap: break-word; font-family: Consolas, "Courier New", monospace;
            font-size: 14px; line-height: 1.4; color: #f8f8f2;
        }
        /* Syntax Highlighting */
        .json-key { color: #f92672; }      
        .json-string { color: #e6db74; }   
        .json-number, .json-boolean, .json-null { color: #ae81ff; } 
        .json-action { color: #66d9ef; font-weight: bold; } 
        .error { color: #ff6a6a; background-color: #4a1d1d; padding: 10px; border-radius: 4px; font-weight: bold; }
        
        /* Copy Button Specifics */
        .copy-btn {
            position: absolute; top: 15px; right: 15px; padding: 8px 12px; background-color: #6c757d; 
            color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; z-index: 10;
        }
    `;
    document.head.appendChild(style);
    return style;
}

/**
 * Removes the component's generated styles from the document head.
 */
function removeStyles() {
    const style = document.getElementById(STYLE_ID);
    if (style && style.parentNode) {
        style.parentNode.removeChild(style);
    }
}

/**
 * Mounts the HTML Form to JSON Converter tool onto the target DOM element.
 * @param {string} elementId The ID of the element where the tool should be mounted.
 * @returns {function} A cleanup function to remove the tool and its styles from the DOM.
 */
function renderFormJson(elementId) {
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
        console.error(`Target element not found with ID: ${elementId}`);
        // Return a dummy cleanup function
        return () => {};
    }

    // 1. Add Styles to the document head and keep a reference
    const styleElement = createStyles();

    // Generate unique IDs for internal elements to avoid collisions
    const inputId = `${elementId}-input`;
    const formatBtnId = `${elementId}-format-btn`;
    const outputId = `${elementId}-output`;
    const copyBtnId = `${elementId}-copy-btn`;

    // 2. Generate and Mount HTML Structure
    targetElement.innerHTML = `
        <div class="html-form-json-container" id="${elementId}-container">
            <h1>📑 HTML Form → JSON Converter</h1>
            
            <h2>1. Enter Escaped or Normal HTML Form Content</h2>
            <textarea id="${inputId}" placeholder="Example: <form action='/submit' method='post'>...</textarea>
            
            <div class="controls">
                <button id="${formatBtnId}" class="format-btn">Convert & Format to JSON</button>
            </div>

            <hr>

            <h2>2. Output JSON Data (Syntax Highlighted)</h2>
            <div class="output-container">
                <button id="${copyBtnId}" class="copy-btn" style="display:none;">COPY</button>
                <pre id="${outputId}" class="json-output">Output will be displayed here...</pre>
            </div>
        </div>
    `;

    // 3. Attach Event Listeners
    const htmlInput = document.getElementById(inputId);
    const formatButton = document.getElementById(formatBtnId);
    const jsonOutput = document.getElementById(outputId);
    const copyButton = document.getElementById(copyBtnId);

    // Set initial example value
    if (htmlInput) {
        htmlInput.value = '<form action="/api/submit-data" method="POST">\n  <input type="text" name="firstName" value="John">\n  <input type="number" name="age" value="30">\n  <input type="checkbox" name="isActive" value="true" checked>\n</form>';
    }

    const formatButtonListener = () => {
        if (!htmlInput || !jsonOutput || !copyButton) return;
        
        const html = htmlInput.value.trim();
        jsonOutput.innerHTML = "Processing...";
        jsonOutput.classList.remove("error");
        copyButton.style.display = 'none';
        
        if (html === "") {
            jsonOutput.innerHTML = "Error: Please enter the HTML Form content.";
            jsonOutput.classList.add("error");
            return;
        }

        try {
            const json = parseEscapedFormHtmlToJson(html);
            const highlightedHtml = highlightJson(json);
            
            jsonOutput.innerHTML = highlightedHtml;
            copyButton.style.display = 'block';

        } catch (error) {
            jsonOutput.innerHTML = `Conversion Error: ${error.message}`;
            jsonOutput.classList.add("error");
            console.error(error);
        }
    };
    
    const copyButtonListener = () => {
        if (!jsonOutput) return;

        const textToCopy = jsonOutput.textContent; 
        const originalText = copyButton.textContent;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyButton.textContent = 'COPIED!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1500);
            })
            .catch(err => {
                alert('Copy failed. Please copy manually.');
            });
    };

    if (formatButton) formatButton.addEventListener("click", formatButtonListener);
    if (copyButton) copyButton.addEventListener("click", copyButtonListener);


    // 4. Return Cleanup Function (CRITICAL for Frameworks like React/Vue)
    return () => {
        if (formatButton) formatButton.removeEventListener("click", formatButtonListener);
        if (copyButton) copyButton.removeEventListener("click", copyButtonListener);
        
        // Remove content from the target element
        targetElement.innerHTML = '';
        
        // Remove styles from the head
        removeStyles();
    };
}

// --- NPM EXPORT ---
// Export the main function so it can be imported by other projects.
export { renderFormJson };