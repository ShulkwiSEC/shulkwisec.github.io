class Source {
    constructor(username, template = 'resources/template.json') {
        this.username = username;
        this.templatePath = template;
        this.data = null;
    }

    async load() {
        if (!this.data) {
            try {
                const res = await fetch(this.templatePath);
                this.data = await res.json();
            } catch (err) {
                console.error("Error loading template:", err);
                this.data = {};
            }
        }
        return this.data;
    }

    render(targetSelector, projects) {
        const container = document.querySelector(targetSelector);
        if (!container) return;
    
        container.className = 'projects-container';
        container.innerHTML = '';
    
        if (!projects || projects.length === 0) {
            container.innerHTML = '<div class="empty-state">No projects found</div>';
            return;
        }
    
        const fragment = document.createDocumentFragment();
        projects.forEach((proj, index) => {
            const card = document.createElement('article');
            card.className = 'project-card';
        
            const bannerHtml = `<img src="${proj.banner || 'https://placehold.co/600x400.png?text='+proj.name}" class="project-banner" alt="${proj.name} banner" loading="lazy">`;
        
            // check if description is "long" (e.g., >100 chars)
            const isLong = proj.description && proj.description.length > 100;
            let descriptionHtml = '';
            if (proj.description) {
                if (isLong) {
                    const toggleId = `readmore-${index}`;
                    descriptionHtml = `
                    <div class="project-description-wrapper">
                        <input type="checkbox" id="${toggleId}" class="readmore-toggle">
                        <p class="project-description">${this.escapeHtml(proj.description)}</p>
                        <label for="${toggleId}" class="readmore-label">Read more</label>
                    </div>`;
                } else {
                    descriptionHtml = `<p class="project-description">${this.escapeHtml(proj.description)}</p>`;
                }
            }
        
            card.innerHTML = `
                ${bannerHtml}
                <div class="project-content">
                    <h3 class="project-title">${this.escapeHtml(proj.name)}</h3>
                    ${descriptionHtml}
                    <a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="project-link">View Project</a>
                </div>
            `;
            fragment.appendChild(card);
        });
    
        container.appendChild(fragment);
    }


    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async public(targetSelector) {
        const data = await this.load();
        const projects = data?.sources?.public || [];
        this.render(targetSelector, projects);
    }

    async private(targetSelector) {
        const data = await this.load();
        const projects = data?.sources?.private || [];
        this.render(targetSelector, projects);
    }
}