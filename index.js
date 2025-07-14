const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static('public'));

// Helper function to validate URLs
function isValidUrl(userInput) {
    try {
        const url = new URL(userInput);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
        return false;
    }
}

app.get('/api/rss', async (req, res) => {
    const feedUrl = req.query.url;

    if (!feedUrl || !isValidUrl(feedUrl)) {
        return res.status(400).send('Invalid or missing RSS feed URL');
    }

    try {
        const response = await axios.get(feedUrl);
        res.set('Content-Type', 'application/rss+xml');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching RSS feed:', error.message);
        res.status(500).send('Failed to fetch RSS feed');
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
