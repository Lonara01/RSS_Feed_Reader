document.addEventListener('DOMContentLoaded', function () {
  const loadFeedBtn = document.getElementById('load-feed');
  const rssUrlInput = document.getElementById('rss-url');
  const newsContainer = document.getElementById('news-container');

  const parserType = 'node'; // we can use php instead

  /* Sayfa yüklendiğinde varsayılan feed'i yükle*/
  loadFeed(rssUrlInput.value);

  // Load butonuna tıklanınca feed'i yükle
  loadFeedBtn.addEventListener('click', function () {
    const url = rssUrlInput.value.trim();
    if (url) {
      loadFeed(url);
    } else {
      alert('Please enter a valid RSS feed URL');
    }
  });

  // RSS feed'ini yükleyen fonksiyon
  function loadFeed(feedUrl) {
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

  // Haberleri ekranda gösteren fonksiyon
  function displayNews(items) {
    if (!items || items.length === 0) {
      newsContainer.innerHTML = '<div class="loading">No news items found in the feed</div>';
      return;
    }

    newsContainer.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'news-card';

      const cleanDescription = item.description
        ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
        : 'No description available';
        
            const pubDate = item.pubDate
      ? new Date(item.pubDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'Unknown date';

      const image = item.imageUrl
        ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='https://placehold.co/300x180?text=No+Image'">`
        : `<div class="news-image" style="background: #eee; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;

      card.innerHTML = `
        ${image}
        <div class="news-content">
          <h3 class="news-title">${item.title || 'No title'}</h3>
          <p class="news-description">${cleanDescription}</p>
          <p class="news-date"><strong>Published:</strong> ${pubDate}</p>
          <a href="${item.link || '#'}" class="news-link" target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      `;

      newsContainer.appendChild(card);
    });
  }

  // 🔻Feed URL storage & checkbox UI
  const FEED_STORAGE_KEY = 'savedFeeds';
  const feedForm = document.getElementById('rss-form');
  const newFeedInput = document.getElementById('new-rss-url');
  const savedFeedsList = document.getElementById('saved-feeds-list');

  loadSavedFeeds();

  feedForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const newUrl = newFeedInput.value.trim();
    if (newUrl) {
      saveFeedUrl(newUrl);
      newFeedInput.value = '';
      loadSavedFeeds();
    }
  });

  function saveFeedUrl(url) {
    const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];
    if (!feeds.includes(url)) {
      feeds.push(url);
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));
    }
  }

  function loadSavedFeeds() {
    const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];
    savedFeedsList.innerHTML = '';

    feeds.forEach(feedUrl => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.addEventListener('change', () => {
        console.log(`${feedUrl} is ${checkbox.checked ? 'enabled' : 'disabled'}`);
        // Buraya istersen filtreleme veya otomatik yükleme fonksiyonu yazabilirsin
      });

      const label = document.createElement('label');
      label.textContent = feedUrl;
      label.style.marginLeft = '8px';

      li.appendChild(checkbox);
      li.appendChild(label);
      savedFeedsList.appendChild(li);
    });
  }
  // 🔺N
});
