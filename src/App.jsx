import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const countryCoords = {
  "United States": [-98, 39],
  "China": [104, 35],
  "India": [78.9, 21],
  "Germany": [10.4, 51],
  "United Kingdom": [-3, 55],
  "France": [2.2, 46],
  "Japan": [138, 36],
  "South Korea": [127.5, 36],
  "Canada": [-106, 56],
  "Australia": [134, -25],
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [data, setData] = useState([]);
  const [topRegion, setTopRegion] = useState("Loading...");

  // 🌍 MAP INIT (SAFE + STABLE)
  useEffect(() => {
  if (!mapContainer.current) return;
  if (mapRef.current) return;

  // ⏳ Wait for DOM to stabilize (critical for Vercel + React)
  const timer = setTimeout(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("MAP STABLE ✅");
    });

  }, 100); // 👈 small delay fixes hydration issue

  return () => clearTimeout(timer);

}, []);

  // 📊 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://aisphere-api.onrender.com/trends");
        const json = await res.json();

        console.log("DATA:", json);

        const sorted = [...json].sort((a, b) => b.score - a.score);

        setData(sorted.slice(0, 10));
        setTopRegion(sorted[0]?.country || "N/A");

      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      
      {/* 🌍 MAP */}
      <div
  ref={mapContainer}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh", // ✅ THIS FIXES EVERYTHING
    zIndex: 0
  }}
/>

      {/* 📊 PANEL */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.75)",
          color: "white",
          padding: "18px",
          borderRadius: "14px",
          width: "260px",
          maxHeight: "80vh",
          overflowY: "auto"
        }}
      >
        <h3>🌐 AI Search Activity</h3>

        <p>Top Region: {topRegion}</p>

        <strong>Top Countries:</strong>

        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <div>{i + 1}. {item.country}</div>

            <div style={{ fontSize: "11px", opacity: 0.7 }}>
              {(item.keywords && item.keywords.length > 0
                ? item.keywords
                : ["AI", "ChatGPT", "OpenAI"]
              ).join(" • ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}