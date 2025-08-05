document.addEventListener('DOMContentLoaded', function () {
    const parserType = 'node'; // We can use 'php' if it needed
    const FEED_STORAGE_KEY = 'savedFeeds';


    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');


    const feedForm = document.getElementById('rss-form');
    const newFeedInput = document.getElementById('new-rss-url');
    const savedFeedsList = document.getElementById('saved-feeds-list');
    const collapseButton = document.getElementById('rss-list-collapse-btn');

    loadSavedFeeds(); //  WHEN PAGE LOADED THIS BRING OUR FEED AND CHECKBOX 


    loadFeedBtn.addEventListener('click', function () {
        const url = rssUrlInput.value.trim();
        if (url) {
            loadFeed(url);
        } else {
            alert('Please enter a valid RSS feed URL');
        }
    });

    feedForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newUrl = newFeedInput.value.trim();
        if (newUrl) {
            saveFeedUrl(newUrl);
            newFeedInput.value = '';
            loadSavedFeeds();
        }
    });

    collapseButton.addEventListener('click', () => {
        savedFeedsList.classList.toggle('collapsed');

        // Optional: update button label
        collapseButton.textContent = savedFeedsList.classList.contains('collapsed')
            ? 'Expand'
            : 'Collapse';
    });


   function saveFeedUrl(url) {
    const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];

    // URL zaten kayıtlı mı kontrol et
    const exists = feeds.some(feed => feed.url === url);
    if (!exists) {
        feeds.push({ url: url, check: true }); // Yeni eklenenler varsayılan olarak 'aktif'
        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));
    }
}

    

    function loadFeed(feedUrl) {
        const phpURL = `https://abddomain.epizy.com/rss/rss_parsers/php_parser/index.php?url=${encodeURIComponent(feedUrl)}`;
        const nodeURL = `http://localhost:3001/api/rss?url=${encodeURIComponent(feedUrl)}`;
        const apiURL = parserType === 'php' ? phpURL : nodeURL;

        fetch(apiURL)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(items => {
                displayNews(items);
            })
            .catch(error => {
                newsContainer.innerHTML += `<div class="error">Error loading feed: ${error.message}</div>`;
            });
    }

    function displayNews(items) {
        if (!items || items.length === 0) {
            newsContainer.innerHTML += '<div class="loading">No news items found in the feed</div>';
            return;
        }

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

    function loadSavedFeeds() {
        const feeds = localStorage.getItem(FEED_STORAGE_KEY) ? JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) : [];
        savedFeedsList.innerHTML = '';
        newsContainer.innerHTML = ''; // Önceki haberleri temizle

        feeds.forEach(feedUrl => {
            const liID = Math.floor(Math.random() * 100);
            const li = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = liID;

            checkbox.addEventListener('change', () => {
                reloadEnabledFeeds(); // Checkbox durumu değiştiğinde sadece aktif olanları yükle
            });


            const label = document.createElement('label');
            label.textContent = feedUrl;
            label.style.marginLeft = '8px';
            label.setAttribute("for", liID);





            // --- DELETE butonunu oluştur ve davranışını tanımla (başlangıç) ---
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '16px';

            deleteBtn.addEventListener('click', () => {
                Swal.fire({
                    title: "Do you really want to delet this ?",
                    text: "you are deleting this URL ",
                    icon: "warning",
                    showCancelButton: "true",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes Please delete that",
                    cancelButtonText: "Forget about that!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        /*if user confirmed we will delelte*/
                        const updatedFeeds = feeds.filter(f => f !== feedUrl);
                        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(updatedFeeds));
                             
                        loadSavedFeeds(); /*reloaod the list */
                        Swal.fire(
                            'Deleted!!',
                            'RSS url was deleted succsefully',
                            'success'

                        )
                    }
                }
                )

            });
            // --- DELETE butonunu oluştur ve davranışını tanımla 

            li.appendChild(checkbox);
            li.appendChild(label);

            // --- DELETE butonunu li içine ekle 
            li.appendChild(deleteBtn);
            // --- DELETE butonunu li içine ekle 

            savedFeedsList.appendChild(li);

            loadFeed(feedUrl); // Sayfa ilk yüklendiğinde otomatik yükle
        });
        
    }

function reloadEnabledFeeds() {
    newsContainer.innerHTML = '';
    const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];

    const enabledFeeds = feeds.filter(feed => feed.check);
    enabledFeeds.forEach(feed => {
        loadFeed(feed.url);
    });
}



});


