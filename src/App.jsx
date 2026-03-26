import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// 🌍 coords
const countryCoords = {
  "United States": [-98, 39],
  "Mexico": [-102, 23],
  "China": [104, 35],
  "India": [78.9, 21],
  "Brazil": [-51, -10],
   "Germany": [10.4, 51],
  "France": [2.2, 46],
  "Japan": [138, 36],
  "Canada": [-106, 56],
  "Australia": [133, -25],
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // 📊 state
  const [topRegion, setTopRegion] = useState("Loading...");
  const [topThree, setTopThree] = useState([]);
  const [liveCount, setLiveCount] = useState(2439467);
  const [mexicoData, setMexicoData] = useState(null);
  const [usaData, setUsaData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🔢 LIVE COUNTER
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 500));
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
      projection: "globe"
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.setFog({});
    });

    map.on("load", () => {

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
          "circle-color": "#00ff88",
          "circle-opacity": 0.9
        }
      });
// 🖱 CLICK EVENT
map.on("click", "points", (e) => {
  const f = e.features[0];

  new mapboxgl.Popup()
    .setLngLat(f.geometry.coordinates)
    .setHTML(`
      <strong>${f.properties.country}</strong><br/>
      Rank: #${f.properties.rank}<br/>
      Activity: ${f.properties.intensity}
    `)
    .addTo(map);
});
      // 📊 DATA
      const fetchData = async () => {
  try {
     const res = await fetch("http://localhost:3001/trends");
    const data = await res.json();

    const sorted = [...data].sort((a, b) => b.score - a.score);

setTopRegion(sorted[0]?.country || "N/A");
setTopThree(sorted.slice(0, 10));

// 🇲🇽 Mexico
const mexico = sorted.find(i => i.country === "Mexico");
setMexicoData(
  mexico
    ? {
        rank: sorted.indexOf(mexico) + 1,
        keywords: mexico.keywords
      }
    : null
);

// 🇺🇸 USA
const usa = sorted.find(i => i.country === "United States");
setUsaData(
  usa
    ? {
        rank: sorted.indexOf(usa) + 1,
        keywords: usa.keywords
      }
    : null
);

// 🕒 timestamp
setLastUpdated(new Date());
    const features = [];

    data.forEach(item => {
      const coords = countryCoords[item.country];
      if (!coords) return;

      features.push({
        type: "Feature",
        properties: {
          intensity: item.score,
          country: item.country,
          rank: sorted.findIndex(i => i.country === item.country) + 1
        },
        geometry: {
          type: "Point",
          coordinates: coords
        }
      });
    });

    const source = map.getSource("points");
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features
      });
    }

  } catch (err) {
    console.error("Error fetching API:", err);
  }
};

// 🚀 call it
fetchData();
// ⏱ refresh every 10s
setInterval(fetchData, 10000);

}); // ✅ CLOSE map.on("load")

}, []); // ✅ CLOSE useEffect
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
        backdropFilter: "blur(10px)"
      }}>
        <h3>🌐 AI Search Activity</h3>
       <p style={{ color: "red" }}>VERSION 3</p>
        <p><strong>Live Requests:</strong><br/>
          {liveCount.toLocaleString()}
        </p>

        <p><strong>Top Region:</strong> {topRegion}</p>

        {mexicoData && (
          <div style={{ color: "#00ff88", marginTop: "10px" }}>
            🇲🇽 Mexico<br/>
Rank: #{mexicoData.rank}
<div style={{ fontSize: "11px", opacity: 0.7 }}>
  🔥 {mexicoData.keywords?.join(" • ")}
</div>
        )}

        {usaData && (
          <div style={{ color: "#00bfff", marginTop: "10px" }}>
            🇺🇸 USA<br/>
            Rank: #{usaData.rank}
          </div>
        )}

        import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// 🌍 coords
const countryCoords = {
  "United States": [-98, 39],
  "Mexico": [-102, 23],
  "China": [104, 35],
  "India": [78.9, 21],
  "Brazil": [-51, -10],
   "Germany": [10.4, 51],
  "France": [2.2, 46],
  "Japan": [138, 36],
  "Canada": [-106, 56],
  "Australia": [133, -25],
};

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // 📊 state
  const [topRegion, setTopRegion] = useState("Loading...");
  const [topThree, setTopThree] = useState([]);
  const [liveCount, setLiveCount] = useState(2439467);
  const [mexicoData, setMexicoData] = useState(null);
  const [usaData, setUsaData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🔢 LIVE COUNTER
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 500));
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
      projection: "globe"
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.setFog({});
    });

    map.on("load", () => {

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
          "circle-color": "#00ff88",
          "circle-opacity": 0.9
        }
      });
