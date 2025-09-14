class TemplateSearch {
  constructor(jsonPath) {
    this.jsonPath = jsonPath;
    this.resources = {};
    this.maps = {};
  }

  async init() {
    const res = await fetch(this.jsonPath);
    const json = await res.json();
    this.resources = json.resources || {};
    this.maps = json.map || {};
  }

  search(query) {
    if (!query) return [];
    query = query.toLowerCase();

    const results = [];

    // loop over all resource types dynamically
    for (const type in this.resources) {
      const items = this.resources[type];
      const filtered = items
        .filter(item =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        )
        .map(item => ({ ...item, _type: type })); // keep type for mapping

      results.push(...filtered);
    }

    return results;
  }

  renderResults(results, containerId = "results") {
    const container = document.getElementById(containerId);
    const nav = document.querySelector(".mobile-menu-nav");

    if (!results.length) {
      container.style.display = "none";
      if (nav) nav.style.display = "block";
      return;
    }

    if (nav) nav.style.display = "none";
    container.style.display = "block";

    Object.assign(container.style, {
      marginTop: "15px",
      maxWidth: "90vw",
      maxHeight: "60vh",
      overflowY: "auto",
      padding: "10px",
      borderRadius: "8px",
      background: "rgba(0,0,0,0.6)",
      boxShadow: "0 0 10px rgba(0,255,65,0.4) inset"
    });

    container.innerHTML = results.map(r => {
      const mapInfo = this.maps[r._type];
      const link = mapInfo && r[mapInfo.key] ? `${mapInfo.format}${r[mapInfo.key]}` : "#";

      return `
        <a href="${link}" style="text-decoration:none">
          <div style="padding:10px; margin-bottom:8px; border-bottom:1px solid rgba(0,255,65,0.3); cursor:pointer"
               onmouseover="this.style.background='rgba(0,255,65,0.1)'" 
               onmouseout="this.style.background='transparent'">
            <h5 style="margin:0; color:#00ff41">${r.title}</h5>
            <p style="margin:5px 0; font-size:0.9rem; color:#ddd">${r.description || ""}</p>
            <small style="color:#aaa">${(r.tags || []).join(", ")}</small>
            <small style="color:#0f0; font-size:0.75rem; display:block; margin-top:3px;">${r._type}</small>
          </div>
        </a>
      `;
    }).join("");
  }
}
