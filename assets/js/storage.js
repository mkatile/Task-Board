const Storage = (() => {
    const getTasks = () => {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return tasks;
    };
  
    const saveTasks = (tasks) => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    };
  
    return {
      getTasks,
      saveTasks
    };
  })();

  