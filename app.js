// Import required modules
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const io = socketio(server); // Attach Socket.IO to the server

// Set view engine to EJS and define static files directory
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Store users and their locations
const users = {};

// Listen for new socket connections
io.on("connection", function (socket) {
  console.log("User connected:", socket.id);

  // Send all existing user locations to the newly connected user
  Object.keys(users).forEach((id) => {
    socket.emit("receive-location", {
      id: id,
      ...users[id],
    });
  });

  // Listen for a user's location and broadcast it to all users
  socket.on("send-location", function (data) {
    users[socket.id] = data; // Save/update user's location
    io.emit("receive-location", { id: socket.id, ...data }); // Broadcast to all
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    delete users[socket.id]; // Remove user from the list
    io.emit("user-diconnected", socket.id); // Notify others
  });
});

// Define the main route
app.get("/", function (req, res) {
  res.render("index"); // Render the index.ejs file
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
