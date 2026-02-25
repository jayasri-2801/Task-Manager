const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect("mongodb+srv://Jayasri:Jayasri2816@cluster0.3ku3lfd.mongodb.net/todolist?appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= MODELS ================= */

const todoSchema = new mongoose.Schema({
  userTask: String,
  status: { type: Boolean, default: false }
});

const counterSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  completed: { type: Number, default: 0 }
});

const Todo = mongoose.model("Todo", todoSchema);
const Counter = mongoose.model("Counter", counterSchema);

/* ================= INIT COUNTER ================= */

async function initCounter() {
  const count = await Counter.findOne();
  if (!count) {
    await Counter.create({ total: 0, completed: 0 });
  }
}
initCounter();

/* ================= ROUTES ================= */

// Root route (prevents 404 error)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

/* ===== GET ALL TASKS ===== */
app.get("/todolist", async (req, res) => {
  const tasks = await Todo.find();
  res.json(tasks);
});

/* ===== ADD TASK ===== */
app.post("/todolist", async (req, res) => {
  const task = await Todo.create({ userTask: req.body.userTask });

  const counter = await Counter.findOne();
  counter.total += 1;
  await counter.save();

  res.json(task);
});

/* ===== UPDATE TASK ===== */
app.put("/todolist/:id", async (req, res) => {
  const task = await Todo.findById(req.params.id);
  const counter = await Counter.findOne();

  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.body.status !== undefined) {
    if (!task.status && req.body.status) counter.completed += 1;
    if (task.status && !req.body.status) counter.completed -= 1;
    task.status = req.body.status;
  }

  if (req.body.userTask) {
    task.userTask = req.body.userTask;
  }

  await task.save();
  await counter.save();

  res.json(task);
});

/* ===== DELETE TASK ===== */
app.delete("/todolist/:id", async (req, res) => {
  const task = await Todo.findById(req.params.id);
  const counter = await Counter.findOne();

  if (!task) return res.status(404).json({ message: "Task not found" });

  counter.total -= 1;
  if (task.status) counter.completed -= 1;

  await counter.save();
  await Todo.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted Successfully" });
});

/* ===== GET COUNTS ===== */
app.get("/counts", async (req, res) => {
  const counter = await Counter.findOne();

  res.json({
    total: counter.total,
    completed: counter.completed,
    pending: counter.total - counter.completed
  });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});