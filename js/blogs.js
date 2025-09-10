class BlogsManager {
  static blogs = [];
  static allTags = new Set();
  static currentModal = null; // To keep track of the modal instance

  static async init() {
    try {
      const response = await fetch("resources/blogs.json");
      if (!response.ok) throw new Error("Failed to load blogs");
      const data = await response.json();

      this.blogs = Array.isArray(data) ? data : data.BLOGS || [];
      if (!Array.isArray(this.blogs)) throw new Error("Invalid data.json structure");

      this.collectTags();
      this.renderTagsFilter();
      this.renderBlogs();
      this.setupModalCloseEvent(); // New: Listen for modal close to clean URL

      // Check URL for an ID on initial page load
      this.handleUrlParams();

      // Listen for back/forward browser button clicks
      window.addEventListener("popstate", () => this.handleUrlParams());
    } catch (err) {
      console.error("Error loading blogs:", err);
    }
  }

  static collectTags() {
    this.allTags.clear();
    this.blogs.forEach(b => (b.tags || []).forEach(t => this.allTags.add(t)));
  }

  static showBlog(blog, index) {
    const { title, banner, description, content, encoding } = blog;
    document.getElementById("blogModalLabel").innerText = title;
    document.getElementById("blogBanner").src = banner;
    document.getElementById("blogDescription").innerText = description;

    const decoded = encoding
      ? decodeURIComponent(escape(atob(content)))
      : content;

    document.getElementById("blogContent").innerHTML =
      DOMPurify.sanitize(marked.parse(decoded));

    // Ensure code blocks are highlighted after content is added
    document.querySelectorAll('#blogContent pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Update URL without reloading the page
    const url = new URL(window.location);
    if (url.searchParams.get('id') !== index.toString()) {
        url.searchParams.set("id", index);
        window.history.pushState({}, "", url);
    }

    // Initialize and show the modal
    const modalEl = document.getElementById("blogModal");
    if (!this.currentModal) {
      this.currentModal = new bootstrap.Modal(modalEl);
    }
    this.currentModal.show();
  }

  static renderBlogs(tagsFilter = []) {
    const container = document.getElementById("none-embed-blogs");
    container.innerHTML = "";

    this.blogs.forEach((blog, i) => {
      const match =
        tagsFilter.length === 0 ||
        (blog.tags || []).some(t => tagsFilter.includes(t));

      if (!match) return;

      // Create the blog card directly without Bootstrap column wrapper
      const blogCard = document.createElement("div");
      blogCard.className = "blog-card";
      blogCard.dataset.index = i;
      
      blogCard.innerHTML = `
        <img src="${blog.banner}" class="card-img-top" alt="${blog.title}" loading="lazy">
        <div class="card-content">
          <h5 class="card-title">${blog.title}</h5>
          <p class="card-text">${blog.description}</p>
          <div class="tags-scroll">
            ${(blog.tags || [])
              .map(t => `<span class="tag-chip">${t}</span>`)
              .join("")}
          </div>
        </div>
      `;
      
      blogCard.addEventListener("click", () => this.showBlog(blog, i));
      container.appendChild(blogCard);
    });
  }

  static renderTagsFilter() {
    const filter = document.getElementById("blog-tags-filter");
    filter.innerHTML = "";

    // Add "All" filter option
    const allBtn = document.createElement("button");
    allBtn.className = "tag-chip active";
    allBtn.innerText = "All";
    allBtn.addEventListener("click", () => {
      // Remove active from all other chips
      filter.querySelectorAll(".tag-chip").forEach(chip => chip.classList.remove("active"));
      allBtn.classList.add("active");
      this.renderBlogs([]);
    });
    filter.appendChild(allBtn);

    this.allTags.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "tag-chip";
      btn.innerText = tag;

      btn.addEventListener("click", () => {
        // Remove active from "All" button
        filter.querySelector(".tag-chip:first-child").classList.remove("active");
        
        btn.classList.toggle("active");
        const selected = Array.from(
          filter.querySelectorAll(".tag-chip.active"),
          el => el.innerText
        );
        
        // If no tags are selected, show all blogs
        if (selected.length === 0) {
          filter.querySelector(".tag-chip:first-child").classList.add("active");
          this.renderBlogs([]);
        } else {
          this.renderBlogs(selected);
        }
      });

      filter.appendChild(btn);
    });
  }

  /**
   * New: load blog via url parameter.
   */
  static handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    if (blogId !== null) {
      const index = parseInt(blogId, 10);
      if (!isNaN(index) && this.blogs[index]) {
        this.showBlog(this.blogs[index], index);
      }
    } else {
        if (this.currentModal) {
            this.currentModal.hide();
        }
    }
  }
  
  static setupModalCloseEvent() {
      const modalEl = document.getElementById('blogModal');
      modalEl.addEventListener('hidden.bs.modal', () => {
          // Clears the "?id=" from URL without reloading
          const url = new URL(window.location);
          if (url.searchParams.has('id')) {
              url.searchParams.delete('id');
              window.history.pushState({}, '', url);
          }
      });
  }
}

document.addEventListener("DOMContentLoaded", () => BlogsManager.init());