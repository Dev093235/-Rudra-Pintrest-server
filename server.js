const express = require("express");
const axios = require("axios");
const app = express();

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.CX_ID;

app.get("/", (req, res) => {
  res.send("✅ Server working. Use /coupledp?q=your+query&n=number");
});

app.get("/coupledp", async (req, res) => {
  const query = req.query.q || "couple dp";
  const count = Math.min(parseInt(req.query.n || "5"), 10);

  if (!API_KEY || !CX_ID) {
    return res.status(500).json({ error: "Missing API_KEY or CX_ID in environment" });
  }

  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&searchType=image&q=${encodeURIComponent(query)}&num=${count}`;
    const response = await axios.get(searchUrl);

    const images = response.data.items.map(item => item.link).filter(Boolean);

    if (!images || images.length === 0) {
      return res.status(404).json({ error: "No images found." });
    }

    const buffers = await Promise.all(images.map(link =>
      axios.get(link, { responseType: "arraybuffer" }).then(res => res.data).catch(() => null)
    ));

    const validBuffers = buffers.filter(Boolean);
    if (validBuffers.length === 0) {
      return res.status(500).json({ error: "Failed to download images." });
    }

    res.writeHead(200, { "Content-Type": `multipart/mixed; boundary=--rudra` });

    validBuffers.forEach((buf, i) => {
      res.write(`--rudra\r\n`);
      res.write(`Content-Type: image/jpeg\r\n`);
      res.write(`Content-Disposition: inline; filename="dp${i + 1}.jpg"\r\n\r\n`);
      res.write(buf);
      res.write(`\r\n`);
    });

    res.end(`--rudra--`);

  } catch (error) {
    console.error("❌", error.message);
    res.status(500).json({ error: "Something went wrong while fetching images." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
