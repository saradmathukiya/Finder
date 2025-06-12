import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "./ui/checkbox";

const RouteGenerator = ({ leads, salesmanLocation, isSharedRoute }) => {
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [visitedPlaces, setVisitedPlaces] = useState(new Set());

  // Get the base URL for shareable links
  const getBaseUrl = () => {
    // If we're in development, use localhost
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }
    // In production, use the actual deployed URL
    return window.location.origin;
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Find nearest neighbor for route optimization
  const findNearestNeighbor = (currentPoint, remainingPoints) => {
    let nearestPoint = null;
    let minDistance = Infinity;

    for (const point of remainingPoints) {
      const distance = calculateDistance(
        currentPoint.lat,
        currentPoint.lng,
        point.lat,
        point.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    return nearestPoint;
  };

  // Optimize route using nearest neighbor algorithm
  const optimizeRoute = (stops) => {
    if (stops.length <= 1) return stops;

    const optimizedStops = [];
    const remainingStops = [...stops];
    let currentPoint = salesmanLocation;

    while (remainingStops.length > 0) {
      const nearestStop = findNearestNeighbor(currentPoint, remainingStops);
      optimizedStops.push(nearestStop);
      currentPoint = nearestStop;
      remainingStops.splice(remainingStops.indexOf(nearestStop), 1);
    }

    return optimizedStops;
  };

  const generateRoutes = () => {
    // Create batches of 5 leads
    const batches = [];
    for (let i = 0; i < leads.length; i += 5) {
      batches.push(leads.slice(i, i + 5));
    }

    // Generate routes for each batch
    const routes = batches.map((batch, batchIndex) => {
      // Optimize the stops in this batch
      const optimizedStops = optimizeRoute(batch);

      // Generate shareable link for this batch
      const linkData = {
        batchNumber: batchIndex + 1,
        leads: optimizedStops,
        salesmanLocation: salesmanLocation,
        timestamp: new Date().toISOString(),
      };
      const encodedData = encodeURIComponent(JSON.stringify(linkData));
      const shareableLink = `${getBaseUrl()}${
        window.location.pathname
      }?batch=${encodedData}`;

      const route = {
        batchNumber: batchIndex + 1,
        stops: optimizedStops,
        directionsLink: generateDirectionsLink(
          salesmanLocation,
          optimizedStops
        ),
        shareableLink: shareableLink,
      };
      return route;
    });

    setGeneratedRoutes(routes);
  };

  const generateDirectionsLink = (start, stops) => {
    // Create a Google Maps directions URL with the salesman's location as start
    // and the stops in sequence
    const baseUrl = "https://www.google.com/maps/dir/";

    // Format the start location with address
    const startPoint = encodeURIComponent(start.address);

    // Format each stop with its full name and address
    const stopPoints = stops
      .map((stop) => {
        const fullAddress = `${stop.name}, ${stop.address}`;
        return encodeURIComponent(fullAddress);
      })
      .join("/");

    return `${baseUrl}${startPoint}/${stopPoints}`;
  };

  const handleVisitToggle = (placeId) => {
    setVisitedPlaces((prev) => {
      const newVisited = new Set(prev);
      if (newVisited.has(placeId)) {
        newVisited.delete(placeId);
      } else {
        newVisited.add(placeId);
      }
      return newVisited;
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // If it's a shared route, automatically generate the route
  React.useEffect(() => {
    if (isSharedRoute && leads.length > 0) {
      const optimizedStops = optimizeRoute(leads);
      setGeneratedRoutes([
        {
          batchNumber: 1,
          stops: optimizedStops,
          directionsLink: generateDirectionsLink(
            salesmanLocation,
            optimizedStops
          ),
        },
      ]);
    }
  }, [isSharedRoute, leads, salesmanLocation]);

  return (
    <div className="mt-4">
      {!isSharedRoute && (
        <Button onClick={generateRoutes} className="w-full">
          Generate Optimized Routes
        </Button>
      )}

      {generatedRoutes.map((route) => (
        <Card key={route.batchNumber} className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Route {route.batchNumber}</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Starting from: {salesmanLocation.name} -{" "}
                {salesmanLocation.address}
              </p>
              {route.stops.map((stop, index) => (
                <div
                  key={index}
                  className="text-sm border-b pb-2 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        Stop {index + 1}: {stop.name}
                      </p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {stop.address}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <Checkbox
                        id={`visited-${stop.place_id}`}
                        checked={visitedPlaces.has(stop.place_id)}
                        onChange={() => handleVisitToggle(stop.place_id)}
                      />
                      <label
                        htmlFor={`visited-${stop.place_id}`}
                        className="ml-2 text-sm text-muted-foreground"
                      >
                        Visited
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col space-y-2 mt-4">
                <a
                  href={route.directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Get Optimized Directions
                </a>
                {!isSharedRoute && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Share this route:
                    </p>
                    <Button
                      onClick={() => copyToClipboard(route.shareableLink)}
                      variant="outline"
                      size="sm"
                    >
                      Copy Link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RouteGenerator;
