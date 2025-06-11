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

// Google Places API endpoint
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    console.log("Received search query:", query);

    if (!query) {
      console.log("Error: Query parameter is missing");
      return res.status(400).json({ error: "Query parameter is required" });
    }

    console.log("Making request to Google Places API");

    // Using the new Places API v1
    const searchResponse = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      {
        textQuery: query,
        languageCode: "en",
        regionCode: "IN",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.regularOpeningHours,places.types,places.internationalPhoneNumber",
        },
      }
    );

    if (
      !searchResponse.data.places ||
      searchResponse.data.places.length === 0
    ) {
      return res.json({ local_results: [] });
    }

    // Transform the results to match our existing format
    const transformedResults = {
      local_results: searchResponse.data.places.map((place) => ({
        title: place.displayName?.text || "Unknown Name",
        address: place.formattedAddress || "",
        phone: place.internationalPhoneNumber || "",
        website: place.websiteUri || "",
        rating: place.rating || "",
        reviews: place.userRatingCount || "",
        type: place.types ? place.types[0] : "",
        hours: place.regularOpeningHours?.weekdayDescriptions || [],
        place_id: place.id,
      })),
    };

    console.log(
      "Transformed Response Data:",
      JSON.stringify(transformedResults, null, 2)
    );
    res.json(transformedResults);
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
