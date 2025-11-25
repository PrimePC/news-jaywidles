document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const dateDisplay = document.getElementById('current-date');
    const timeDisplay = document.getElementById('current-time');
    
    let newsData = {};

    // 1. Time and Date Display
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateDisplay.innerText = now.toLocaleDateString('en-US', dateOptions).toUpperCase();
        
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
            
            // Determine structure. Your n8n "Format JSON" node returns a flat object,
            // but we keep the check just in case the structure changes.
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

    // 3. Helper: Format Content
    function formatContent(contentString) {
        if (!contentString) return '';

        // Regex to swap date and topic.
        // It looks for: <b>[Date] (Optional "Topic:") TheTitle:</b>
        // And replaces it with: <b>TheTitle:</b> [Date]
        let processedContent = contentString.replace(
            /<b>\[(.*?)\]\s*(?:Topic:\s*)?(.*?):<\/b>/g, 
            '<b>$2:</b> <span style="font-size: 0.85em; opacity: 0.7;">[$1]</span>'
        );

        return `<ul>${processedContent}</ul>`;
    }

    // 4. Render Content
    function renderNews(categoryKey) {
        const keyMap = {
            'world': 'world_news',
            'us': 'us_news',
            'tech': 'tech_news',
            'finance': 'financial_news',
            'conspiracies': 'conspiracies'
        };

        const titleMap = {
            'world': 'World Events',
            'us': 'US Headlines',
            'tech': 'Technology',
            'finance': 'Financial Markets',
            'conspiracies': 'The Rabbit Hole'
        };

        const jsonKey = keyMap[categoryKey];
        const content = newsData[jsonKey];
        const displayTitle = titleMap[categoryKey];

        // Clear container
        newsContainer.innerHTML = '';
        newsContainer.style.opacity = 0;

        setTimeout(() => {
            if (!content) {
                newsContainer.innerHTML = `
                    <div class="news-card">
                        <h2>${displayTitle}</h2>
                        <p>No data available for this category.</p>
                    </div>`;
            } else {
                // Use the helper function defined above
                const htmlContent = formatContent(content);
                
                newsContainer.innerHTML = `
                    <div class="news-card">
                        <h2>${displayTitle}</h2>
                        <div class="news-body">
                            ${htmlContent}
                        </div>
                    </div>`;
            }
            newsContainer.style.opacity = 1;
        }, 200);
    }

    // 5. Tab Switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            renderNews(category);
        });
    });

    // Initialize
    fetchNews();
});