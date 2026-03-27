import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
console.log("TOKEN:", import.meta.env.VITE_MAPBOX_TOKEN);
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function App() {
  const [data, setData] = useState([]);
  const [topRegion, setTopRegion] = useState("Loading...");

  const mapContainer = useRef(null);

  // 📊 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://aisphere-api.onrender.com/trends");
        const json = await res.json();

        console.log("DATA:", json);

        const top10 = json.slice(0, 10);

        setData(top10);
        setTopRegion(top10[0]?.country || "N/A");

      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();
  }, []);

  // 🌍 MAP (SAFE INIT)
  useEffect(() => {
  if (!mapContainer.current) return;

  const timer = setTimeout(() => {
    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 1.5
      });

      console.log("MAP INIT OK");

      return () => map.remove();

    } catch (err) {
      console.error("MAP ERROR:", err);
    }
  }, 300); // 👈 key fix (delay)

  return () => clearTimeout(timer);
}, []);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      
      {/* 🌍 MAP BACKGROUND */}
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "100%"
        }}
      />

      {/* 📊 PANEL */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "40px",
          color: "white",
          maxWidth: "400px",
          background: "rgba(0,0,0,0.7)",
          borderRadius: "12px",
          margin: "20px"
        }}
      >
        <h1>🌐 AI Search Activity</h1>

        <h3>Top Region: {topRegion}</h3>

        <h2>Top Countries:</h2>

        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: "12px" }}>
            <strong>{i + 1}. {item.country}</strong>

            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {(item.keywords || []).join(" • ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}