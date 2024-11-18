<p align="center">
    <img src="https://raw.githubusercontent.com/arunwebber/simple-todo/refs/heads/main/images/icon_128.png" alt="To-Do Chrome Extension Logo" />
</p>

# To-Do Chrome Extension

A simple and intuitive Chrome extension to help you manage tasks effectively. With this extension, you can easily add, complete, and edit tasks. You can also track your task completion rate over time.

## Features

- **Add Tasks**: Quickly add new tasks to your to-do list.
- **Edit Tasks**: Directly edit tasks in the UI without using prompts.
- **Complete Tasks**: Mark tasks as completed and move them to a separate list.
- **View Task Information**: See the creation date and completion date for each task.
- **Average Task Completion Rate**: Track your average task completion per day.
- **Search Tasks**: Search through due and completed tasks using the search bar.
- **Data Persistence**: All tasks are saved locally, even after you close the browser.

## Installation

1. **Clone this repository:**

2. **Navigate to the Chrome Extensions page:**

   - Open Chrome and go to `chrome://extensions/`.
   - Enable **Developer mode** in the top right.
   - Click on **Load unpacked**.
   - Select the folder where the extension files are located.

3. **Once installed**, you should see the To-Do extension icon in the Chrome toolbar. Click on it to open the extension.

## Usage

### Adding a Task:
1. Open the extension by clicking its icon in the Chrome toolbar.
2. Enter a task in the input field and click the **Add Task** button.
3. Your task will be added to the "Due" list.

### Editing a Task:
1. Click the **Edit** button next to the task you want to edit.
2. The task text will become editable.
3. Modify the text and click outside the input field or press **Enter** to save the changes.

### Completing a Task:
1. Click the **✓** button next to the task you want to complete.
2. The task will be moved to the **Completed** list.

### Searching Tasks:
- You can search for tasks in both the "Due" and "Completed" lists using the search bars at the top of each tab.

### Viewing Task Information:
- Each task displays its creation date, and completed tasks also show their completion date and how many days it took to complete.

### Tracking Task Completion:
- The extension tracks your average task completion rate per day, which is updated every time a task is completed.

## How It Works

- **Storage**: Tasks are stored locally using Chrome’s `chrome.storage.local` API.
- **Task Structure**: Each task has the following properties:
  - `text`: The task description.
  - `createdDate`: The date and time the task was created.
  - `completed`: A boolean indicating whether the task is completed.
  - `completedDate`: The date and time the task was completed (only for completed tasks).
  
- **Counters**: The extension keeps track of three counters:
  - **Total Tasks**: The total number of tasks (completed + pending).
  - **Pending Tasks**: The number of tasks that are not yet completed.
  - **Completed Tasks**: The number of tasks that are marked as completed.
  
- **Average Task Completion**: The extension calculates the average number of tasks completed per day based on the first completed task and the current date.

## Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript**
- **Chrome Extensions API**
- **Local Storage (chrome.storage.local)**

## Contributing

1. **Fork the repository** to your own GitHub account.
2. **Clone** your fork to your local machine.
3. Make changes and submit a **pull request** with a description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

### Optional Section for Better Customization:
If you want to customize the extension’s appearance or functionality, you can modify the `popup.html` and `popup.css` files to adjust the layout and design. The JavaScript file (`popup.js`) contains all the functionality, including the task management and data persistence logic.
