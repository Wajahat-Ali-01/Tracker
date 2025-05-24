const express = require("express");
const app = express();

const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

// Set view engine and static files
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Socket.io logic
io.on("connection", function (socket) {
  socket.on("send-location", function (data) {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    io.emit("user-diconnected", socket.id);
  });
});

// Main route
app.get("/", function (req, res) {
  res.render("index");
});

// Start server

const PORT = process.env.PORT || 3000;
server.listen(PORT);
