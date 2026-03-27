import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRef } from "react";
import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState([]);
  const [topRegion, setTopRegion] = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://aisphere-api.onrender.com/trends");
        const json = await res.json();

        console.log("DATA:", json);

        setData(json.slice(0, 10));
        setTopRegion(json[0]?.country || "N/A");

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🌐 AI Search Activity</h1>

      <h3>Top Region: {topRegion}</h3>

      <h2>Top Countries:</h2>

      {data.map((item, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{i + 1}. {item.country}</strong>
          <div style={{ fontSize: "12px", color: "#555" }}>
            {(item.keywords || []).join(" • ")}
          </div>
        </div>
      ))}
    </div>
  );
}