require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {};

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL
  try {
    const urlObject = new URL(originalUrl);
    const hostname = urlObject.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid URL' });
      }

      // Generate a unique ID for the shortened URL
      const shortUrlId = shortid.generate();
      urlDatabase[shortUrlId] = originalUrl;

      res.json({ original_url: originalUrl, short_url: shortUrlId });
    });
  } catch (error) {
    res.json({ error: 'invalid URL' });
  }
});

// Endpoint to redirect to the original URL
app.get('/api/shorturl/:shortUrlId', (req, res) => {
  const shortUrlId = req.params.shortUrlId;
  const originalUrl = urlDatabase[shortUrlId];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
