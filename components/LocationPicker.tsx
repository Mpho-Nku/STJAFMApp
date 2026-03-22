'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  onSelect: (location: { name: string; lat: number; lon: number }) => void;
}

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function MapClickMarker({
  onSelect,
}: {
  onSelect: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function LocationPicker({ onSelect }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<[number, number] | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     SEARCH LOCATION (DEBOUNCED)
  ----------------------------- */
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=ZA&limit=5`
        );

        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  /* -----------------------------
     SELECT FROM SEARCH
  ----------------------------- */
  const handleSelect = (place: SearchResult) => {
    const loc = {
      name: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    };

    onSelect(loc);

    setQuery('');
    setResults([]);
    setShowMap(false);
  };

  /* -----------------------------
     MAP CLICK
  ----------------------------- */
  const handleMapClick = (lat: number, lon: number) => {
    const loc = {
      name: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
      lat,
      lon,
    };

    setSelectedMarker([lat, lon]);
    onSelect(loc);
    setShowMap(false);
  };

  return (
    <div className="relative">
      {/* SEARCH BOX */}
      <div className="flex items-center mb-2 relative">
        <Search size={18} className="text-gray-500 mr-2" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place..."
          className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
        />

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          title="Pick from map"
        >
          <MapPin size={18} className="text-gray-600" />
        </button>

        {loading && (
          <Loader2 className="animate-spin text-gray-400 ml-2" size={16} />
        )}
      </div>

      {/* AUTOCOMPLETE RESULTS */}
      {results.length > 0 && (
        <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-40 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-3 py-2 hover:bg-gray-100 text-sm cursor-pointer"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* MAP PICKER */}
      {showMap && (
        <div className="mt-2 border border-gray-300 rounded-md overflow-hidden">
          <MapContainer
            center={[-26.2041, 28.0473]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {selectedMarker && <Marker position={selectedMarker} />}

            <MapClickMarker onSelect={handleMapClick} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}