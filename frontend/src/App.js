import React, { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import ResultsList from "./components/ResultsList";
import Map from "./components/Map";
import RouteGenerator from "./components/RouteGenerator";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

function App() {
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = localStorage.getItem("searchResults");
    return savedResults ? JSON.parse(savedResults) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBatch, setCurrentBatch] = useState(() => {
    const savedBatch = localStorage.getItem("currentBatch");
    return savedBatch ? JSON.parse(savedBatch) : [];
  });
  const [visitedLeads, setVisitedLeads] = useState(() => {
    const savedVisited = localStorage.getItem("visitedLeads");
    return savedVisited ? new Set(JSON.parse(savedVisited)) : new Set();
  });
  const [selectedArea, setSelectedArea] = useState(() => {
    return localStorage.getItem("selectedArea") || null;
  });
  const [isSharedRoute, setIsSharedRoute] = useState(false);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem("searchResults", JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem("currentBatch", JSON.stringify(currentBatch));
  }, [currentBatch]);

  useEffect(() => {
    localStorage.setItem("visitedLeads", JSON.stringify([...visitedLeads]));
  }, [visitedLeads]);

  useEffect(() => {
    if (selectedArea) {
      localStorage.setItem("selectedArea", selectedArea);
    }
  }, [selectedArea]);

  // Fixed salesman locations for different areas
  const salesmanLocations = {
    adajan: {
      lat: 21.237598419189453,
      lng: 72.88842010498047,
      name: "Salesman's House - Adajan",
      address: "Adajan Road, Surat, Gujarat, India",
    },
    "mota varachha": {
      lat: 21.2048,
      lng: 72.8411,
      name: "Salesman's House - Mota Varachha",
      address: "Mota Varachha, Surat, Gujarat, India",
    },
  };

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const { city, category, area } = searchParams;
      setSelectedArea(area.toLowerCase()); // Store the selected area
      const searchQuery = `${category} in ${area} ${city} Gujarat`;

      const response = await fetch(
        `https://finder-237n.onrender.com/api/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      if (!data.local_results || data.local_results.length === 0) {
        throw new Error("No results found");
      }

      const formattedResults = data.local_results.map((place) => ({
        name: place.title || "Unknown Name",
        address: place.address || "Address not available",
        phone: place.phone || "Not available",
        website: place.website || "Not available",
        type: category,
        rating: place.rating || "Not rated",
        reviews: place.reviews || "No reviews",
        hours: place.hours || "Hours not available",
        thumbnail: place.thumbnail || null,
        place_id: place.place_id,
        lat: place.gps_coordinates?.latitude || 0,
        lng: place.gps_coordinates?.longitude || 0,
      }));

      setSearchResults(formattedResults);
      setCurrentBatch(formattedResults);
      setVisitedLeads(new Set());
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate salesman location based on selected area
  const getSalesmanLocation = () => {
    if (!selectedArea) return salesmanLocations.adajan; // Default to Adajan
    return salesmanLocations[selectedArea] || salesmanLocations.adajan;
  };

  const handleBatchComplete = () => {
    const unvisitedLeads = searchResults.filter(
      (lead) => !visitedLeads.has(lead.place_id)
    );
    const nextBatch = unvisitedLeads.slice(0, 5);
    setCurrentBatch(nextBatch);
  };

  useEffect(() => {
    // Check for shared batch data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const batchData = urlParams.get("batch");

    if (batchData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(batchData));
        setSearchResults(decodedData.leads);
        setCurrentBatch(decodedData.leads);
        setSelectedArea(
          decodedData.salesmanLocation.name.toLowerCase().includes("adajan")
            ? "adajan"
            : "mota varachha"
        );
        setIsSharedRoute(true);
      } catch (err) {
        console.error("Error parsing shared batch data:", err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {isSharedRoute ? "Sales Route" : "Lead Scraper"}
          </h1>
          {!isSharedRoute && (
            <p className="text-lg text-muted-foreground">
              Find cafes, schools, and restaurants in Mota Varachha and Adajan
            </p>
          )}
        </div>

        <div className="max-w-7xl mx-auto">
          {!isSharedRoute && <SearchForm onSearch={handleSearch} />}

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-8">
              <Map
                leads={currentBatch}
                area={searchResults[0]?.area}
                onBatchComplete={handleBatchComplete}
                isSharedRoute={isSharedRoute}
              />
              <RouteGenerator
                leads={searchResults}
                salesmanLocation={getSalesmanLocation()}
                isSharedRoute={isSharedRoute}
              />
            </div>
          )}

          <ResultsList results={currentBatch} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
