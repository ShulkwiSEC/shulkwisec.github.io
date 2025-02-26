(function () {
    // Define website routes
    const routes = {
        "/": "Home",
        "/blogs.html": "Blogs",
        "/certificats.html": "Certificates",
        "/news.html": "News"
    };

    // Get current route
    const currentPath = window.location.pathname;

    // Filter out the current route from the suggestions
    const seeAlsoLinks = Object.entries(routes)
        .filter(([path]) => path !== currentPath)
        .map(([path, name]) => `<a href="${path}">${name}</a>`)
        .join(" | ");

    // Create the See Also section
    if (seeAlsoLinks) {
        const seeAlsoDiv = document.createElement("div");
        seeAlsoDiv.id = "see-also";
        seeAlsoDiv.innerHTML = `<strong>See Also:</strong> ${seeAlsoLinks}`;
        
        // Style the See Also section
        seeAlsoDiv.style.position = "fixed";
        seeAlsoDiv.style.bottom = "10px";
        seeAlsoDiv.style.left = "50%";
        seeAlsoDiv.style.transform = "translateX(-50%)";
        seeAlsoDiv.style.background = "rgba(0, 0, 0, 0.8)";
        seeAlsoDiv.style.color = "white";
        seeAlsoDiv.style.padding = "5px 10px";
        seeAlsoDiv.style.borderRadius = "5px";
        seeAlsoDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        seeAlsoDiv.style.zIndex = "1000";
        
        document.body.appendChild(seeAlsoDiv);
    }
})();