import mapboxgl from "mapbox-gl";
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
  "Singapore": [103.8, 1.3]
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [topRegion, setTopRegion] = useState("Loading...");
  const [topThree, setTopThree] = useState([]);
  const [liveCount, setLiveCount] = useState(2440000);

  // 🔢 LIVE COUNTER
 useEffect(() => {
  if (!mapContainer.current) return;

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/dark-v11",
    center: [0, 20],
    zoom: 1.5,
    projection: "mercator"
  });

  mapRef.current = map;

  map.on("load", () => {
    console.log("MAP READY");

    map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
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

        console.log("DATA LENGTH:", data.length);

        const top10 = data.slice(0, 10);

        setTopRegion(top10[0]?.country || "N/A");
        setTopThree(top10);

        const features = top10.map((item, index) => ({
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
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();
    setInterval(fetchData, 10000);
  });

  return () => map.remove();

}, []);

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
            ${(f.properties.keywords || ["AI","ChatGPT","OpenAI"]).join(" • ")}
          `)
          .addTo(map);
      });

      // DATA FETCH
      const fetchData = async () => {
        console.log("FETCH DATA RUNNING");

        try {
          const res = await fetch("https://aisphere-api.onrender.com/trends");
          const data = await res.json();

          const sorted = [...data].sort((a, b) => b.score - a.score);

          console.log("SORTED 👉", sorted);

          setTopRegion(sorted[0]?.country || "N/A");
          const top10 = sorted.slice(0, 10);

console.log("TOP10 LENGTH:", top10.length);

setTopThree(
  top10.map((item, index) => ({
    country: item.country,
    rank: index + 1,
    keywords: Array.isArray(item.keywords) ? item.keywords : []
  }))
);

console.log("FULL DATA LENGTH:", data.length);
console.log("SORTED LENGTH:", sorted.length);

          const features = sorted.map((item, index) => ({
            type: "Feature",
            properties: {
              country: item.country,
              rank: index + 1,
              keywords: item.keywords || []
            },
            geometry: {
              type: "Point",
              coordinates: countryCoords[item.country] ?? [0, 0]
            }
          }));

          const source = map.getSource("points");

if (source) {
  source.setData({
    type: "FeatureCollection",
    features
  });
}

        } catch (err) {
          console.error("API ERROR:", err);
        }
      };
      console.log("MAP READY");
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
  width: "260px",
  maxHeight: "80vh",        // ✅ LIMIT HEIGHT
  overflowY: "auto"         // ✅ ENABLE SCROLL
}}>
        <h3>🌐 AI Search Activity</h3>

        <p>{liveCount.toLocaleString()}</p>
        <p>Top Region: {topRegion}</p>

        <div style={{ marginTop: "10px" }}>
          <strong>Top 10 Countries:</strong>

          {topThree.map((item, i) => (
  <div key={i} style={{ marginBottom: "10px" }}>
    <div>{i + 1}. {item.country}</div>

    <div style={{ fontSize: "11px", opacity: 0.7 }}>
      {(item.keywords && item.keywords.length > 0
        ? item.keywords
        : ["AI", "ChatGPT", "OpenAI"]
      ).join(" • ")}
    </div>
  </div>
))}
  <div style={{ fontSize: "11px", opacity: 0.4 }}>
    <span style={{ opacity: 0.4 }}>No data</span>
  </div>
)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}