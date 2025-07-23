<?php
// Set CORS headers BEFORE anything else
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


require __DIR__ . '/vendor/autoload.php';




// OPTIONAL: Handle preflight requests (only for POST/custom headers)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$feedUrl = $_GET['url'] ?? null;
if (!$feedUrl) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing url parameter']);
    exit;
}

try {
    // Initialize SimplePie
    $feed = new SimplePie();
    $feed->set_feed_url($feedUrl);
    $feed->enable_cache(false); // Disable caching for real-time results
    $feed->handle_content_type();

    if (!$feed->init()) {
        throw new Exception($feed->error());
    }

    $items = [];
    foreach ($feed->get_items() as $item) {
        // Try to get image from enclosure or content
        $imageUrl = '';
        $enclosure = $item->get_enclosure();
        if (!empty($enclosure->thumbnails)) {
            $imageUrl = $enclosure->get_thumbnail(0);
        } else {
            // Try to extract <img> from content
            if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $item->get_content(), $matches)) {
                $imageUrl = $matches[1];
            }
        }

        $items[] = [
            'title' => $item->get_title(),
            'description' => $item->get_description(),
            'link' => $item->get_link(),
            'imageUrl' => $imageUrl,
        ];
    }

    echo json_encode($items, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch or parse RSS feed',
        'details' => $e->getMessage()
    ]);
}
