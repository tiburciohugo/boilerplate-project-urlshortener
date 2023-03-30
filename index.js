require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urls = [];
const shortUrls = [];

function isValidUrl(url) {
  const regex = /^https?:\/\//;
  const urlWithoutProtocol = url.replace(regex, "").replace(/\/$/, "");
  return new Promise((resolve, reject) => {
    dns.lookup(urlWithoutProtocol, (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

// URL Shortener
app.get("/api/shorturl/:shorturl", async (req, res, next) => {
  const shortUrl = parseInt(req.params.shorturl);
  const originalUrlIndex = shortUrls.indexOf(shortUrl);

  if (originalUrlIndex >= 0) {
    const originalUrl = urls[originalUrlIndex];
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: "Short URL not found" });
  }
});

app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;

  if (!url || url.trim() === "") {
    return res.status(400).json({ error: "a URL is required" });
  }

  try {
    await isValidUrl(url);
    const shortUrl = shortUrls.length + 1;
    urls.push(url);
    shortUrls.push(shortUrl);
    console.log(urls, shortUrls);
    res.json({ original_url: url, short_url: shortUrl });
  } catch (err) {
    res.json({ error: "invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
