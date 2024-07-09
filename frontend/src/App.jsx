import process from "process";
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [checkBrowserSupport, setCheckBrowserSupport] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_APP_API_URL);

    socket.on("connect", (data) => {
      console.log("connected");
    });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          };

          socket.emit("get-location", coordinates);
          setUserLocation({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          });
        },
        (err) => {
          console.log(err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    } else {
      setCheckBrowserSupport(false);
    }

    socket.on("location-update", (data) => {
      const marker = data;

      setMarkers([...data]);

      console.log(marker);
    });

    // Cleanup the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {checkBrowserSupport ? (
        userLocation ? (
          <MapContainer
            center={
              userLocation
                ? [userLocation.latitude, userLocation.longitude]
                : [0, 0]
            }
            zoom={16}
            style={{ height: "50vh", width: "50vw" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.latitude, marker.longitude]}
                draggable
              >
                <Popup>Marker {marker.id}</Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <p>Getting GEO Location</p>
        )
      ) : (
        <h1>Your Browse Does Not Support GEO Location</h1>
      )}

      <div className="card">
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
