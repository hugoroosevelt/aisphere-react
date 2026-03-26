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

  // 🔢 LIVE COUNTER
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🌍 MAP
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
      projection: "mercator" // safer than globe
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("MAP LOADED ✅");

      // SOURCE
      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      // LAYER
      map.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": 8,
          "circle-color": "#00ff88"
        }
      });

      // CLICK HANDLER
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["points"]
        });

        if (!features.length) return;

        const f = features[0];

        new mapboxgl.Popup()
          .setLngLat(f.geometry.coordinates)
          .setHTML(`
            <strong>${f.properties.country}</strong><br/>
            Rank: #${f.properties.rank}<br/>
            🔥 ${(f.properties.keywords || []).join(" • ")}
          `)
          .addTo(map);
      });

      // DATA FETCH
      const fetchData = async () => {
        console.log("FETCH STARTED 🔥");

        try {
          const res = await fetch("https://aisphere-api.onrender.com/trends");
          const data = await res.json();

          const sorted = [...data].sort((a, b) => b.score - a.score);

          console.log("SORTED 👉", sorted);

          setTopRegion(sorted[0]?.country || "N/A");
          setTopThree(sorted.slice(0, 5));

          const features = sorted.map((item, index) => ({
            type: "Feature",
            properties: {
              country: item.country,
              rank: index + 1,
              keywords: item.keywords || []
            },
            geometry: {
              type: "Point",
              coordinates: countryCoords[item.country] || [0, 0]
            }
          }));

          map.getSource("points").setData({
            type: "FeatureCollection",
            features
          });

        } catch (err) {
          console.error("API ERROR:", err);
        }
      };

      fetchData();
      setInterval(fetchData, 10000);
    });

  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} style={{ height: "100vh" }} />

      {/* PANEL */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.75)",
        color: "white",
        padding: "18px",
        borderRadius: "14px",
        width: "260px"
      }}>
        <h3>🌐 AI Search Activity</h3>

        <p>{liveCount.toLocaleString()}</p>
        <p>Top Region: {topRegion}</p>

        <div style={{ marginTop: "10px" }}>
          <strong>Top Countries:</strong>

          {topThree.map((item, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div>{i + 1}. {item.country}</div>

              {item.keywords && (
                <div style={{ fontSize: "11px", opacity: 0.7 }}>
                  🔥 {item.keywords.join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}