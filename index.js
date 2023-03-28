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

// URL Shortener
app.get("/api/shorturl/:shorturl", (req, res, next) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urls[parseInt(shortUrl) - 1];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: "Short URL not found" });
  }
});

app.post("/api/shorturl", function (req, res) {
  const { url } = req.body;

  if (!url || url.trim() === "") {
    return res.status(400).json({ error: "a URL is required" });
  }

  const regex = /^https?:\/\//;
  const urlWithoutProtocol = url.replace(regex, "").replace(/\/$/, "");

  dns.lookup(urlWithoutProtocol, function (err, address, family) {
    if (err) {
      res.json({ error: "invalid URL" });
    } else {
      const shortUrl = (urls.length + 1).toString();
      urls.push(url);
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
