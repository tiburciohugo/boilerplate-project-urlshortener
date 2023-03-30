require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlparser = require("url");
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewURLParser: true,
  useUnifiedtopology: true,
});

const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("Url", schema);

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

// URL Shortener
app.get("/api/shorturl/:shorturl", async (req, res, next) => {
  try {
    const { short_url } = req.params;
    const url = await Url.findOne({ short_url });
    if (!url) {
      res.json({ error: "Invalid URL" });
    } else {
      res.redirect(url.url);
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/shorturl", async function (req, res) {
  const { url } = req.body;

  if (!url || url.trim() === "") {
    return res.status(400).json({ error: "a URL is required" });
  }

  try {
    const { hostname } = new URL(url);
    await dns.promises.lookup(hostname);
    const shortUrl = new Url({ url });
    const savedUrl = await shortUrl.save();
    res.json({ original_url: url, short_url: savedUrl._id });
  } catch (error) {
    res.json({ error: "invalid URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
