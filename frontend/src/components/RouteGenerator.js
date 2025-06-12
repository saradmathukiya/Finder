import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const RouteGenerator = ({ leads, salesmanLocation }) => {
  const [generatedRoutes, setGeneratedRoutes] = useState([]);

  const generateRoutes = () => {
    // Create batches of 5 leads
    const batches = [];
    for (let i = 0; i < leads.length; i += 5) {
      batches.push(leads.slice(i, i + 5));
    }

    // Generate routes for each batch
    const routes = batches.map((batch, batchIndex) => {
      const route = {
        batchNumber: batchIndex + 1,
        stops: batch,
        directionsLink: generateDirectionsLink(salesmanLocation, batch),
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

    // Format each stop with its name and address
    const stopPoints = stops
      .map((stop) => {
        const address = encodeURIComponent(stop.address);
        return address;
      })
      .join("/");

    return `${baseUrl}${startPoint}/${stopPoints}`;
  };

  return (
    <div className="mt-4">
      <Button onClick={generateRoutes} className="w-full">
        Generate Routes
      </Button>

      {generatedRoutes.map((route) => (
        <Card key={route.batchNumber} className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Route {route.batchNumber}</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Starting from: {salesmanLocation.name}
              </p>
              {route.stops.map((stop, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">
                    Stop {index + 1}: {stop.name}
                  </p>
                  <p className="text-muted-foreground">{stop.address}</p>
                </div>
              ))}
              <a
                href={route.directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm block mt-2"
              >
                Get Directions
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RouteGenerator;
