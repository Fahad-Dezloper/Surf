const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/search", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing search query" });

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);

        await page.waitForSelector('ytd-video-renderer a#thumbnail');

        const videoElement = await page.$('ytd-video-renderer a#thumbnail');
        if (videoElement) {
            await videoElement.click();
        } else {
            return res.status(404).json({ error: "No video found" });
        }

        res.json({ message: `Playing: ${query}` });

    } catch (error) {
        res.status(500).json({ error: "Error searching YouTube" });
        console.error(error);
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
