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
  "Mexico": [-102, 23],
  "Brazil": [-51, -10],
  "Argentina": [-64, -34],
  "Chile": [-71, -35],
  "Colombia": [-74, 4],
  "Spain": [-3.7, 40],
  "Italy": [12.5, 42.8],
  "Netherlands": [5.3, 52.1],
  "Sweden": [18.6, 60.1],
  "Switzerland": [8.2, 46.8],
  "United Arab Emirates": [54, 24],
  "Saudi Arabia": [45, 24],
  "South Africa": [24, -29],
  "Nigeria": [8, 9],
  "Singapore": [103.8, 1.3],
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [data, setData] = useState([]);
  const [topRegion, setTopRegion] = useState("Loading...");

  // 🌍 MAP INIT (robust against hard refresh)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "points-layer",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "score"],
            50, 5,
            100, 15
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "score"],
            50, "#00ff88",
            100, "#ff3b3b"
          ],
          "circle-opacity": 0.8,
        },
      });

      console.log("MAP READY ✅");
    });

  }, []);

  // 📊 FETCH + LIVE UPDATE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://aisphere-api.onrender.com/trends");
        const json = await res.json();

        const sorted = [...json].sort((a, b) => b.score - a.score);

        setData(sorted.slice(0, 10));
        setTopRegion(sorted[0]?.country || "N/A");

        // 🔥 UPDATE MAP
        if (mapRef.current && mapRef.current.getSource("points")) {
          const features = sorted.map((item) => ({
            type: "Feature",
            properties: {
              country: item.country,
              score: item.score,
            },
            geometry: {
              type: "Point",
              coordinates: countryCoords[item.country] || [0, 0],
            },
          }));

          mapRef.current.getSource("points").setData({
            type: "FeatureCollection",
            features,
          });
        }

      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // 🔥 live updates

    return () => clearInterval(interval);
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
          height: "100vh",
          zIndex: 0,
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
          overflowY: "auto",
          zIndex: 1,
        }}
      >
        <h3>🌐 AI Search Activity</h3>

        <p>Top Region: {topRegion}</p>

        <strong>Top Countries:</strong>

        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <div>{i + 1}. {item.country}</div>

            <div style={{ fontSize: "11px", opacity: 0.7 }}>
              {(item.keywords?.length ? item.keywords : ["AI", "ChatGPT", "OpenAI"]).join(" • ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}