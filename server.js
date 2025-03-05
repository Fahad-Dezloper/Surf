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
        const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        await page.waitForSelector('ytd-video-renderer a#thumbnail', { timeout: 5000 });

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

app.post("/amazon/add-to-cart", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing product query" });

    try {
        const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
        const page = await browser.newPage();

        await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });

        try {
            await page.waitForSelector("div.s-main-slot div[data-component-type='s-search-result'] h2 a", { timeout: 5000 });
            const productElement = await page.$("div.s-main-slot div[data-component-type='s-search-result'] h2 a");
            const productLink = await page.evaluate(el => el.href, productElement);

            await page.goto(productLink, { waitUntil: "domcontentloaded" });

            await page.waitForSelector("#add-to-cart-button", { timeout: 5000 });
            await page.click("#add-to-cart-button");

            return { success: true, message: "Product added to Amazon cart." };
        } catch (error) {
            return { success: false, message: "Amazon product not found." };
        } finally {
            await browser.close();
        }
        } catch (error) {
            res.status(500).json({ error: "Amazon automation failed" });
            console.error(error);
    }
});

app.post("/flipkart/add-to-cart", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing product query" });

    const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });

    try {
        // Select the first product
        await page.waitForSelector("a._1fQZEK", { timeout: 5000 });
        const productElement = await page.$("a._1fQZEK");
        const productLink = await page.evaluate(el => el.href, productElement);

        await page.goto(productLink, { waitUntil: "domcontentloaded" });

        // Click "Add to Cart"
        await page.waitForSelector("._2KpZ6l._2U9uOA._3v1-ww", { timeout: 5000 });
        await page.click("._2KpZ6l._2U9uOA._3v1-ww");

        return { success: true, message: "Product added to Flipkart cart." };
    } catch (error) {
        return { success: false, message: "Flipkart product not found." };
    } finally {
        await browser.close();
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
