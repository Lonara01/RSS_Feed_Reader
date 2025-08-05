document.addEventListener('DOMContentLoaded', function () {

    /* ╔════════════════════════════════════════════╗
       ║        C O N F I G   V A R I A B L E S     ║
       ╚════════════════════════════════════════════╝ */
    const parserType = 'node'; // We can use 'php' if it needed
    const FEED_STORAGE_KEY = 'savedFeeds';


    /* ╔═══════════════════════════════════════╗
       ║           Define Elements             ║
       ╚═══════════════════════════════════════╝ */

    const loadFeedBtn = document.getElementById('load-feed');
    const rssUrlInput = document.getElementById('rss-url');
    const newsContainer = document.getElementById('news-container');
    const feedForm = document.getElementById('rss-form');
    const newFeedInput = document.getElementById('new-rss-url');
    const savedFeedsListContainer = document.getElementById('saved-feeds-list');
    const collapseButton = document.getElementById('rss-list-collapse-btn');


    loadSavedFeeds();


    /* ╔═══════════════════════════════════════╗
       ║         Event Listener Function       ║
       ╚═══════════════════════════════════════╝ */

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
        savedFeedsListContainer.classList.toggle('collapsed');

        // Optional: update button label
        collapseButton.textContent = savedFeedsListContainer.classList.contains('collapsed')
            ? 'Expand'
            : 'Collapse';
    });


    /*
    ===============================
    | Elements Creator Functions |
    ===============================
   */

    function createFeedCheckbox(liID, feedObject) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        if (feedObject.check === true || feedObject.check === undefined) {
            checkbox.checked = true;
        }
        checkbox.id = liID;
        checkbox.value = feedObject.url;
        return checkbox;
    }

    function createDeleteButton() {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '16px';
        return deleteBtn;
    }


    // ═══◆◇◆ Helper Functions ◆◇◆═══

    function saveFeedUrl(url) {
        const feeds = getSavedFeeds();

        const exists = feeds.some(feed => feed.url === url);
        if (!exists) {
            feeds.push({ url: url, check: true });
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
        const feeds = getSavedFeeds();
        savedFeedsListContainer.innerHTML = '';
        newsContainer.innerHTML = '';

        feeds.forEach(feedObject => {
            const liID = Math.floor(Math.random() * 100);
            const li = document.createElement('li');

            // Create checkbox and set its event listener
            let checkbox = createFeedCheckbox(liID, feedObject);
            setCheckBoxEvent(checkbox, feeds, feedObject);


            const label = document.createElement('label');
            label.textContent = feedObject.url;
            label.style.marginLeft = '8px';
            label.setAttribute("for", liID);

            // Create delete button
            let deleteBtn = createDeleteButton();
            setDeleteBtnListener(deleteBtn, feeds, feedObject);


            // Append created elements to the list item
            li.appendChild(checkbox);
            li.appendChild(label);
            li.appendChild(deleteBtn);


            savedFeedsListContainer.appendChild(li);

            // Load feed in if it's saved as true in local storage
            if (feedObject.check === true) {
                loadFeed(feedObject.url);
            }
        });

    }

    function reloadEnabledFeeds() {
        newsContainer.innerHTML = '';
        const feeds = getSavedFeeds();

        const enabledFeeds = feeds.filter(feed => feed.check);
        enabledFeeds.forEach(feed => {
            loadFeed(feed.url);
        });
    }

    function setDeleteBtnListener(deleteBtn, feeds, feedObject) {
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
                    const updatedFeeds = feeds.filter(feed => feed.url !== feedObject.url);
                    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(updatedFeeds));

                    loadSavedFeeds(); /*reloaod the list */
                    Swal.fire(
                        'Deleted!!',
                        'RSS url was deleted succsefully',
                        'success'

                    )
                }
            });

        });
    }

    function setCheckBoxEvent(checkbox, feeds, feedObject) {
        checkbox.addEventListener('change', () => {
            feeds.map(feed => {
                if (feed.url === feedObject.url) {
                    feed.check = checkbox.checked;
                }
                return feed;
            });
            localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));

            reloadEnabledFeeds();
        });
    }

    function getSavedFeeds() {
        const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];
        return feeds;
    }


});


