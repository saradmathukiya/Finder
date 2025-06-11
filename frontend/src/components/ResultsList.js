import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Star } from "lucide-react";

const ResultsList = ({ results, loading }) => {
  const [page, setPage] = useState(1);
  const resultsPerPage = 9;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center my-8">
        <p className="text-lg text-muted-foreground">Try a different search.</p>
      </div>
    );
  }

  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / resultsPerPage);

  return (
    <div className="w-full max-w-full mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentResults.map((place, index) => (
          <Card
            key={index}
            className="w-full h-full flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            {place.thumbnail && (
              <div className="relative w-full h-48">
                <img
                  src={place.thumbnail}
                  alt={place.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold">{place.name}</h3>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Address:</span> {place.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Phone:</span> {place.phone}
                </p>
                {place.website !== "Not available" && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Website:</span>{" "}
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
                {place.rating !== "Not rated" && (
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(parseFloat(place.rating))
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({place.reviews})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8 mb-4">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(i + 1)}
              className="w-10 h-10"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;
