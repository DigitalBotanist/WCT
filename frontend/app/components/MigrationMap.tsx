// MigrationMap.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type YearlyData = {
  year: number;
  locationLong: number[];
  locationLat: number[];
};

type Props = {
  data: YearlyData[];
  title: string;
};

const colors = ["red","blue","green","purple","orange","darkcyan","brown","black"];

const MigrationMap: React.FC<Props> = ({ data, title }) => {

  return (
    <div style={{ width: "100%", aspectRatio: "3/2", marginBottom: "20px" }} className="flex flex-col">
      <h2 className="text-2xl font-bold text-primary-700">{title}</h2>
      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px", gap: "10px" }}>
        {data.map((yearData, idx) => {
          const color = colors[idx % colors.length];
          return (
            <div key={yearData.year} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: color,
                  borderRadius: "50%",
                  border: "1px solid #000",
                }}
              ></div>
              <span>{yearData.year}</span>
            </div>
          );
        })}
      </div>
      <MapContainer center={[20, 20]} zoom={2} style={{ width: "100%", height: "100%", borderRadius: "15px" }} className="flex-1">
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((yearData, idx) => {
          const color = colors[idx % colors.length];
          return yearData.locationLat.map((lat, i) => {
            const lng = yearData.locationLong[i];
            const icon = L.divIcon({
              className: "custom-marker",
              html: `<div style="background:${color};width:10px;height:10px;border-radius:50%"></div>`,
            });
            return (
              <Marker key={`${yearData.year}-${i}`} position={[lat, lng]} icon={icon}>
                <Popup>
                  <b>Year:</b> {yearData.year}<br/>
                  Lat: {lat}, Lng: {lng}
                </Popup>
              </Marker>
            );
          });
        })}
      </MapContainer>
    </div>
  );
};

export default MigrationMap;
