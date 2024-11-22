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
    
        // Display task text
        const taskContent = document.createElement("span");
        taskContent.textContent = `${taskText} (Created: ${new Date(createdDate).toLocaleString()})`;
        li.appendChild(taskContent);
    
        // Calculate days since task creation
        const currentDate = new Date();
        const creationDate = new Date(createdDate);
        const daysSinceCreation = Math.floor((currentDate - creationDate) / (1000 * 60 * 60 * 24));
    
        // Set the appropriate class based on days since creation
        if (daysSinceCreation > 10) {
            li.classList.add("red"); // More than 10 days -> Red
        } else if (daysSinceCreation >= 5) {
            li.classList.add("yellow"); // Between 5 and 10 days -> Yellow
        } else {
            li.classList.add("green"); // Less than 5 days -> Green
        }
            
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
    
        // Complete button
        const completeButton = document.createElement("button");
        completeButton.textContent = "✓";
        completeButton.className = "complete-button";
    
        completeButton.addEventListener("click", () => {
            moveToCompletedList(taskText, createdDate);
            li.remove();
            updateCountersAfterTaskChange();
        });
    
        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
    
        editButton.addEventListener("click", () => {
            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.value = taskContent.textContent.replace(` (Created: ${new Date(createdDate).toLocaleString()})`, "");
    
            li.replaceChild(inputField, taskContent);
            inputField.focus();
    
            inputField.addEventListener("blur", () => {
                const updatedTaskText = inputField.value.trim();
                if (updatedTaskText) {
                    updateTask(taskText, updatedTaskText, createdDate);
                    taskContent.textContent = `${updatedTaskText} (Created: ${new Date(createdDate).toLocaleString()})`;
                    li.replaceChild(taskContent, inputField);
                } else {
                    taskContent.textContent = `${taskText} (Created: ${new Date(createdDate).toLocaleString()})`;
                    li.replaceChild(taskContent, inputField);
                }
            });
    
            inputField.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    const updatedTaskText = inputField.value.trim();
                    if (updatedTaskText) {
                        updateTask(taskText, updatedTaskText, createdDate);
                        taskContent.textContent = `${updatedTaskText} (Created: ${new Date(createdDate).toLocaleString()})`;
                        li.replaceChild(taskContent, inputField);
                    }
                }
            });
        });
    
        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
    
        deleteButton.addEventListener("click", () => {
            li.remove();
            chrome.storage.local.get("tasks", (data) => {
                const tasks = data.tasks || [];
                const updatedTasks = tasks.filter(task => task.text !== taskText);
                chrome.storage.local.set({ tasks: updatedTasks });
                updateCountersAfterTaskChange();
            });
        });
    
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(completeButton);
        buttonContainer.appendChild(deleteButton);
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
        
        // Calculate the time taken to complete the task (in days)
        const created = new Date(createdDate);
        const completed = new Date(completedDate);
        const timeDiff = completed - created;
        const daysTaken = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert from milliseconds to days
    
        // Add appropriate class based on the number of days taken to complete
        if (daysTaken > 10) {
            li.classList.add("red"); // More than 10 days
        } else if (daysTaken >= 5) {
            li.classList.add("yellow"); // Between 5 and 10 days
        } else {
            li.classList.add("green"); // Less than 5 days
        }
    
        // Create the task text to include created, completed, and days taken
        li.innerHTML = `${taskText} <p>(<font color="red">Created: ${new Date(createdDate).toLocaleString()}</font>, <font color="green">Completed: ${new Date(completedDate).toLocaleString()}</font>, <font color="darkgoldenrod">Days Taken: ${daysTaken} day(s))</font></p>`;
        
        // Append the task to the completed list
        completedList.insertBefore(li, completedList.firstChild);
    }
    
    
    function updateTask(oldTaskText, newTaskText, createdDate) {
        chrome.storage.local.get("tasks", (data) => {
            const tasks = data.tasks || [];
            const taskIndex = tasks.findIndex(task => task.text === oldTaskText);
            if (taskIndex > -1) {
                tasks[taskIndex].text = newTaskText;
                chrome.storage.local.set({ tasks }, () => {
                    // Reload the task list to reflect changes
                    loadTasks();
                });
            }
        });
    }

    function updateCounters(pendingTasks, completedTasks, totalTasks) {
        totalCount.textContent = `Total : ${totalTasks}`;
        pendingCount.textContent = `Pending : ${pendingTasks}`;
        completedCount.textContent = `Completed : ${completedTasks}`;
        //Calling function to update avg count
        setAvgTasksPerDay(totalTasks,completedTasks);
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

function setAvgTasksPerDay(totalTasks, completedTasks) {
    // Retrieve tasks from local storage
    chrome.storage.local.get("tasks", (data) => {
        const tasks = data.tasks || [];
        // Find the first completed task
        const firstCompletedTask = tasks.find(task => task.completed);

        const avgTasksElement = document.getElementById("avgTasksPerDay");

        if (firstCompletedTask) {
            const firstCompletedDate = new Date(firstCompletedTask.completedDate);
            const today = new Date();

            // Calculate the number of days between today and the first completed task date
            const timeDiff = today - firstCompletedDate;
            const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert from milliseconds to days

            // Calculate average tasks per day
            if (daysPassed > 0) {
                const avgTasksPerDay = completedTasks / daysPassed;
                avgTasksElement.textContent = `Avg Task Completion/Day: ${avgTasksPerDay.toFixed(2)}`;

                // Change the box color based on the average
                if (avgTasksPerDay < 5) {
                    avgTasksElement.style.backgroundColor = "red";
                } else if (avgTasksPerDay >= 5 && avgTasksPerDay < 10) {
                    avgTasksElement.style.backgroundColor = "yellow";
                } else {
                    avgTasksElement.style.backgroundColor = "green";
                }
            } else {
                avgTasksElement.textContent = `Avg Task Completion/Day: N/A`;
                avgTasksElement.style.backgroundColor = ""; // Reset color
            }

        } else {
            console.log('No completed tasks found.');
            avgTasksElement.textContent = `(Avg Task/Day: N/A)`;
            avgTasksElement.style.backgroundColor = ""; // Reset color
        }
    });
}


