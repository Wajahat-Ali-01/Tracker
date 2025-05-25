// Connect to the Socket.IO server
const socket = io();

// Check if geolocation is supported
if (navigator.geolocation) {
  // Start watching the user's position
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Send user's location to server
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Initialize the Leaflet map with a default view
let map = L.map("map").setView([0, 0], 16);

// Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png", {
  attribution: "Usman Ali",
}).addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 100);

// Store markers for each user by their socket ID
const markers = {};

// Listen for location updates from other users
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  if (markers[id]) {
    // Update existing marker position
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // Create a new marker
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }

  // Center map on current user's location
  if (id === socket.id) {
    map.setView([latitude, longitude]);
  }
});

// Remove marker when a user disconnects
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
