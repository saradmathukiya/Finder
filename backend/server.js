const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Default route to check if server is running
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Gujarat Business Finder API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Proxy endpoint for SerpAPI
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    console.log("Received search query:", query);

    if (!query) {
      console.log("Error: Query parameter is missing");
      return res.status(400).json({ error: "Query parameter is required" });
    }

    console.log("Making request to SerpAPI with params:", {
      engine: "google_maps",
      q: query,
      type: "search",
    });

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_maps",
        q: query,
        type: "search",
        api_key: process.env.SERPAPI_KEY,
      },
    });

    console.log("SerpAPI Response Status:", response.status);

    // Remove thumbnail from results
    if (response.data && response.data.local_results) {
      response.data.local_results = response.data.local_results.map(
        (result) => {
          const { thumbnail, ...resultWithoutThumbnail } = result;
          return resultWithoutThumbnail;
        }
      );
    }

    console.log(
      "SerpAPI Response Data:",
      JSON.stringify(response.data, null, 2)
    );

    res.json(response.data);
  } catch (error) {
    console.error("Detailed Error Information:");
    console.error("Error Message:", error.message);
    console.error("Error Response:", error.response?.data);
    console.error("Error Status:", error.response?.status);
    console.error("Full Error Object:", error);

    res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
      response: error.response?.data,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
