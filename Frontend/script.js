const API_URL = "http://localhost:5000/todolist";
const COUNT_URL = "http://localhost:5000/counts";

const task_input = document.getElementById("taskInput");
const add_btn = document.getElementById("addBtn");
const task_list = document.getElementById("taskList");
const task_count = document.getElementById("taskCount");

const allBtn = document.getElementById("allBtn");
const completedBtn = document.getElementById("completedBtn");
const pendingBtn = document.getElementById("pendingBtn");

let allTasks = [];


window.addEventListener("DOMContentLoaded", function () {
  loadTasks();
});

function loadTasks() {
  fetch(API_URL)
    .then(res => res.json())
    .then(tasks => {
      task_list.innerHTML = "";
      allTasks = tasks;
      tasks.forEach(task => {
        create_task_list(task._id, task.userTask, task.status);
      });
      loadCounts();
    });
}

function loadCounts() {
  fetch(COUNT_URL)
    .then(res => res.json())
    .then(data => {
      task_count.innerText =
        `Total: ${data.total} | Completed: ${data.completed} | Pending: ${data.pending}`;
    });
}


add_btn.addEventListener("click", function () {

  const input_task = task_input.value.trim();

  if (input_task === "") {
    alert("Please enter a task");
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
    loadCounts();
  });

});


function create_task_list(task_id, task_text_db, task_status) {

  const list_item = document.createElement("li");

  const complete_btn = document.createElement("button");
  complete_btn.className = "comp-btn";

  const task_text = document.createElement("span");
  task_text.className = "tasktext";
  task_text.textContent = task_text_db;

  const edit_btn = document.createElement("button");
  edit_btn.className = "edit-btn";
  edit_btn.textContent = "Edit";

  const delete_btn = document.createElement("button");
  delete_btn.className = "dlt-btn";
  delete_btn.textContent = "Delete";

  if (task_status === true) {
    complete_btn.textContent = "✔";
    complete_btn.classList.add("marked");
    task_text.classList.add("taskcomp");
  }

  complete_btn.addEventListener("click", function () {

    let finished = complete_btn.textContent === "✔";

    fetch(API_URL + "/" + task_id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !finished })
    })
    .then(() => {

      complete_btn.classList.toggle("marked");
      task_text.classList.toggle("taskcomp");

      if (finished) {
        complete_btn.textContent = "";
      } else {
        complete_btn.textContent = "✔";
      }

      loadCounts();
    });

  });


  edit_btn.addEventListener("click", function () {

    const newText = prompt("Edit your task:", task_text_db);
    if (!newText) return;

    fetch(API_URL + "/" + task_id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userTask: newText })
    })
    .then(() => {
      task_text.textContent = newText;
    });

  });



  delete_btn.addEventListener("click", function () {

    fetch(API_URL + "/" + task_id, {
      method: "DELETE"
    })
    .then(() => {
      task_list.removeChild(list_item);
      loadCounts();
    });

  });


  list_item.appendChild(complete_btn);
  list_item.appendChild(task_text);
  list_item.appendChild(edit_btn);
  list_item.appendChild(delete_btn);

  task_list.appendChild(list_item);
}


allBtn.addEventListener("click", function () {
  task_list.innerHTML = "";
  allTasks.forEach(task =>
    create_task_list(task._id, task.userTask, task.status)
  );
});

completedBtn.addEventListener("click", function () {
  task_list.innerHTML = "";
  allTasks
    .filter(task => task.status === true)
    .forEach(task =>
      create_task_list(task._id, task.userTask, task.status)
    );
});

pendingBtn.addEventListener("click", function () {
  task_list.innerHTML = "";
  allTasks
    .filter(task => task.status === false)
    .forEach(task =>
      create_task_list(task._id, task.userTask, task.status)
    );
});