"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface CheckIn {
  locationCity: string;
  locationCountry: string;
  locationLat?: number;
  locationLng?: number;
  user: {
    username: string;
  };
}

interface GlobalFanMapProps {
  matchId: string;
}

export function GlobalFanMap({ matchId }: GlobalFanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox token not configured");
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (map.current) return; // Initialize map only once

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 1.5,
        projection: { name: "globe" } as any,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    fetchCheckIns();

    // Poll for new check-ins every 10 seconds
    const interval = setInterval(fetchCheckIns, 10000);

    return () => {
      clearInterval(interval);
      if (map.current) {
        map.current.remove();
      }
    };
  }, [matchId]);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch(`/api/check-ins?matchId=${matchId}`);
      const data = await response.json();
      setCheckIns(data.checkIns || []);
      updateMarkers(data.checkIns || []);
    } catch (error) {
      console.error("Failed to fetch check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = (checkInsData: CheckIn[]) => {
    if (!map.current) return;

    // Remove existing markers (in a real app, you'd track and update them)
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add markers for check-ins with coordinates
    checkInsData.forEach((checkIn) => {
      if (checkIn.locationLat && checkIn.locationLng && map.current) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <p class="font-semibold">${checkIn.user.username}</p>
            <p class="text-sm">${checkIn.locationCity}, ${checkIn.locationCountry}</p>
          </div>`
        );

        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#EF0107";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        new mapboxgl.Marker(el)
          .setLngLat([checkIn.locationLng, checkIn.locationLat])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center p-8 text-center">
        <div>
          <p className="font-semibold mb-2">Map Not Configured</p>
          <p className="text-sm text-muted-foreground">
            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables to enable the global fan map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Global Fan Map</h3>
          <p className="text-sm text-muted-foreground">
            {checkIns.length} Gooners checked in worldwide
          </p>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
}
