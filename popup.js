document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const completedList = document.getElementById("completedList");
    const dueTab = document.getElementById("dueTab");
    const completedTab = document.getElementById("completedTab");
    const dueSearch = document.getElementById("dueSearch");
    const completedSearch = document.getElementById("completedSearch");

    // Task counters
    const totalCount = document.getElementById("totalCount");
    const pendingCount = document.getElementById("pendingCount");
    const completedCount = document.getElementById("completedCount");

    // Load tasks from local storage
    loadTasks();

    addTaskButton.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            saveTask(taskText);
            taskInput.value = "";
        }
    });

    dueTab.addEventListener("click", () => {
        document.getElementById("taskListContainer").style.display = "block";
        document.getElementById("completedListContainer").style.display = "none";
        dueTab.classList.add("active");
        completedTab.classList.remove("active");
    });

    completedTab.addEventListener("click", () => {
        document.getElementById("taskListContainer").style.display = "none";
        document.getElementById("completedListContainer").style.display = "block";
        completedTab.classList.add("active");
        dueTab.classList.remove("active");
    });

    dueSearch.addEventListener("input", () => {
        filterTasks(taskList, dueSearch.value);
    });

    completedSearch.addEventListener("input", () => {
        filterTasks(completedList, completedSearch.value);
    });

    function filterTasks(list, query) {
        const items = list.getElementsByTagName("li");
        Array.from(items).forEach(item => {
            if (item.textContent.toLowerCase().includes(query.toLowerCase())) {
                item.style.display = "list-item";
            } else {
                item.style.display = "none";
            }
        });
    }

    function loadTasks() {
        chrome.storage.local.get("tasks", (data) => {
            let pendingTasks = 0;
            let completedTasks = 0;

            if (data.tasks) {
                data.tasks.forEach((task) => {
                    if (task.completed) {
                        addTaskToCompletedList(task.text, task.createdDate, task.completedDate);
                        completedTasks++;
                    } else {
                        addTaskToList(task.text, task.createdDate);
                        pendingTasks++;
                    }
                });
            }

            updateCounters(pendingTasks, completedTasks, pendingTasks + completedTasks);
        });
    }

    function saveTask(taskText) {
        const createdDate = new Date().toISOString();
        chrome.storage.local.get("tasks", (data) => {
            const tasks = data.tasks || [];
            tasks.push({ text: taskText, createdDate: createdDate, completed: false });
            chrome.storage.local.set({ tasks });
            addTaskToList(taskText, createdDate);
            updateCounters(tasks.filter(task => !task.completed).length, tasks.filter(task => task.completed).length, tasks.length);
        });
    }

    function addTaskToList(taskText, createdDate) {
        const li = document.createElement("li");
        li.textContent = `${taskText} (Created: ${new Date(createdDate).toLocaleString()})`;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const completeButton = document.createElement("button");
        completeButton.textContent = "✓";
        completeButton.className = "complete-button";

        completeButton.addEventListener("click", () => {
            moveToCompletedList(taskText, createdDate);
            li.remove();
            updateCountersAfterTaskChange();
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {
            const newTaskText = prompt("Edit your task:", taskText);
            if (newTaskText !== null && newTaskText.trim()) {
                updateTask(taskText, newTaskText, createdDate);
                li.firstChild.nodeValue = `${newTaskText} (Created: ${new Date(createdDate).toLocaleString()})`;
                taskText = newTaskText;
            }
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(completeButton);
        li.appendChild(buttonContainer);
        taskList.insertBefore(li, taskList.firstChild);
    }

    function moveToCompletedList(taskText, createdDate) {
        const completedDate = new Date().toISOString();
        addTaskToCompletedList(taskText, createdDate, completedDate);
        chrome.storage.local.get("tasks", (data) => {
            const tasks = data.tasks || [];
            const taskIndex = tasks.findIndex(task => task.text === taskText);
            if (taskIndex > -1) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = completedDate;
                chrome.storage.local.set({ tasks });
                updateCountersAfterTaskChange();
            }
        });
    }

    function addTaskToCompletedList(taskText, createdDate, completedDate) {
        const li = document.createElement("li");
        li.textContent = `${taskText} (Created: ${new Date(createdDate).toLocaleString()}, Completed: ${new Date(completedDate).toLocaleString()})`;
        completedList.insertBefore(li, completedList.firstChild);
    }

    function updateTask(oldTaskText, newTaskText, createdDate) {
        chrome.storage.local.get("tasks", (data) => {
            const tasks = data.tasks || [];
            const taskIndex = tasks.findIndex(task => task.text === oldTaskText);
            if (taskIndex > -1) {
                tasks[taskIndex].text = newTaskText;
                chrome.storage.local.set({ tasks });
            }
        });
    }

    function updateCounters(pendingTasks, completedTasks, totalTasks) {
        totalCount.textContent = `Total : ${totalTasks}`;
        pendingCount.textContent = `Pending : ${pendingTasks}`;
        completedCount.textContent = `Completed : ${completedTasks}`;
    }

    function updateCountersAfterTaskChange() {
        chrome.storage.local.get("tasks", (data) => {
            const tasks = data.tasks || [];
            const pendingTasks = tasks.filter(task => !task.completed).length;
            const completedTasks = tasks.filter(task => task.completed).length;
            updateCounters(pendingTasks, completedTasks, tasks.length);
        });
    }
});
