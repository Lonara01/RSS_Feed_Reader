document.addEventListener('DOMContentLoaded', function() {
    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');
    
    // Load default feed on page load
    loadFeed(rssUrlInput.value);
    
    // Add event listener for the load button
    loadFeedBtn.addEventListener('click', function() {
        const url = rssUrlInput.value.trim();
        if (url) {
            loadFeed(url);
        } else {
            alert('Please enter a valid RSS feed URL');
        }
    });
    
    function loadFeed(feedUrl) {
        // Show loading state
        newsContainer.innerHTML = '<div class="loading">Loading news feed...</div>';
        
        // Use a CORS proxy to avoid CORS issues (for development only)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const encodedUrl = encodeURIComponent(feedUrl);
        
        fetch(`${proxyUrl}${encodedUrl}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.contents) {
                    return parseRSS(data.contents);
                } else {
                    throw new Error('No contents in response');
                }
            })
            .then(items => {
                displayNews(items);
            })
            .catch(error => {
                console.error('Error fetching RSS feed:', error);
                newsContainer.innerHTML = `<div class="loading">Error loading feed: ${error.message}</div>`;
            });
    }
    
    function parseRSS(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        const items = xmlDoc.querySelectorAll('item');
        const newsItems = [];
        
        items.forEach((item, index) => {
            if (index >= 10) return; // Limit to 10 items
            
            const title = item.querySelector('title')?.textContent || 'No title';
            const description = item.querySelector('description')?.textContent || 'No description';
            const link = item.querySelector('link')?.textContent || '#';
            
            // Extract image - different RSS feeds may have different formats
            let imageUrl = '';
            const enclosure = item.querySelector('enclosure');
            if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
                imageUrl = enclosure.getAttribute('url');
            } else {
                // Try to extract image from description (common in BBC feed)
                const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }
            
            newsItems.push({
                title,
                description: description.replace(/<[^>]*>?/gm, ''), // Remove HTML tags
                link,
                imageUrl
            });
        });
        
        return newsItems;
    }
    
    function displayNews(items) {
        if (items.length === 0) {
            newsContainer.innerHTML = '<div class="loading">No news items found in the feed</div>';
            return;
        }
        
        newsContainer.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('article');
            card.className = 'news-card';
            
            const image = item.imageUrl 
                ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">`
                : `<div class="news-image" style="background: #eee; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;
            
            card.innerHTML = `
                ${image}
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-description">${item.description.substring(0, 150)}...</p>
                    <a href="${item.link}" class="news-link" target="_blank" rel="noopener noreferrer">Read more</a>
                </div>
            `;
            
            newsContainer.appendChild(card);
        });
    }
});