async function loadBlogs() {
  try {
    // Load blog data from JSON file
    const response = await fetch('resources/data.json');
    if (!response.ok) throw new Error('Failed to load blogs');
    const data = await response.json();
    
    // Support both array and { BLOGS: [] } structures:
    let blogs = [];
    if (Array.isArray(data)) {
      blogs = data;
    } else if (data.BLOGS && Array.isArray(data.BLOGS)) {
      blogs = data.BLOGS;
    } else {
      console.error("Invalid data structure in data.json");
      return;
    }

    // Pre-calculate all unique tags from the blogs
    const allTags = new Set();
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => allTags.add(tag));
      }
    });
    console.log("All Tags:", Array.from(allTags));
    
    // Function to show blog content in modal
    function showBlog(blog) {
      document.getElementById("blogModalLabel").innerText = blog.title;
      document.getElementById("blogBanner").src = blog.banner;
      document.getElementById("blogDescription").innerText = blog.description;
      const isEncoded = blog.encoding ? true : false;
      const content = isEncoded 
                        ? decodeURIComponent(escape(atob(blog.content))) 
                        : blog.content;
      document.getElementById("blogContent").innerHTML = DOMPurify.sanitize(marked.parse(content));
      hljs.highlightAll();
      new bootstrap.Modal(document.getElementById("blogModal")).show();      
    }

    // Render blog posts; optionally filter by selected tags
    function renderBlogs(tagsFilter = []) {
      const container = document.getElementById("none-embed-blogs");
      container.innerHTML = '';  // Clear previous content

      blogs.forEach((blog, index) => {
        // Only display blog if no filter is selected or if it matches one of the selected tags
        const matchesFilter = tagsFilter.length === 0 || blog.tags.some(tag => tagsFilter.includes(tag));
        if (matchesFilter) {
          const col = document.createElement("div");
          col.className = "col-md-4 mb-4";
          col.innerHTML = `
            <div class="card h-100 blog-card shadow-sm" data-index="${index}">
              <img src="${blog.banner}" class="card-img-top" alt="${blog.title}">
              <div class="card-body">
                <h5 class="card-title">${blog.title}</h5>
                <p class="card-text">${blog.description}</p>
                <div class="tags">
                  ${blog.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ')}
                </div>
              </div>
            </div>
          `;
          col.addEventListener("click", () => showBlog(blog));
          container.appendChild(col);
        }
      });
    }

    // Render the tag filter checkboxes in the unique container
    function renderTagsFilter() {
      const tagFilterContainer = document.getElementById("blog-tags-filter");
      tagFilterContainer.innerHTML = '';  // Clear any existing content

      // Create a checkbox for each unique tag
      allTags.forEach(tag => {
        const div = document.createElement("div");
        div.className = "form-check form-check-inline";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input";
        checkbox.id = `tag-${tag}`;
        checkbox.value = tag;

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.setAttribute("for", `tag-${tag}`);
        label.innerText = tag;

        div.appendChild(checkbox);
        div.appendChild(label);
        tagFilterContainer.appendChild(div);

        // Update the blogs display when a checkbox is toggled
        checkbox.addEventListener("change", () => {
          const selectedTags = Array.from(tagFilterContainer.querySelectorAll("input:checked"))
                                    .map(input => input.value);
          renderBlogs(selectedTags);
        });
      });
    }

    // Render the filters and blogs
    renderTagsFilter();
    renderBlogs();
  } catch (error) {
    console.error("Error loading blogs:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadBlogs);