"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function BranchMapClient({ branches }: { branches: any[] }) {
  useEffect(() => {
    // This is needed to ensure leaflet works properly with React 18 strict mode
    // Leaflet modifies the DOM which sometimes conflicts with React
  }, []);

  // Default center: Tamil Nadu
  const defaultCenter: [number, number] = [11.1271, 78.6569];
  
  // Calculate center based on first branch or use default
  const center = branches.find(b => b.latitude && b.longitude) 
    ? [branches.find(b => b.latitude && b.longitude).latitude, branches.find(b => b.latitude && b.longitude).longitude] 
    : defaultCenter;

  return (
    <MapContainer 
      center={center as [number, number]} 
      zoom={6} 
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {branches.map((branch) => {
        if (!branch.latitude || !branch.longitude) return null;
        
        return (
          <Marker 
            key={branch.id} 
            position={[branch.latitude, branch.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{branch.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{branch.address}</p>
                {branch.phone && (
                  <p className="text-xs font-semibold">{branch.phone}</p>
                )}
                {branch.googleMapUrl && (
                  <a 
                    href={branch.googleMapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
