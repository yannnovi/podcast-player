# Podcast Player

Minimal web app that lists MP3 files from the `podcasts/` directory and plays selected files.

How to run:

1. Install dependencies:

   npm install

2. Start the server:

   npm start

3. Open http://localhost:3000 in your browser.

Notes:
- Put your `.mp3` files inside the `podcasts/` folder at the project root.
- The server provides an API `GET /api/podcasts` that returns the list of mp3 files.
