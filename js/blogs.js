async function loadBlogs() {
  try {
    // Load blog data from JSON file
    const response = await fetch('resources/data.json');
    if (!response.ok) throw new Error('Failed to load blogs');
    const BLOGS = await response.json();
    function showBlog(blog) {
      document.getElementById("blogModalLabel").innerText = blog.title;
      document.getElementById("blogBanner").src = blog.banner;
      document.getElementById("blogDescription").innerText = blog.description;
      let encoding = blog.encoding ? true : false;
      let content = encoding ? decodeURIComponent(escape(atob(blog.content))) : blog.content;
      document.getElementById("blogContent").innerHTML = DOMPurify.sanitize(marked.parse(content));
      new bootstrap.Modal(document.getElementById("blogModal")).show();      
    }

    // Render blog posts
    function renderBlogs() {
      const noneEmbedContainer = document.getElementById("none-embed-blogs");
      BLOGS.BLOGS.forEach((blog, index) => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
          <div class="card h-100 blog-card shadow-sm" data-index="${index}">
            <img src="${blog.banner}" class="card-img-top" alt="${blog.title}">
            <div class="card-body">
              <h5 class="card-title">${blog.title}</h5>
              <p class="card-text">${blog.description}</p>
            </div>
          </div>
        `;
        col.addEventListener("click", () => showBlog(blog));
        noneEmbedContainer.appendChild(col);
      });
    }
    renderBlogs();
  } catch (error) {
    console.error("Error loading blogs:", error);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", loadBlogs);