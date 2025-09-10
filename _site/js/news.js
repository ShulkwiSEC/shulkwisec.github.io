async function loadTopStories() {
    try {
        // Fetch top stories ID from Hacker News API
        document.getElementById('lableofNews').innerText = 'Top News 📋'
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
        if (!response.ok) throw new Error('Failed to load top stories');
        const topStoryIds = await response.json();
        
        // Get the first 5 (or as many as you need) stories
        const topStories = await Promise.all(topStoryIds.slice(0, 5).map(async (id) => {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
            return await storyResponse.json();
        }));

        // Render top stories
        renderStories(topStories);
    } catch (error) {
        console.error("Error loading top stories:", error);
    }
}

async function loadBestStories() {
    try {
        // Fetch top stories ID from Hacker News API
        document.getElementById('lableofNews').innerText = 'Best News 📋'
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
        if (!response.ok) throw new Error('Failed to load top stories');
        const topStoryIds = await response.json();
        
        // Get the first 50 stories (or adjust as needed)
        const topStories = await Promise.all(topStoryIds.slice(0, 50).map(async (id) => {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
            return await storyResponse.json();
        }));

        // Filter best stories based on the score
        const bestStories = topStories.filter(story => story.score >= 100); // Adjust score threshold as needed
        bestStories.sort((a, b) => b.score - a.score); // Sort stories by score in descending order

        // Render the best stories
        renderStories(bestStories);
    } catch (error) {
        console.error("Error loading best stories:", error);
    }
}

async function loadNewStories() {
    try {
        document.getElementById('lableofNews').innerText = ''
        // Fetch new stories ID from Hacker News API
        const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty');
        if (!response.ok) throw new Error('Failed to load new stories');
        const newStoryIds = await response.json();
        
        // Get the first 5 (or as many as you need) stories
        const newStories = await Promise.all(newStoryIds.slice(0, 5).map(async (id) => {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
            return await storyResponse.json();
        }));

        // Render new stories
        renderStories(newStories);
    } catch (error) {
        console.error("Error loading new stories:", error);
    }
}

function renderStories(stories) {
    const container = document.getElementById("none-embed-news");
    container.innerHTML = ''; // Clear existing content
    
    stories.forEach(story => {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
            <div class="card h-100 news-card shadow-sm" data-id="${story.id}">
                <img src="${story.url ? `https://www.google.com/s2/favicons?domain=${story.url}` : 'default-icon.png'}" class="card-img-top" alt="${story.title}">
                <div class="card-body">
                    <h5 class="card-title">${story.title}</h5>
                    <p class="card-text">${story.text ? story.text.slice(0, 150) + '...' : 'No description available.'}</p>
                </div>
            </div>
        `;
        col.addEventListener("click", () => showStory(story));
        container.appendChild(col);
    });
}

function showStory(story) {
    document.getElementById("newsModalLabel").innerText = story.title;
    document.getElementById("newsContent").innerHTML = `
        <p><strong>By:</strong> ${story.by}</p>
        <p><strong>Published:</strong> ${new Date(story.time * 1000).toLocaleString()}</p>
        <p><strong>Score:</strong> ${story.score}</p>
        <p><strong>Comments:</strong> ${story.descendants}</p>
        <p><strong>Read the full story:</strong> <a href="${story.url}" target="_blank">${story.url}</a></p>
    `;
    new bootstrap.Modal(document.getElementById("newsModal")).show();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadTopStories();  // To load top stories initially
    loadNewStories();  // To load new stories alongside top stories
});

// Add event listeners for the filters
document.getElementById("filter-top-stories").addEventListener("click", loadTopStories);
document.getElementById("filter-best-stories").addEventListener("click", loadBestStories);
document.getElementById("filter-new-stories").addEventListener("click", loadNewStories);
