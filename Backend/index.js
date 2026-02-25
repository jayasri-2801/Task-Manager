const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Todo = require("./models/Todo");
const Counter = require("./models/Counters");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/todolist")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= INIT COUNTER ================= */

async function initCounter() {
  const count = await Counter.findOne();
  if (!count) {
    await Counter.create({ total: 0, completed: 0 });
  }
}
initCounter();

/* ================= GET ALL TASKS ================= */

app.get("/todolist", async (req, res) => {
  const tasks = await Todo.find();
  res.json(tasks);
});

/* ================= ADD TASK ================= */

app.post("/todolist", async (req, res) => {
  const newTask = await Todo.create({
    userTask: req.body.userTask
  });

  const counter = await Counter.findOne();
  counter.total += 1;
  await counter.save();

  res.json(newTask);
});

/* ================= UPDATE TASK ================= */

app.put("/todolist/:id", async (req, res) => {

  const task = await Todo.findById(req.params.id);
  const counter = await Counter.findOne();

  if (req.body.status !== undefined) {
    if (!task.status && req.body.status === true) {
      counter.completed += 1;
    }
    if (task.status && req.body.status === false) {
      counter.completed -= 1;
    }
    task.status = req.body.status;
  }

  if (req.body.userTask) {
    task.userTask = req.body.userTask;
  }

  await task.save();
  await counter.save();

  res.json(task);
});

/* ================= DELETE TASK ================= */

app.delete("/todolist/:id", async (req, res) => {

  const task = await Todo.findById(req.params.id);
  const counter = await Counter.findOne();

  counter.total -= 1;
  if (task.status) counter.completed -= 1;

  await Counter.updateOne({}, counter);
  await Todo.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted Successfully" });
});

/* ================= COUNTS ================= */

app.get("/counts", async (req, res) => {
  const counter = await Counter.findOne();
  const pending = counter.total - counter.completed;

  res.json({
    total: counter.total,
    completed: counter.completed,
    pending: pending
  });
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});