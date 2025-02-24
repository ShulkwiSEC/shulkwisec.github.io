document.addEventListener("DOMContentLoaded", () => {
  // Find all custom elements in test.html (anywhere in the document)
  const testCustomElements = Array.from(document.querySelectorAll("*"))
    .filter(el => el.tagName.toLowerCase().startsWith("page"));

  // Build a map of tagName => innerHTML (remove unwanted scripts)
  const contentMap = {};
  testCustomElements.forEach(el => {
    // Remove any recursive script element(s)
    el.querySelectorAll('script[src="app.js"]').forEach(script => script.remove());
    contentMap[el.tagName.toLowerCase()] = el.innerHTML;
  });

  // Fetch the base template
  fetch("base.html")
    .then(response => response.text())
    .then(templateText => {
      // Parse the fetched base.html into a document
      const parser = new DOMParser();
      const baseDoc = parser.parseFromString(templateText, "text/html");

      // For each custom element found in test.html, replace the matching element in base.html
      Object.keys(contentMap).forEach(tagName => {
        const targetElem = baseDoc.querySelector(tagName);
        if (targetElem) {
          targetElem.innerHTML = contentMap[tagName];
        } else {
          console.warn(`No matching <${tagName}> element found in base.html`);
        }
      });

      // Replace the current document with the modified base template
      document.open();
      document.write(baseDoc.documentElement.outerHTML);
      document.close();

      // Wait for the new document to be fully loaded before executing other scripts
      window.onload = () => {
        console.log("New document is fully loaded.");
        // You can add any additional JavaScript logic here
      };
    })
    .catch(error => console.error("Error fetching base.html:", error));
});
