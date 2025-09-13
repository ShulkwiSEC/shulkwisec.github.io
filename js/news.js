class NewsManager {
  static stories = [];
  static currentFilter = "top";

  static async init() {
    this.setupFilterButtons();
    await this.loadStories(this.currentFilter);
  }

  static setupFilterButtons() {
    document.getElementById("filter-top-stories").addEventListener("click", () => this.changeFilter("top"));
    document.getElementById("filter-best-stories").addEventListener("click", () => this.changeFilter("best"));
    document.getElementById("filter-new-stories").addEventListener("click", () => this.changeFilter("new"));
  }

  static async changeFilter(filter) {
    this.currentFilter = filter;
    await this.loadStories(filter);
  }

  static async loadStories(filter) {
    try {
      const labelEl = document.getElementById("lableofNews");
      labelEl.innerText = filter === "top" ? "Top News 📋" : filter === "best" ? "Best News 📋" : "New News 📋";

      const url = filter === "new"
        ? "https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty"
        : "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty";

      const res = await fetch(url);
      const storyIds = await res.json();
      let sliceCount = filter === "best" ? 50 : 5;

      let storiesData = await Promise.all(
        storyIds.slice(0, sliceCount).map(async id => {
          const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
          return await r.json();
        })
      );

      if (filter === "best") storiesData = storiesData.filter(s => s.score >= 100).sort((a,b)=>b.score-a.score);

      this.stories = storiesData;
      this.renderStories();
    } catch(e) { console.error(e); }
  }

  static renderStories() {
    const container = document.getElementById("none-embed-news");
    container.innerHTML = "";

    this.stories.forEach(story => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      col.innerHTML = `
        <div class="card h-100 news-card" data-id="${story.id}">
          <img src="${story.url ? `https://www.google.com/s2/favicons?domain=${story.url}` : 'default-icon.png'}" class="card-img-top" alt="${story.title}">
          <div class="card-body">
            <h5 class="card-title">${story.title}</h5>
            <p class="card-text">${story.text ? story.text.slice(0,150)+'...' : 'No description available.'}</p>
          </div>
        </div>
      `;
      col.addEventListener("click", () => this.openInModal(story.url || "about:blank"));
      container.appendChild(col);
    });
  }

  static openInModal(url) {
    const frame = document.getElementById("autoModalFrame");
    const infoBar = document.getElementById("infoBar");
    frame.src = url;
    infoBar.innerText = `Viewing: ${url}`;
    const modalEl = document.getElementById("autoLinkModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    frame.onload = () => {
      infoBar.innerText = `Loaded: ${url}`;
      try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        if(doc) {
          doc.querySelectorAll("header, nav, footer, .ads, .popup").forEach(el => el.remove());
          doc.body.style.margin = "2rem";
          doc.body.style.background = "#fff";
          doc.body.style.color = "#000";
          doc.body.style.fontFamily = "sans-serif";
        }
      } catch(e) {
        console.log("Cannot clean external page due to CORS");
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", () => NewsManager.init());