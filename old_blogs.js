class BlogsManager {
  static blogs = [];
  static allTags = new Set();
  static currentModal = null;

  static async init() {
    try {
      const response = await fetch("resources/template.json");
      if (!response.ok) throw new Error("Failed to load blogs");

      const data = await response.json();
      this.blogs = data?.resources?.blogs || [];
      if (!Array.isArray(this.blogs)) throw new Error("Invalid data structure");

      this.collectTags();
      this.renderTagsFilter();
      this.renderBlogs();
      this.setupModalCloseEvent();
      this.handleUrlParams();
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

    const decoded = encoding ? decodeURIComponent(escape(atob(content))) : content;
    document.getElementById("blogContent").innerHTML = DOMPurify.sanitize(marked.parse(decoded));

    document.querySelectorAll('#blogContent pre code').forEach(block => hljs.highlightElement(block));

    const url = new URL(window.location);
    if (url.searchParams.get('id') !== index.toString()) {
      url.searchParams.set("id", index);
      window.history.pushState({}, "", url);
    }

    if (!this.currentModal) this.currentModal = new bootstrap.Modal(document.getElementById("blogModal"));
    this.currentModal.show();
  }

  static renderBlogs(tagsFilter = []) {
    const container = document.getElementById("none-embed-blogs");
    container.innerHTML = "";

    this.blogs.forEach((blog, i) => {
      const match = tagsFilter.length === 0 || (blog.tags || []).some(t => tagsFilter.includes(t));
      if (!match) return;

      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6 unified-card-col";

      const blogCard = document.createElement("div");
      blogCard.className = "unified-card";
      blogCard.dataset.index = i;

      blogCard.innerHTML = `
        <div class="unified-card-media">
            <img src="${blog.banner}" alt="${blog.title}" loading="lazy">
        </div>
        <div class="unified-card-content">
            <h5 class="unified-card-title">${blog.title}</h5>
            <p class="unified-card-text">${blog.description}</p>
            <div class="unified-card-tags">
                ${(blog.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join("")}
            </div>
        </div>
      `;

      blogCard.addEventListener("click", () => this.showBlog(blog, i));
      col.appendChild(blogCard);
      container.appendChild(col);
    });
  }

  static renderTagsFilter() {
    const filter = document.getElementById("blog-tags-filter");
    filter.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.className = "tag-chip active";
    allBtn.innerText = "All";
    allBtn.addEventListener("click", () => {
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
        filter.querySelector(".tag-chip:first-child").classList.remove("active");
        btn.classList.toggle("active");

        const selected = Array.from(filter.querySelectorAll(".tag-chip.active"), el => el.innerText);
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

  static handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    if (blogId !== null) {
      const index = parseInt(blogId, 10);
      if (!isNaN(index) && this.blogs[index]) this.showBlog(this.blogs[index], index);
    } else {
      this.currentModal?.hide();
    }
  }

  static setupModalCloseEvent() {
    const modalEl = document.getElementById('blogModal');
    modalEl.addEventListener('hidden.bs.modal', () => {
      const url = new URL(window.location);
      if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => BlogsManager.init());
