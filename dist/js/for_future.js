// after install "npm install rss-parser"
const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const app = express();
const PORT = 3001;

const parser = new Parser();

app.use(cors());

app.get('/api/rss', async (req, res) => {
    const feedUrl = req.query.url;
    if (!feedUrl) return res.status(400).send('Missing url parameter');

    try {
        const feed = await parser.parseURL(feedUrl);

        // Map top 10 items with required fields
        const items = feed.items.slice(0, 10).map(item => {
            let imageUrl = '';

            if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
                imageUrl = item.enclosure.url;
            } else if (item.content) {
                const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/);
                if (imgMatch) imageUrl = imgMatch[1];
            }

            return {
                title: item.title || '',
                description: item.contentSnippet || item.content || '',
                link: item.link || '',
                imageUrl,
            };
        });

        res.json(items);
    } catch (error) {
        console.error('RSS parsing error:', error);
        res.status(500).send('Failed to fetch or parse RSS feed');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


//==================================================================================================
//============================
//  Script.js
//============================

document.addEventListener('DOMContentLoaded', function () {
    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');

    // Load default feed on page load
    loadFeed(rssUrlInput.value);

    loadFeedBtn.addEventListener('click', () => {
        const url = rssUrlInput.value.trim();
        if (url) {
            loadFeed(url);
        } else {
            alert('Please enter a valid RSS feed URL');
        }
    });

    function loadFeed(feedUrl) {
        newsContainer.innerHTML = '<div class="loading">Loading news feed...</div>';

        fetch(`http://localhost:3001/api/rss?url=${encodeURIComponent(feedUrl)}`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(items => {
                displayNews(items);
            })
            .catch(error => {
                console.error('Error fetching RSS feed:', error);
                newsContainer.innerHTML = `<div class="loading">Error loading feed: ${error.message}</div>`;
            });
    }

    function displayNews(items) {
        if (!items || items.length === 0) {
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
