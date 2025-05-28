import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SearchForm from "./components/SearchForm";
import ResultsList from "./components/ResultsList";
import { useState } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

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
        `https://lead-scraper-eegd.onrender.com/api/search?query=${encodeURIComponent(
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Lead Scraper
          </h1>
          <p style={{ textAlign: "center", marginBottom: "2rem" }}>
            Find cafes, schools, and restaurants in Surat, Vadodara, and
            Ahmedabad
          </p>

          <SearchForm onSearch={handleSearch} />

          {error && (
            <Box sx={{ color: "error.main", textAlign: "center", my: 2 }}>
              {error}
            </Box>
          )}

          <ResultsList results={searchResults} loading={loading} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
