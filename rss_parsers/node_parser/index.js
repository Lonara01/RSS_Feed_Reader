const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Using node-fetch v2 to get Node.js streams
const FeedParser = require('feedparser');

const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS so your API can be called from any origin

// Main API endpoint: /api/rss?url=<RSS_FEED_URL>
app.get('/api/rss', async (req, res) => {
  const feedUrl = req.query.url;
  if (!feedUrl) return res.status(400).send('Missing url parameter');

  try {
    // Fetch and parse the RSS feed, get all items
    const items = await parse(feedUrl);
    console.log(items);

    // Format top 10 items to include only needed fields and image URL
    const formatted = items.map(item => ({
      title: item.title || '',
      description: item.summary || item.description || '',
      link: item.link || '',
      pubDate: item.date || item.pubdate || item.pubDate || 'Unknown date',
      imageUrl: item.image?.url || item.enclosures?.find(e => e.type?.startsWith('image/'))?.url || ''
    }));

    // Send JSON response with formatted feed items
    res.json(formatted);

  } catch (error) {
    console.error('RSS parsing error:', error);
    res.status(500).send('Failed to fetch or parse RSS feed');
  }
});

// Helper function: fetches the RSS feed and parses it using FeedParser
async function parse(feedUrl) {
  // Fetch the feed URL with custom headers to mimic a browser request
  const res = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });

  // Check for successful response
  if (res.status !== 200) throw new Error('Bad status code');

  // Return a promise that resolves with all feed items parsed
  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser();
    const items = [];

    // Pipe the HTTP response stream into FeedParser
    res.body.pipe(feedparser);

    // Handle any errors during parsing
    feedparser.on('error', reject);

    // Read all feed items as they come in
    feedparser.on('readable', function () {
      let item;
      while ((item = this.read())) {
        items.push(item);
      }
    });

    // Resolve the promise when parsing ends
    feedparser.on('end', () => resolve(items));
  });
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
