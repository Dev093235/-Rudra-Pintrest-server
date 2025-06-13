const express = require("express");
const axios = require("axios");
const app = express();

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.CX_ID;

app.get("/", (req, res) => {
  res.send("✅ Server is live. Use `/dp?q=your+search&n=number`");
});

app.get("/dp", async (req, res) => {
  const query = req.query.q || "couple dp";
  const count = parseInt(req.query.n || "3");

  if (!API_KEY || !CX_ID) {
    return res.status(500).json({ error: "Missing API_KEY or CX_ID in environment" });
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&searchType=image&q=${encodeURIComponent(query)}&num=${count}`;
    const response = await axios.get(url);

    const images = response.data.items.map(item => item.link);
    res.json({ status: "success", count: images.length, data: images });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: "error", message: "Failed to fetch image data" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
