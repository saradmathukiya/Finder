import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Pagination,
  Link,
  Rating,
} from "@mui/material";

const ResultsList = ({ results, loading }) => {
  const [page, setPage] = useState(1);
  const resultsPerPage = 9;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!results.length) {
    return (
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No results found. Try a different search.
        </Typography>
      </Box>
    );
  }

  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / resultsPerPage);

  return (
    <Box
      sx={{
        width: "100vw",
        maxWidth: "100%",
        mx: "auto",
        px: { xs: 2, sm: 3 },
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {currentResults.map((place, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
            sx={{
              display: "flex",
              width: "100%",
              "& > *": {
                width: "100%",
              },
            }}
          >
            <Card
              elevation={2}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              {place.thumbnail && (
                <Box
                  component="img"
                  src={place.thumbnail}
                  alt={place.name}
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                  }}
                />
              )}
              <CardContent
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: 600,
                  }}
                >
                  {place.name}
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Address:</strong> {place.address}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Phone:</strong> {place.phone}
                  </Typography>

                  {place.website !== "Not available" && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <strong>Website:</strong>{" "}
                      <Link href={place.website} target="_blank" rel="noopener">
                        Visit Website
                      </Link>
                    </Typography>
                  )}

                  {place.rating !== "Not rated" && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Rating
                        value={parseFloat(place.rating)}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({place.reviews})
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
          />
        </Box>
      )}
    </Box>
  );
};

export default ResultsList;
