import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const FIXED_POINTS = {
  "Mota Varachha": { lat: 21.2487, lng: 72.8417 },
  Adajan: { lat: 21.1702, lng: 72.8311 },
};

const BATCH_SIZE = 5;

const Map = ({ leads, area, onBatchComplete }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [visitedLeads, setVisitedLeads] = useState(new Set());
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setMapError(
          "Google Maps API key is missing. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file."
        );
        return;
      }

      if (!mapRef.current) {
        setMapError("Map container is not available");
        return;
      }

      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places", "marker", "geometry"],
      });

      try {
        const google = await loader.load();

        // Initialize the map
        const map = new google.maps.Map(mapRef.current, {
          center: FIXED_POINTS[area] || { lat: 21.1702, lng: 72.8311 },
          zoom: 13,
        });
        mapInstanceRef.current = map;

        // Initialize directions service and renderer
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#FF0000",
            strokeWeight: 6,
            strokeOpacity: 0.8,
          },
          preserveViewport: true,
        });

        // Add fixed point marker with custom icon
        if (FIXED_POINTS[area]) {
          new google.maps.Marker({
            position: FIXED_POINTS[area],
            map,
            title: `${area} Salesman House`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#FF0000",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
            label: {
              text: "S",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "bold",
            },
            zIndex: 1000, // Ensure it's always on top
          });

          // Add info window for fixed point
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #FF0000;">Salesman House</h3>
                <p style="margin: 0;">${area}</p>
              </div>
            `,
          });

          // Add click listener to show info window
          map.addListener("click", () => {
            infoWindow.close();
          });

          // Show info window by default
          infoWindow.open(
            map,
            new google.maps.Marker({
              position: FIXED_POINTS[area],
              map: null,
            })
          );
        }

        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setMapError(
          "Failed to load Google Maps. Please check your API key and try again."
        );
      }
    };

    initMap();
  }, [area]);

  useEffect(() => {
    if (!mapLoaded || !leads.length) return;

    const updateMap = async () => {
      try {
        const google = window.google;
        if (!google) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Process leads in batches
        const unvisitedLeads = leads.filter(
          (lead) => !visitedLeads.has(lead.place_id)
        );
        const nextBatch = unvisitedLeads.slice(0, BATCH_SIZE);
        setCurrentBatch(nextBatch);

        // Add markers for current batch
        const waypoints = [];
        const geocoder = new google.maps.Geocoder();

        for (const [index, lead] of nextBatch.entries()) {
          try {
            const results = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: lead.address }, (results, status) => {
                if (status === "OK" && results[0]) {
                  resolve(results);
                } else {
                  reject(new Error(`Geocoding failed for ${lead.address}`));
                }
              });
            });

            const marker = new google.maps.Marker({
              position: results[0].geometry.location,
              map: directionsRendererRef.current.getMap(),
              title: `${index + 1}. ${lead.name}`,
              label: {
                text: `${index + 1}`,
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "bold",
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              },
              animation: google.maps.Animation.DROP,
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0;">Stop ${index + 1}: ${
                lead.name
              }</h3>
                  <p style="margin: 0 0 4px 0;">${lead.address}</p>
                  <p style="margin: 0 0 4px 0;">Phone: ${lead.phone}</p>
                  ${
                    lead.website !== "Not available"
                      ? `<p style="margin: 0 0 4px 0;">Website: ${lead.website}</p>`
                      : ""
                  }
                  <button 
                    onclick="window.parent.postMessage({ type: 'LEAD_VISITED', placeId: '${
                      lead.place_id
                    }' }, '*')"
                    style="
                      background-color: #4285F4;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-top: 8px;
                    "
                  >
                    Mark as Visited
                  </button>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(directionsRendererRef.current.getMap(), marker);
            });

            markersRef.current.push(marker);
            waypoints.push({
              location: results[0].geometry.location,
              stopover: true,
            });
          } catch (error) {
            console.error(`Error geocoding address for ${lead.name}:`, error);
          }
        }

        // Calculate and display route
        if (FIXED_POINTS[area] && waypoints.length > 0) {
          const request = {
            origin: FIXED_POINTS[area],
            destination: FIXED_POINTS[area],
            waypoints: waypoints,
            optimizeWaypoints: false, // Keep the original order
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false,
          };

          directionsServiceRef.current.route(request, (result, status) => {
            if (status === "OK") {
              directionsRendererRef.current.setDirections(result);

              // Adjust map bounds to show the entire route
              const bounds = new google.maps.LatLngBounds();
              result.routes[0].legs.forEach((leg) => {
                leg.steps.forEach((step) => {
                  bounds.extend(step.start_location);
                  bounds.extend(step.end_location);
                });
              });
              mapInstanceRef.current.fitBounds(bounds);
            } else {
              console.error("Directions request failed:", status);
            }
          });
        }
      } catch (error) {
        console.error("Error updating map:", error);
      }
    };

    updateMap();
  }, [leads, area, visitedLeads, mapLoaded]);

  const handleLeadVisited = (event) => {
    if (event.data.type === "LEAD_VISITED") {
      const { placeId } = event.data;
      setVisitedLeads((prev) => {
        const newVisited = new Set(prev).add(placeId);
        if (newVisited.size % BATCH_SIZE === 0) {
          onBatchComplete && onBatchComplete();
        }
        return newVisited;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleLeadVisited);
    return () => {
      window.removeEventListener("message", handleLeadVisited);
    };
  }, []);

  if (mapError) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
        {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "600px",
        marginTop: "20px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}
    />
  );
};

export default Map;
