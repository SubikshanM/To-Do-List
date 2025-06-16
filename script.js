let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDateTime(datetime) {
  const date = new Date(datetime);
  return date.toLocaleString();
}

function addTask() {
  const input = document.getElementById("taskInput");
  const startInput = document.getElementById("startInput");
  const deadlineInput = document.getElementById("deadlineInput");

  const text = input.value.trim();
  const start = startInput.value;
  const deadline = deadlineInput.value;

  if (!text || !start || !deadline) {
    alert("Please fill in all fields.");
    return;
  }

  tasks.push({
    text,
    start,
    deadline,
    completed: false
  });

  input.value = "";
  startInput.value = "";
  deadlineInput.value = "";

  saveTasks();
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task" + (task.completed ? " completed" : "");

    const taskText = document.createElement("p");
    taskText.innerHTML = `<span class="label">Task:</span> ${task.text}`;

    const startText = document.createElement("p");
    startText.innerHTML = `<span class="label">Start:</span> ${formatDateTime(task.start)}`;

    const deadlineText = document.createElement("p");
    deadlineText.innerHTML = `<span class="label">Deadline:</span> ${formatDateTime(task.deadline)}`;

    const startCountdown = document.createElement("p");
    startCountdown.id = `start-countdown-${index}`;
    startCountdown.className = "countdown";

    const deadlineCountdown = document.createElement("p");
    deadlineCountdown.id = `deadline-countdown-${index}`;
    deadlineCountdown.className = "countdown";

    const taskActions = document.createElement("div");
    taskActions.className = "btn-group";

    if (!task.completed) {
      const completeBtn = document.createElement("button");
      completeBtn.textContent = "Mark As Completed";
      completeBtn.onclick = () => markCompleted(index);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑 Delete";
      deleteBtn.onclick = () => deleteTask(index);

      taskActions.appendChild(completeBtn);
      taskActions.appendChild(deleteBtn);
    } else {
      const undoBtn = document.createElement("button");
      undoBtn.textContent = "Undo";
      undoBtn.onclick = () => undoCompleted(index);
      taskActions.appendChild(undoBtn);
    }

    taskDiv.appendChild(taskText);
    taskDiv.appendChild(startText);
    taskDiv.appendChild(deadlineText);
    taskDiv.appendChild(startCountdown);
    taskDiv.appendChild(deadlineCountdown);
    taskDiv.appendChild(taskActions);
    taskList.appendChild(taskDiv);

    if (!task.completed) {
      updateCountdown(index, task.start, task.deadline);
    }
  });
}

const countdownIntervals = {};

function updateCountdown(index, startTime, deadline) {
  const startEl = document.getElementById(`start-countdown-${index}`);
  const deadlineEl = document.getElementById(`deadline-countdown-${index}`);

  if (countdownIntervals[index]) clearInterval(countdownIntervals[index]);

  countdownIntervals[index] = setInterval(() => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(deadline);

    if (now >= end) {
      if (startEl) startEl.style.display = "none";
      if (deadlineEl) {
        deadlineEl.innerText = "⏰ Deadline passed!";
        deadlineEl.style.color = "#e53935";
      }
      clearInterval(countdownIntervals[index]);
      return;
    }

    if (now < start) {
      const diff = start - now;
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (startEl) {
        startEl.innerText = `🕒 Event starts in: ${hrs}h ${mins}m ${secs}s`;
        startEl.style.color = "#007bff";
        startEl.style.display = "block";
      }
      if (deadlineEl) deadlineEl.style.display = "none";
    } else {
      if (startEl) startEl.style.display = "none";
      const diff = end - now;
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (deadlineEl) {
        deadlineEl.innerText = `⏳ Time left: ${hrs}h ${mins}m ${secs}s`;
        deadlineEl.style.color = "#e53935";
        deadlineEl.style.display = "block";
      }
    }
  }, 1000);
}

function markCompleted(index) {
  tasks[index].completed = true;
  saveTasks();
  clearInterval(countdownIntervals[index]);
  renderTasks();
}

function undoCompleted(index) {
  tasks[index].completed = false;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  clearInterval(countdownIntervals[index]);
  renderTasks();
}

function exportToExcel() {
  const data = tasks.map(task => ({
    Task: task.text,
    Start: formatDateTime(task.start),
    Deadline: formatDateTime(task.deadline),
    Completed: task.completed ? "Yes" : "No"
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  XLSX.writeFile(workbook, "todo_tasks.xlsx");
}

renderTasks();
