

    async function fetchProjects() {
        try {
            const response = await fetch('/Projects/main.json');
            const data = await response.json();
            console.log(data); // استخدم البيانات هنا
            return data;
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    }

// Projects loader 
const Projects = [
    {
        title: "Vulnerability Research",
        description: "Advanced exploit development for modern systems.",
        image: "https://www.itsecurityguru.org/wp-content/uploads/2018/03/thumb_shutterstock_318112670_1024-800x450.jpg"
    },
    {
        title: "Penetration Testing",
        description: "Comprehensive security assessments and pentesting.",
        image: "https://evalian.co.uk/wp-content/uploads/2020/11/What-is-penetration-testing-Evalian.png"
    },
    {
        title: "Bug Bounty Hunting",
        description: "Hunting and responsibly disclosing vulnerabilities.",
        image: "https://miro.medium.com/v2/resize:fit:1400/0*xw5dY10MSpiF4mjR.png"
    }
    ];
    function loadProjects() {
        const projectContainer = document.getElementById("portfolio-projects");
        projectContainer.innerHTML = "";
        
        Projects.forEach(project => {
            const projectCard = document.createElement("div");
            projectCard.classList.add("col-md-4");
            projectCard.innerHTML = `
            <div class="portfolio-card">
                <img src="${project.image}" class="img-fluid" alt="${project.title}">
                <div class="portfolio-overlay">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                </div>
            </div>
            `;
            
            projectContainer.appendChild(projectCard);
        });
    }
    document.addEventListener("DOMContentLoaded", loadProjects)