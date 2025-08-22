document.addEventListener('DOMContentLoaded', function () {

    /* ╔════════════════════════════════════════════╗
       ║        C O N F I G   V A R I A B L E S     ║
       ╚════════════════════════════════════════════╝ */
    const parserType = 'node'; // We can use 'php' if it needed
    const FEED_STORAGE_KEY = 'savedFeeds';
    const FEED_PER_PAGE = 10;


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
    const feedNameInput = document.getElementById('rss-name');
    const feedIconInput = document.getElementById('rss-icon');
    const cardPerPageSelect = document.getElementById("cards-per-page");

    // Pagination değişkenleri
    let currentPage = 1;
    var itemsPerPage = JSON.parse(localStorage.getItem(FEED_PER_PAGE)) || 10;
    var allNews = [];





    if (cardPerPageSelect) {
        cardPerPageSelect.value = itemsPerPage;
        cardPerPageSelect.addEventListener("change", function () {
            // currentPage = 1; // Reset to first page on change
            itemsPerPage = this.value || 10; // Update items per page
            displayNews(allNews);
            localStorage.setItem(FEED_PER_PAGE, JSON.stringify(itemsPerPage));
        });
    }


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
        const newName = feedNameInput.value.trim();
        const newIcon = feedIconInput.value.trim();
        console.log(`New Feed URL: ${newUrl}, Name: ${newName}, Icon: ${newIcon}`);

        if (newUrl && newName && newIcon) {
            saveFeedUrl(newUrl, newName, newIcon);
            newFeedInput.value = '';
            feedNameInput.value = '';
            feedIconInput.value = '';
            loadSavedFeeds();
        } else {
            alert('Please fill  all fields');
        }

    });

    collapseButton.addEventListener('click', () => {
        savedFeedsListContainer.classList.toggle('collapsed');

        // Optional: update button label
        collapseButton.innerHTML = savedFeedsListContainer.classList.contains('collapsed')
            ? '<i class="fas fa-plus"></i>'
            : '<i class="fas fa-minus"></i>';
    });


    /*
    ===============================
    | Elements Creator Functions |
    ===============================
   */



    function createDeleteButton() {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.style.marginRight = '10px';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '16px';
        return deleteBtn;
    }


    // ═══◆◇◆ Helper Functions ◆◇◆═══

    function saveFeedUrl(url, name, icon) {
        const feeds = getSavedFeeds();
        console.log(`saving feed url: ${url}, name: ${name}, icon :${icon}`);

        const exists = feeds.some(feed => feed.url === url);
        console.log(`Feed URL exists: ${exists}`);

        if (!exists) {
            feeds.push({ url: url, name, icon, check: true });
            localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));
        } else {
            Swal.fire({
                title: "Feed URL already exists",
                text: "This URL is already saved in your list.",
                icon: "info",
                confirmButtonText: "OK"
            });
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


    function loadSavedFeeds() {
        const feeds = getSavedFeeds();
        savedFeedsListContainer.innerHTML = '';
        newsContainer.innerHTML = '';
        allNews = [];

        feeds.forEach((feedObject, index) => {
            const li = document.createElement('li');
            li.className = 'feed-item';
            if (feedObject.check) li.classList.add('active-feed');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = "checkbox-" + index;

            checkbox.checked = feedObject.check;
            checkbox.className = 'feed-checkbox';
            checkbox.addEventListener('change', () => {
                handleCheckboxChange(checkbox, feeds, feedObject)
            });
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'feed-toggle';
            btn.innerHTML = `<i class="${feedObject.icon || ''}" style="margin-right:6px;"></i>${feedObject.name || feedObject.url}`;

            btn.addEventListener('click', () => {
                feeds.forEach(f => {
                    if (f.url === feedObject.url) f.check = !f.check;
                });
                localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));
                loadSavedFeeds();
                reloadEnabledFeeds();
            });

            let deleteBtn = createDeleteButton();
            setDeleteBtnListener(deleteBtn, feeds, feedObject);


            const label = document.createElement('label');
            label.htmlFor = "checkbox-" + index;
            label.className = 'feed-label';
            //label.textContent = feedObject.name || feedObject.url;
            label.appendChild(checkbox);
            label.appendChild(btn);
            label.appendChild(deleteBtn);

            li.appendChild(label);
            savedFeedsListContainer.appendChild(li);
        });

        reloadEnabledFeeds();
    }
    // Reload enabled feeds when the saved feeds list is loaded
    function reloadEnabledFeeds() {
        newsContainer.innerHTML = '';
        allNews = []; // REST TO AVOİD THE DUPLICATION
        const feeds = getSavedFeeds();
        const enabledFeeds = feeds.filter(feed => feed.check);
        enabledFeeds.forEach(feed => {
            loadFeed(feed.url);
        });
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         // Set event listener for delete button
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
            handleCheckboxChange(checkbox, feeds, feedObject);
        });
    }
    function handleCheckboxChange(checkbox, feeds, feedObject) {
        feeds.map(feed => {
            if (feed.url === feedObject.url) {
                feed.check = checkbox.checked;
            }
            return feed;
        });
        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feeds));

        reloadEnabledFeeds();

    }
    function getSavedFeeds() {
        const feeds = JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || [];
        return feeds;
    }



    /* ╔═══════════════════════════════════════╗
       ║        Pagination Variables           ║
       ╚═══════════════════════════════════════╝ */

    function displayNews(items) {
        if (!items || items.length === 0) {
            newsContainer.innerHTML += '<div class="loading">No news items found in feed</div>';
            return;
        }
        allNews = allNews.concat(items);
        renderPage(currentPage);
        renderPagination();
    }
    function renderPage(page) {
        newsContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = allNews.slice(start, end);


        pageItems.forEach(item => {
            const card = document.createElement('article');
            card.className = 'news-card';

            const cleanDescription = item.description
                ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
                : 'No Description available';
            const pubDate = item.pubDate
                ? new Date(item.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
                : 'Unknown date';
            const image = item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='https://placehold.co/300x180?text=No+Image'">`
                : `<div class="news-image" style="background: #eee; display : flex; align-items: center; justify-content: center; color:#999;">No Image</div>`;
            card.innerHTML = `
    ${image}
    <div class="news-content">
        <h3 class="news-title">${item.title || 'No title'}</h3>
        <p class="news-description">${cleanDescription}</p>
        <p class="news-date">${pubDate}</p>
        <a href="${item.link || '#'}" class="news-link" target="_blank" rel="noopener noreferrer">Read More</a>
    </div>
`;
            newsContainer.appendChild(card);
        });
    }
    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(allNews.length / itemsPerPage);


        /* ~~~~~~~~~~~~~~~~~ previous button ~~~~~~~~~~~~~~~~~ */
        const prevLi = document.createElement('li');
        prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
        prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
        prevLi.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
                renderPagination();

            }

        });
        pagination.appendChild(prevLi);

        //page numbers

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item' + (i === currentPage ? ' active' : '');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage);
                renderPagination();
            });
            pagination.appendChild(li);

        }
        //next 
        const nextLi = document.createElement('li');
        nextLi.className = 'page-item' + (currentPage === totalPages ? 'disabled' : '');
        nextLi.innerHTML = `<a class ="page-link" href= "#">&raquo;</a>`;
        nextLi.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
                renderPagination();

            }
        });
        pagination.appendChild(nextLi);

    }



});

// ════════════════════════════════════════════════
// ║               End of the Script               ║
// ╚═══════════════════════════════════════════════
// This script is designed to handle RSS feed loading, saving, and displaying.
