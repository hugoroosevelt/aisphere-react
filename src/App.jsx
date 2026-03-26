import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const countryCoords = {
  "United States": [-98, 39],
  "Mexico": [-102, 23],
  "India": [78.9, 21],
  "Brazil": [-51, -10],
  "Germany": [10.4, 51],
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [topRegion, setTopRegion] = useState("Loading...");
  const [topThree, setTopThree] = useState([]);
  const [liveCount, setLiveCount] = useState(2440000);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
      projection: "globe"
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.setFog({});
    });

    map.on("load", () => {
      map.addSource("points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      map.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 8,
          "circle-color": "#00ff88"
        }
      });

      const fetchData = async () => {
        try {
          const res = await fetch("https://aisphere-api.onrender.com/trends");
          const data = await res.json();

          const sorted = [...data].sort((a, b) => b.score - a.score);

          setTopRegion(sorted[0]?.country || "N/A");
          setTopThree(sorted.slice(0, 5));

          const features = sorted.map(item => ({
            type: "Feature",
            properties: { country: item.country },
            geometry: {
              type: "Point",
              coordinates: countryCoords[item.country] || [0,0]
            }
          }));

          map.getSource("points").setData({
            type: "FeatureCollection",
            features
          });

        } catch (e) {
          console.error(e);
        }
      };

      fetchData();
    });

  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} style={{ height: "100vh" }} />

      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.75)",
        color: "white",
        padding: "18px",
        borderRadius: "14px"
      }}>
        <h3>🌐 AI Search Activity</h3>

        <p>{liveCount.toLocaleString()}</p>
        <p>Top Region: {topRegion}</p>

        <div>
          {topThree.map((item, i) => (
            <div key={i}>
              {i + 1}. {item.country}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}