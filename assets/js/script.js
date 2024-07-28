// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  return `
    <div class="task card mb-2" id="${task.id}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">${dayjs(task.deadline).format('MMM D, YYYY')}</small></p>
        <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (dayjs(task.deadline).isBefore(dayjs(), 'day')) {
      $(taskCard).addClass('overdue');
    } else if (dayjs(task.deadline).diff(dayjs(), 'day') < 3) {
      $(taskCard).addClass('nearing-deadline');
    }

    $(`#${task.status}-cards`).append(taskCard);
  });

  // Make tasks draggable
  $(".task").draggable({
    revert: "invalid",
    helper: "clone",
    start: function () {
      $(this).addClass("dragging");
    },
    stop: function () {
      $(this).removeClass("dragging");
    }
  });

  // Make lanes droppable
  $(".lane .card-body").droppable({
    accept: ".task",
    hoverClass: "drop-hover",
    drop: handleDrop
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#taskTitle").val().trim();
  const description = $("#taskDescription").val().trim();
  const deadline = $("#taskDeadline").val().trim();

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: "todo"
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    renderTaskList();
    $("#formModal").modal("hide");
    $("#taskForm")[0].reset();
  } else {
    alert("Please fill in all fields.");
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).data("id");
  taskList = taskList.filter(task => task.id != taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.helper.data("id");
  const newStatus = $(this).closest(".lane").attr("id");

  taskList = taskList.map(task => {
    if (task.id == taskId) {
      task.status = newStatus;
    }
    return task;
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#taskForm").on("submit", handleAddTask);

  $(document).on("click", ".delete-task", handleDeleteTask);

  $("#taskDeadline").datepicker();
});
