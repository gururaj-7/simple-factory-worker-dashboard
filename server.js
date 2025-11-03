// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const app = express();

// const PORT = 3000;
// const DATA_FILE = path.join(__dirname, "workers.json");

// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// // Get all workers
// app.get("/api/workers", (req, res) => {
//   fs.readFile(DATA_FILE, "utf8", (err, data) => {
//     if (err) return res.status(500).json({ message: "Error reading file" });
//     const workers = data ? JSON.parse(data) : [];
//     res.json(workers);
//   });
// });

// // Add new worker
// app.post("/api/workers", (req, res) => {
//   const { name, salary, age } = req.body;
//   if (!name || !salary || !age)
//     return res.status(400).json({ message: "All fields required" });

//   fs.readFile(DATA_FILE, "utf8", (err, data) => {
//     let workers = data ? JSON.parse(data) : [];
//     const newWorker = { id: Date.now(), name, salary, age };
//     workers.push(newWorker);

//     fs.writeFile(DATA_FILE, JSON.stringify(workers, null, 2), (err) => {
//       if (err) return res.status(500).json({ message: "Error saving worker" });
//       res.status(201).json(newWorker);
//     });
//   });
// });

// // Delete a worker
// app.delete("/api/workers/:id", (req, res) => {
//   const id = Number(req.params.id);

//   fs.readFile(DATA_FILE, "utf8", (err, data) => {
//     if (err) return res.status(500).json({ message: "Error reading file" });
//     let workers = data ? JSON.parse(data) : [];
//     workers = workers.filter((w) => w.id !== id);

//     fs.writeFile(DATA_FILE, JSON.stringify(workers, null, 2), (err) => {
//       if (err) return res.status(500).json({ message: "Error deleting worker" });
//       res.json({ message: "Worker deleted successfully" });
//     });
//   });
// });

// app.listen(PORT, () =>
//   console.log(`✅ Server running on http://localhost:${PORT}`)
// );


// server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== MONGODB CONNECTION =====
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== DEFINE SCHEMA & MODEL =====
const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  salary: { type: Number, required: true },
  age: { type: Number, required: true },
});

const Worker = mongoose.model("Worker", workerSchema);

// ===== API ROUTES =====

// 📥 Get all workers
app.get("/api/workers", async (req, res) => {
  try {
    const workers = await Worker.find().sort({ _id: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workers", error });
  }
});

// ➕ Add new worker
app.post("/api/workers", async (req, res) => {
  try {
    const { name, salary, age } = req.body;
    if (!name || !salary || !age)
      return res.status(400).json({ message: "All fields are required" });

    const newWorker = new Worker({ name, salary, age });
    await newWorker.save();
    res.status(201).json(newWorker);
  } catch (error) {
    res.status(500).json({ message: "Error adding worker", error });
  }
});

// ❌ Delete worker by ID
app.delete("/api/workers/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker)
      return res.status(404).json({ message: "Worker not found" });
    res.json({ message: "Worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting worker", error });
  }
});

// ===== START SERVER =====
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
