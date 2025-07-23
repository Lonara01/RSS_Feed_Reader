document.addEventListener('DOMContentLoaded', function () {
    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');

    const parserType = 'php'; // change to 'node' if needed


    // Load default feed on page load
    loadFeed(rssUrlInput.value);

    // Add event listener for the load button
    loadFeedBtn.addEventListener('click', function () {
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

        const phpURL = `https://abddomain.epizy.com/rss/rss_parsers/php_parser/index.php?url=${encodeURIComponent(feedUrl)}`;
        const nodeURL = `http://localhost:3001/api/rss?url=${encodeURIComponent(feedUrl)}`;

        const apiURL = parserType === 'php' ? phpURL : nodeURL;

        fetch(apiURL)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(items => {
                console.log('Items fetched:', items);
                displayNews(items);
            })
            .catch(error => {
                console.error('Error fetching RSS feed:', error);
                newsContainer.innerHTML = `<div class="error">Error loading feed: ${error.message}</div>`;
            });
    }

    function displayNews(items) {
        console.log('Displaying news items:', items);
        if (!items || items.length === 0) {
            newsContainer.innerHTML = '<div class="loading">No news items found in the feed</div>';
            return;
        }

        newsContainer.innerHTML = '';

        items.forEach(item => {
            const card = document.createElement('article');
            card.className = 'news-card';

            // Clean description by removing HTML tags and truncating
            const cleanDescription = item.description
                ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
                : 'No description available';

            const image = item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='https://placehold.co/300x180?text=No+Image'">`
                : `<div class="news-image" style="background: #eee; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;

            card.innerHTML = `
                ${image}
                <div class="news-content">
                    <h3 class="news-title">${item.title || 'No title'}</h3>
                    <p class="news-description">${cleanDescription}</p>
                    <a href="${item.link || '#'}" class="news-link" target="_blank" rel="noopener noreferrer">Read more</a>
                </div>
            `;

            newsContainer.appendChild(card);
        });
    }
});