document.addEventListener('DOMContentLoaded', function () {
    const feedIconInput = document.getElementById('rss-icon');
    const iconsPopup = document.getElementById("iconsPopup");
    const iconPreview = document.getElementById("iconPreview");
    var icons = []; // global array

    function loadPopupIcons() {
        // Load icons first
        fetch("../dist/json/font-awesome-free-icons.json")
            .then(response => response.json())
            .then(data => {
                icons = data.icons; // save icons
            });

    }
    loadPopupIcons();

    function renderIcons(filter = "") {
        iconsPopup.innerHTML = ""; // clear previous
        const filtered = icons.filter(icon => icon.includes(filter.toLowerCase()));
        if (filtered.length === 0) {
            iconsPopup.innerHTML = "<small>No icons found</small>";
            return;
        }
        filtered.forEach(iconClass => {
            const iconEl = document.createElement("i");
            iconEl.className = iconClass;
            iconEl.title = iconClass;
            iconEl.addEventListener("click", () => {
                feedIconInput.value = iconClass;
                iconsPopup.style.display = "none";
                iconPreview.className = iconClass + " icon-preview";
            });
            iconsPopup.appendChild(iconEl);
        });
    }

    // Show iconsPopup on focus or click
    feedIconInput.addEventListener("focus", () => {
        const rect = feedIconInput.getBoundingClientRect();
        // iconsPopup.style.top = rect.top + window.scrollY + "px";
        // iconsPopup.style.left = rect.left + window.scrollX + "px";
        iconsPopup.style.width = rect.width + "px";
        iconsPopup.style.display = "grid";
        renderIcons(feedIconInput.value.trim());
    });

    iconPreview.addEventListener("click", () => {
        const rect = feedIconInput.getBoundingClientRect();
        feedIconInput.value = "";
        iconsPopup.style.width = rect.width + "px";
        iconsPopup.style.display = "grid";
        renderIcons(feedIconInput.value.trim());
    });

    // Filter while typing
    feedIconInput.addEventListener("input", () => {
        const rect = feedIconInput.getBoundingClientRect();
        iconsPopup.style.width = rect.width + "px";
        iconsPopup.style.display = "grid";
        renderIcons(feedIconInput.value.trim());
    });

    // Hide when clicking outside
    document.addEventListener("click", (e) => {
        if (!iconsPopup.contains(e.target) && e.target !== feedIconInput && e.target !== iconPreview) {
            iconsPopup.style.display = "none";
        }
    });
});
