import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";

const app = express();
const server = createServer(app);

app.use(express.json());

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: process.env.URI, // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});

let markers = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle location update event
  socket.on("get-location", (data) => {
    const { latitude, longitude } = data;
    const existingMarkerIndex = markers.findIndex(
      (marker) => marker.id === socket.id
    );

    if (existingMarkerIndex !== -1) {
      // Update existing marker
      markers[existingMarkerIndex].latitude = latitude;
      markers[existingMarkerIndex].longitude = longitude;
    } else {
      // Add new marker
      markers.push({
        id: socket.id,
        latitude,
        longitude,
      });
    }
    console.log(markers);
    io.emit("location-update", markers);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    markers = markers.filter((marker) => marker.id !== socket.id);
    // Broadcast updated markers to all clients
    io.emit("location-update", markers);
  });
});

app.get("/", (req, res) => {
  res.json({ data: "hi" });
});

server.listen(3000, () => {
  console.log("app is running on port " + 3000);
});
