import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const Map = ({ leads }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setMapError(
          "Google Maps API key is missing. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file."
        );
        return;
      }

      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places"],
      });

      try {
        const google = await loader.load();
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 21.1702, lng: 72.8311 }, // Default to Surat
          zoom: 12,
        });

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each lead
        leads.forEach((lead) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: lead.address }, (results, status) => {
            if (status === "OK" && results[0]) {
              const marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map,
                title: lead.name,
                animation: google.maps.Animation.DROP,
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div>
                    <h3>${lead.name}</h3>
                    <p>${lead.address}</p>
                    <p>Phone: ${lead.phone}</p>
                    ${
                      lead.website !== "Not available"
                        ? `<p>Website: ${lead.website}</p>`
                        : ""
                    }
                  </div>
                `,
              });

              marker.addListener("click", () => {
                infoWindow.open(map, marker);
              });

              markersRef.current.push(marker);
            }
          });
        });
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setMapError(
          "Failed to load Google Maps. Please check your API key and try again."
        );
      }
    };

    if (leads.length > 0) {
      initMap();
    }
  }, [leads]);

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
        height: "400px",
        marginTop: "20px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}
    />
  );
};

export default Map;
