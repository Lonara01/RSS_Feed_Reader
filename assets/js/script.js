document.addEventListener('DOMContentLoaded', function () {
    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');
    const feedHistoryList = document.getElementById('feed-history');
    const saveFeedBtn = document.getElementById('save-feed');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Load default feed on page load
    loadFeed(rssUrlInput.value);
    loadFeedHistory();

    // Add event listener for the load button
    loadFeedBtn.addEventListener('click', function () {
        const url = rssUrlInput.value.trim();
        if (url) {
            loadFeed(url);
        } else {
            alert('Please enter a valid RSS feed URL');
        }
    });

    // Save feed to history
    saveFeedBtn.addEventListener('click', function() {
        const url = rssUrlInput.value.trim();
        if (url) {
            saveFeedToHistory(url);
        } else {
            alert('Please enter a valid RSS feed URL');
        }
    });

    // Clear feed history
    clearHistoryBtn.addEventListener('click', function() {
        localStorage.removeItem('rssFeedHistory');
        feedHistoryList.innerHTML = '';
    });

    function loadFeedHistory() {
        const history = JSON.parse(localStorage.getItem('rssFeedHistory')) || [];
        feedHistoryList.innerHTML = '';
        
        history.forEach(url => {
            const li = document.createElement('li');
            li.textContent = url;
            li.addEventListener('click', () => {
                rssUrlInput.value = url;
                loadFeed(url);
            });
            feedHistoryList.appendChild(li);
        });
    }

    function saveFeedToHistory(url) {
        const history = JSON.parse(localStorage.getItem('rssFeedHistory')) || [];
        if (!history.includes(url)) {
            history.unshift(url); // Add to beginning
            localStorage.setItem('rssFeedHistory', JSON.stringify(history));
            loadFeedHistory();
        }
    }

    function loadFeed(feedUrl) {
        // Show loading state
        newsContainer.innerHTML = '<div class="loading">Loading news feed...</div>';

        fetch(`http://localhost:3001/api/rss?url=${encodeURIComponent(feedUrl)}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(items => {
                displayNews(items);
                saveFeedToHistory(feedUrl);
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
                ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">`
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