require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlparser = require("url");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URI);
const db = client.db("urlshortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${__dirname}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  const dnslookup = dns.lookup(
    urlparser.parse(url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" });
      } else {
        const urlCount = await urls.countDocuments({});
        const urlDoc = {
          url: url,
          short_url: urlCount,
        };

        const result = await urls.insertOne(urlDoc);

        res.json({
          original_url: url,
          short_url: urlCount,
        });
      }
    }
  );
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shorturl });
  res.redirect(urlDoc.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
