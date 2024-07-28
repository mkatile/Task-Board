document.addEventListener('DOMContentLoaded', () => {
    const taskBoard = document.getElementById('taskBoard');
    const newTaskButton = document.getElementById('newTaskButton');
    const newTaskModal = document.getElementById('newTaskModal');
    const closeButton = document.querySelector('.close-button');
    const newTaskForm = document.getElementById('newTaskForm');
  
    // Load tasks from localStorage and display them
    const tasks = Storage.getTasks();
    tasks.forEach(task => displayTask(task));
  
    // Event Listeners
    newTaskButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
    newTaskForm.addEventListener('submit', addTask);
  
    // Modal Functions
    function openModal() {
      newTaskModal.style.display = 'block';
    }
  
    function closeModal() {
      newTaskModal.style.display = 'none';
    }
  
    function outsideClick(e) {
      if (e.target == newTaskModal) {
        newTaskModal.style.display = 'none';
      }
    }
  
    // Add Task
    function addTask(e) {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const deadline = document.getElementById('deadline').value;
      const task = { title, description, deadline, state: 'Not Yet Started' };
  
      tasks.push(task);
      Storage.saveTasks(tasks);
  
      displayTask(task);
      newTaskForm.reset();
      closeModal();
    }
  
    // Display Task
    function displayTask(task) {
      const column = document.querySelector(`.column[data-state="${task.state}"] .tasks`);
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      taskElement.draggable = true;
      taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Deadline: ${dayjs(task.deadline).format('MMMM D, YYYY')}</p>
        <button class="delete-task">Delete</button>
      `;
  
      const deadlineDate = dayjs(task.deadline);
      const today = dayjs();
      if (deadlineDate.isBefore(today, 'day')) {
        taskElement.classList.add('overdue');
      } else if (deadlineDate.diff(today, 'day') <= 2) {
        taskElement.classList.add('nearing-deadline');
      }
  
      column.appendChild(taskElement);
  
      // Delete Task
      taskElement.querySelector('.delete-task').addEventListener('click', () => {
        const index = tasks.findIndex(t => t.title === task.title && t.description === task.description && t.deadline === task.deadline);
        tasks.splice(index, 1);
        Storage.saveTasks(tasks);
        taskElement.remove();
      });
  
      // Drag and Drop
      taskElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(task));
      });
    }
  
    // Drag and Drop Columns
    const columns = document.querySelectorAll('.column .tasks');
    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
  
      column.addEventListener('drop', (e) => {
        const taskData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const taskIndex = tasks.findIndex(t => t.title === taskData.title && t.description === taskData.description && t.deadline === taskData.deadline);
        if (taskIndex !== -1) {
          tasks[taskIndex].state = column.parentElement.getAttribute('data-state');
          Storage.saveTasks(tasks);
          column.appendChild(document.querySelector(`.task:contains(${taskData.title})`));
        }
      });
    });
  });

  