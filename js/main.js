class ProjectsManager {
    constructor(containerId, jsonPath) {
        this.container = document.getElementById(containerId);
        this.jsonPath = jsonPath;
        this.projects = [];
    }

    async fetchProjects() {
        try {
            const res = await fetch(this.jsonPath);
            if (!res.ok) throw new Error("Failed to fetch JSON");

            const data = await res.json();
            this.projects = data?.resources?.projects || [];
            console.log('✅ Projects loaded.');
        } catch (err) {
            console.error("❌ Could not load projects:", err);
            this.projects = [];
        }

        this.loadProjects();
    }

    loadProjects() {
        if (!this.container) return;
        this.container.innerHTML = "";

        this.projects.forEach(project => {
            const col = document.createElement("div");
            col.classList.add("col-md-4", "mb-4", "d-flex");

            const card = document.createElement("div");
            card.classList.add("portfolio-card", "flex-fill");

            const mediaContent = project.html
                ? project.html
                : project.embed
                    ? `<iframe src="${project.embed}" style="border:0;" loading="lazy"></iframe>`
                    : project.image
                        ? `<img src="${project.image}" alt="${project.title}">`
                        : "";

            card.innerHTML = `
                <div class="portfolio-media">
                    ${mediaContent}
                </div>
                <div class="portfolio-overlay">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    ${project.tags?.length ? `<div class="tags">
                        ${project.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ')}
                    </div>` : ""}
                </div>
            `;

            col.appendChild(card);
            this.container.appendChild(col);
        });
    }

    init() {
        this.fetchProjects();
    }
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const manager = new ProjectsManager("portfolio-projects", "/resources/template.json");
    manager.init();
});
