import React, { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultsList from "./components/ResultsList";
import Map from "./components/Map";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const { city, category, area } = searchParams;
      const searchQuery = `${category} in ${area} ${city} Gujarat`;

      const response = await fetch(
        `http://finder-237n.onrender.com/api/search?query=${encodeURIComponent(
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
      }));

      setSearchResults(formattedResults);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Lead Scraper
          </h1>
          <p className="text-lg text-muted-foreground">
            Find cafes, schools, and restaurants in Surat, Vadodara, and
            Ahmedabad
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <SearchForm onSearch={handleSearch} />

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-8">
              <Map leads={searchResults} />
            </div>
          )}

          <ResultsList results={searchResults} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
