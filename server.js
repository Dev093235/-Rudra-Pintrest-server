const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.CX_ID;

app.get("/", (req, res) => {
  res.send("✅ Rudra Pinterest DP Server Working");
});

app.get("/dp", async (req, res) => {
  const query = req.query.q || "couple dp";
  const count = parseInt(req.query.n || "3");

  if (!API_KEY || !CX_ID) {
    return res.status(500).json({ error: "Missing GOOGLE_API_KEY or CX_ID in environment." });
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&searchType=image&q=${encodeURIComponent(query)}&num=${count}`;
    const response = await axios.get(url);

    const items = response.data.items || [];
    const imageLinks = items.map(item => item.link);

    return res.json({
      status: "success",
      count: imageLinks.length,
      data: imageLinks
    });

  } catch (err) {
    console.error("❌ Error fetching images:", err.message);
    return res.status(500).json({ status: "error", message: "API fetch failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