// 🖱 CLICK EVENT
map.on("click", "points", (e) => {
  const f = e.features[0];

  new mapboxgl.Popup()
    .setLngLat(f.geometry.coordinates)
    .setHTML(`
      <strong>${f.properties.country}</strong><br/>
      Rank: #${f.properties.rank}<br/>
      Activity: ${f.properties.intensity}
    `)
    .addTo(map);
});
      // 📊 DATA
      const fetchData = async () => {
  try {
     const res = await fetch("https://aisphere-api.onrender.com/trends");
    const data = await res.json();

    const sorted = [...data].sort((a, b) => b.score - a.score);

setTopRegion(sorted[0]?.country || "N/A");
setTopThree(sorted.slice(0, 10));

// 🇲🇽 Mexico
const mexico = sorted.find(i => i.country === "Mexico");
setMexicoData(
  mexico
    ? {
        rank: sorted.indexOf(mexico) + 1,
        keywords: mexico.keywords
      }
    : null
);

// 🇺🇸 USA
const usa = sorted.find(i => i.country === "United States");
setUsaData(
  usa
    ? {
        rank: sorted.indexOf(usa) + 1,
        keywords: usa.keywords
      }
    : null
);

// 🕒 timestamp
setLastUpdated(new Date());
    const features = [];

    data.forEach(item => {
      const coords = countryCoords[item.country];
      if (!coords) return;

      features.push({
        type: "Feature",
        properties: {
          intensity: item.score,
          country: item.country,
          rank: sorted.findIndex(i => i.country === item.country) + 1
        },
        geometry: {
          type: "Point",
          coordinates: coords
        }
      });
    });

    const source = map.getSource("points");
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features
      });
    }

  } catch (err) {
    console.error("Error fetching API:", err);
  }
};

// 🚀 call it
fetchData();
// ⏱ refresh every 10s
setInterval(fetchData, 10000);

}); // ✅ CLOSE map.on("load")

}, []); // ✅ CLOSE useEffect
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
        backdropFilter: "blur(10px)"
      }}>
        <h3 style={{ color: "red" }}>🔥 TEST VERSION 🔥</h3>

        <p><strong>Live Requests:</strong><br/>
          {liveCount.toLocaleString()}
        </p>

        <p><strong>Top Region:</strong> {topRegion}</p>

        {mexicoData && (
          <div style={{ color: "#00ff88", marginTop: "10px" }}>
            🇲🇽 Mexico<br/>
            Rank: #{mexicoData.rank}
          </div>
        )}

        {usaData && (
          <div style={{ color: "#00bfff", marginTop: "10px" }}>
            🇺🇸 USA<br/>
            Rank: #{usaData.rank}
          </div>
        )}

        <div style={{ marginTop: "15px" }}>
  <strong>Top Countries:</strong>
  {topThree.map((item, i) => (
  <div key={i} style={{ marginBottom: "8px" }}>
    <div>{i + 1}. {item.country}</div>

    {item.keywords && (
      <div style={{ fontSize: "11px", opacity: 0.7 }}>
        🔥 {item.keywords.join(" • ")}
      </div>
    )}
  </div>
))}
</div>

        <p>Status: Active</p>

        {lastUpdated && (
          <p style={{ fontSize: "12px", opacity: 0.7 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        <p style={{
  fontSize: "11px",
  opacity: 0.6,
  marginTop: "12px",
  lineHeight: "1.4"
}}>
  This reflects SEARCH interest, not actual usage.<br />
  Countries with lower scores<br />
  may still have higher real adoption.
</p>
      </div>
    </div>
  );
}

        <p>Status: Active</p>

        {lastUpdated && (
          <p style={{ fontSize: "12px", opacity: 0.7 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        <p style={{
  fontSize: "11px",
  opacity: 0.6,
  marginTop: "12px",
  lineHeight: "1.4"
}}>
  This reflects SEARCH interest, not actual usage.<br />
  Countries with lower scores<br />
  may still have higher real adoption.
</p>
      </div>
    </div>
  );
}