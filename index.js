require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");
const baseUrl = "http://localhost:3000";

const Url = url.URL;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// URL Shortener
app.get("/api/shorturl/:short_url", (req, res, next) => {
  const shortUrl = req.params.url;
  const originalUrl = urlMap.get(shortUrl);

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
      res.json({ original_url: url, short_url: 1 });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
