/* START OF FILE script.js */

// --- 1. Clock & Date Functions ---

function updateTime() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');

    const now = new Date();
    
    // Format Time for EST
    const timeOptions = { 
        timeZone: 'America/New_York', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
    timeElement.innerText = `${timeString} EST`;

    // Format Date
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    dateElement.innerText = dateString;
}

// Update clock every second
setInterval(updateTime, 1000);
updateTime(); // Run immediately

// --- 2. Data Management ---

// This mimics the JSON structure your n8n workflow should output.
// If fetch fails, this data shows up.
const fallbackData = {
    world: [
        { title: "Global Summit Reaches Agreement", summary: "World leaders have agreed on a comprehensive framework for digital trade safety." },
        { title: "Energy Breakthrough in Europe", summary: "Scientists in France announce a new efficiency record for solar storage cells." }
    ],
    us: [
        { title: "Market Rally Continues", summary: "US Markets closed higher today driven by tech sector performance." },
        { title: "Senate Passes New Infrastructure Bill", summary: "The long-awaited bill moves to the house, promising upgrades to national grid systems." }
    ],
    tech: [
        { title: "AI Model Generates Entire Codebase", summary: "A new startup claims their AI can write enterprise ERP software in minutes." },
        { title: "Quantum Computing Milestone", summary: "Researchers achieve stable qubits for 5 minutes, shattering previous records." }
    ],
    finance: [
        { title: "Crypto Regulation Talks", summary: "Federal agencies meet to discuss standardizing stablecoin issuance." },
        { title: "Housing Market Trends", summary: "Analysts predict a cooling period for Q3 as interest rates stabilize." }
    ],
    conspiracies: [
        { title: "Signal Anomalies Detected", summary: "Amateur radio enthusiasts report strange patterns from the northern hemisphere." },
        { title: "The Underground City Theory", summary: "New scans of Antarctica reveal geometric density structures beneath the ice." }
    ]
};

let newsData = fallbackData; // Default to fallback

async function fetchNews() {
    try {
        // Point this to where n8n saves the file
        const response = await fetch('latest-news.json?t=' + new Date().getTime()); 
        if (!response.ok) throw new Error("JSON not found");
        const data = await response.json();
        newsData = data;
        console.log("Live news data loaded.");
    } catch (error) {
        console.log("Using fallback/cached data.");
    }
    // Render the default category (World) after fetch attempt
    renderCategory('world'); 
}

// --- 3. UI Rendering ---

const container = document.getElementById('news-container');
const buttons = document.querySelectorAll('.nav-btn');

function renderCategory(category) {
    container.innerHTML = ''; // Clear current content
    
    // Get data for category
    const items = newsData[category] || [];

    if(items.length === 0) {
        container.innerHTML = `<div class="loading-state">No news available for this category today.</div>`;
        return;
    }

    // Create cards
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        // Stagger animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        const h2 = document.createElement('h2');
        h2.innerText = item.title;
        
        const p = document.createElement('p');
        p.innerText = item.summary;
        
        card.appendChild(h2);
        card.appendChild(p);
        container.appendChild(card);
    });
}

// --- 4. Event Listeners ---

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        buttons.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        renderCategory(category);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    
    // Mouse Glow Effect (Same as main site)
    const mainContainer = document.querySelector('.main-container');
    mainContainer.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.news-card');
        for(const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});