import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { travelLocations } from "../data/travel-locations";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function TravelMap() {
  const [isMounted, setIsMounted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { center, zoom } = useMemo(() => {
    if (travelLocations.length === 0) {
      return { center: [20, 0] as [number, number], zoom: 2 };
    }

    const lats = travelLocations.map((loc) => loc.latitude);
    const lngs = travelLocations.map((loc) => loc.longitude);

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    let calculatedZoom = 2;
    if (maxSpread < 0.1) calculatedZoom = 10;
    else if (maxSpread < 0.5) calculatedZoom = 8;
    else if (maxSpread < 2) calculatedZoom = 6;
    else if (maxSpread < 10) calculatedZoom = 4;

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: calculatedZoom,
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    travelLocations.forEach((location) => {
      L.marker([location.latitude, location.longitude], {
        icon: defaultIcon,
      })
        .addTo(markersLayer)
        .bindPopup(
          `
            <div class="text-gray-900">
              <div class="font-bold text-lg">${location.city}</div>
              <div class="text-sm text-gray-600">${location.country}</div>
              ${
                location.year
                  ? `<div class="text-xs text-gray-500 mt-1">${location.year}</div>`
                  : ""
              }
              ${
                location.notes
                  ? `<div class="text-sm text-gray-700 mt-1">${location.notes}</div>`
                  : ""
              }
            </div>
          `
        );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center, zoom, isMounted]);

  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) {
      return;
    }

    markersLayer.clearLayers();

    travelLocations.forEach((location) => {
      L.marker([location.latitude, location.longitude], {
        icon: defaultIcon,
      })
        .addTo(markersLayer)
        .bindPopup(
          `
            <div class="text-gray-900">
              <div class="font-bold text-lg">${location.city}</div>
              <div class="text-sm text-gray-600">${location.country}</div>
              ${
                location.year
                  ? `<div class="text-xs text-gray-500 mt-1">${location.year}</div>`
                  : ""
              }
              ${
                location.notes
                  ? `<div class="text-sm text-gray-700 mt-1">${location.notes}</div>`
                  : ""
              }
            </div>
          `
        );
    });
  }, [travelLocations]);

  if (travelLocations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center text-gray-400">
        No travel locations added yet.
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900/50">
      <div
        ref={mapContainerRef}
        className="h-[400px] md:h-[500px] lg:h-[600px] w-full z-0"
      />
    </div>
  );
}

export default TravelMap;

