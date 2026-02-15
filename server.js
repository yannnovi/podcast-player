const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = path.resolve(__dirname);
const PODCASTS_DIR = path.join(ROOT, 'podcasts');
const IMAGES_DIR = path.join(ROOT, 'images');

// Serve static assets for client
app.use('/public', express.static(path.join(ROOT, 'public')));
// Serve the podcasts directory as static so audio files can be requested
if (fs.existsSync(PODCASTS_DIR)) {
  app.use('/podcasts', express.static(PODCASTS_DIR));
}
// Serve images directory so background images can be requested
if (fs.existsSync(IMAGES_DIR)) {
  app.use('/images', express.static(IMAGES_DIR));
}

// API: list mp3 files in podcasts directory
app.get('/api/podcasts', (req, res) => {
  if (!fs.existsSync(PODCASTS_DIR)) {
    return res.json([]);
  }

  fs.readdir(PODCASTS_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read podcasts directory' });

    // keep only .mp3 files
    const mp3Files = files.filter(f => /\.mp3$/i.test(f));

    // fetch stats for each file to get modification time
    const statsPromises = mp3Files.map(f => new Promise((resolve) => {
      fs.stat(path.join(PODCASTS_DIR, f), (sErr, stat) => {
        if (sErr) return resolve(null);
        resolve({ name: f, mtime: stat.mtimeMs });
      });
    }));

    Promise.all(statsPromises).then(results => {
      const mp3s = results
        .filter(Boolean)
        .sort((a, b) => b.mtime - a.mtime) // most recent first
        .slice(0, 6) // only keep the 6 most recent
        .map(item => ({
          name: item.name,
          url: '/podcasts/' + encodeURIComponent(item.name)
        }));

      res.json(mp3s);
    }).catch(() => res.json([]));
  });
});

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Podcast player server running on http://localhost:${PORT}`);
});
