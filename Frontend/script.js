
const API_URL = "https://task-manager-backend-ti5.onrender.com/todolist";
const COUNT_URL = "https://task-manager-backend-ti5.onrender.com/counters";

window.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    })
    .then(tasks => {
      task_list.innerHTML = "";
      allTasks = tasks;
      tasks.forEach(task =>
        create_task_list(task._id, task.userTask, task.status)
      );
      loadCounts();
    })
    .catch(err => console.error("Error loading tasks:", err));
}

/* ================= LOAD COUNTS ================= */

function loadCounts() {
  fetch(COUNT_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch counts");
      return res.json();
    })
    .then(data => {
      task_count.innerText =
        `Total: ${data.total} | Completed: ${data.completed} | Pending: ${data.pending}`;
    })
    .catch(err => console.error("Error loading counts:", err));
}

/* ================= ADD TASK ================= */

add_btn.addEventListener("click", function () {

  const input_task = task_input.value.trim();

  if (input_task === "") {
    alert("Please enter a task!");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userTask: input_task }),
  })
  .then(res => res.json())
  .then(newtask => {
    create_task_list(newtask._id, newtask.userTask, newtask.status);
    task_input.value = "";
    loadTasks();
  })
  .catch(err => console.error("Error adding task:", err));

});