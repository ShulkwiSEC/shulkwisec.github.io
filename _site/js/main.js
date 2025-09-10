class ProjectsManager {
    constructor(containerId, jsonPath) {
        this.container = document.getElementById(containerId);
        this.jsonPath = jsonPath;
        this.projects = [];
    }

    async fetchProjects() {
        const res = await fetch(this.jsonPath).catch(() => null);
        this.projects = res ? await res.json() : [];
        console.log('✅ Projects loaded.');
        this.loadProjects();
    }

    loadProjects() {
        if (!this.container) return;
        this.container.innerHTML = "";

        this.projects.forEach(project => {
            const col = document.createElement("div");
            col.classList.add("col-md-4", "mb-4", "d-flex");

            const card = document.createElement("div");
            card.classList.add("portfolio-card", "flex-fill", "d-flex", "flex-column");

            const media = project.html
                ? `<div class="flex-fill">${project.html}</div>`
                : project.embed
                    ? `<iframe src="${project.embed}" class="w-100 flex-fill" style="border:0; border-radius:8px;" loading="lazy"></iframe>`
                    : project.image
                        ? `<img src="${project.image}" class="img-fluid flex-fill" alt="${project.title}">`
                        : "";

            card.innerHTML = `
                ${media}
                <div class="portfolio-overlay mt-auto">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    ${project.tags ? `<div class="tags">
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
    const manager = new ProjectsManager("portfolio-projects", "/resources/projects.json");
    manager.init();
});