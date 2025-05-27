const express = require("express");

const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const io = socketio(server); // Attach Socket.IO to the server

// Set view engine and static files
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};


io.on("connection", function (socket) {

  if (Object.keys(users).length >= 2) {
    socket.emit("error-message", "Maximum users connected. Try again later.");
    socket.disconnect(true); // Disconnect the new user
    return;
  }

  // Send all existing user locations to the newly connected user
  Object.keys(users).forEach((id) => {
    socket.emit("receive-location", {
      id: id,
      ...users[id],
    });
  });

  socket.on("send-location", function (data) {
    users[socket.id] = data; // Save/update user's location
    io.emit("receive-location", { id: socket.id, ...data }); // Broadcast to all
  });

  socket.on("disconnect", () => {
    delete users[socket.id]; // Remove user from the list
    io.emit("user-disconnected", socket.id); // Notify others
  });
});

// Main route
app.get("/", function (req, res) {
  res.render("index");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});