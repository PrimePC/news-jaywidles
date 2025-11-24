document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const dateDisplay = document.getElementById('current-date');
    const timeDisplay = document.getElementById('current-time');
    
    let newsData = {};

    // 1. Time and Date Display
    function updateDateTime() {
        const now = new Date();
        // Date: Monday, Nov 24, 2024
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateDisplay.innerText = now.toLocaleDateString('en-US', dateOptions).toUpperCase();
        
        // Time: 14:05 EST
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
        timeDisplay.innerText = now.toLocaleTimeString('en-US', timeOptions);
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 2. Fetch Data
    async function fetchNews() {
        try {
            // Add a timestamp to prevent caching
            const response = await fetch('news_data.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error("Could not load news data");
            
            const rawData = await response.json();
            
            // Determine structure based on N8N output
            // We expect rawData to look like: { categories: { world: "...", us: "..." } } 
            // Or flat: { world_news: "...", us_news: "..." }
            newsData = rawData.categories || rawData; 

            // Render default category (World)
            renderNews('world');
            
        } catch (error) {
            console.error(error);
            newsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Uplink Offline. Unable to fetch daily summary.</p>
                </div>`;
        }
    }

    // 3. Render Content
    function renderNews(categoryKey) {
        // Map button data-category to JSON keys
        const keyMap = {
            'world': 'world_news',
            'us': 'us_news',
            'tech': 'tech_news',
            'finance': 'financial_news',
            'conspiracies': 'conspiracies'
        };

        const jsonKey = keyMap[categoryKey];
        const content = newsData[jsonKey];

        // Clear container
        newsContainer.innerHTML = '';
        newsContainer.style.opacity = 0;

        setTimeout(() => {
            if (!content) {
                newsContainer.innerHTML = `<p>No data available for ${categoryKey.toUpperCase()}.</p>`;
            } else {
                // Convert Markdown-style bullets to HTML if N8N sends markdown
                const htmlContent = parseMarkdown(content);
                newsContainer.innerHTML = `<div class="news-content">${htmlContent}</div>`;
            }
            newsContainer.style.opacity = 1;
        }, 200);
    }

    // Helper: Simple Markdown to HTML parser
    function parseMarkdown(text) {
        if (!text) return "";
        // Convert **Bold** to <strong>
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert - Bullet to <li>
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        // Convert new lines to <br> or wrap list
        return `<ul>${html}</ul>`; 
    }

    // 4. Tab Switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            navButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            renderNews(category);
        });
    });

    // Initialize
    fetchNews();
});