// DOM Elements
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
const clearBtn = document.querySelector('.clear-btn');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');

// Stats elements
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

// Todo data structure
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    updateStats();
    showEmptyState();
    filterTodos(); // Apply initial filter
    
    // Test toast on page load to ensure it's working
    setTimeout(() => {
        showToast('Welcome to Smart Todo List!', 'info');
    }, 1000);
});

todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTodoActions);
filterOption.addEventListener('change', filterTodos);
clearBtn.addEventListener('click', clearAllTodos);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === todoInput) {
        addTodo(e);
    }
    if (e.key === 'Escape') {
        todoInput.blur();
    }
});

// Main Functions
function addTodo(e) {
    e.preventDefault();
    
    const todoText = todoInput.value.trim();
    
    if (!todoText) {
        showToast('Please enter a task!', 'error');
        return;
    }
    
    if (todoText.length > 100) {
        showToast('Task is too long! (max 100 characters)', 'error');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    createTodoElement(newTodo);
    updateStats();
    showEmptyState();
    filterTodos(); // Apply current filter to new todo
    
    todoInput.value = '';
    todoInput.focus();
    
    showToast('Task added successfully!', 'success');
}

function createTodoElement(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    todoDiv.dataset.id = todo.id;
    
    if (todo.completed) {
        todoDiv.classList.add('completed');
    }
    
    todoDiv.innerHTML = `
        <span class="todo-item">${escapeHtml(todo.text)}</span>
        <div class="todo-buttons">
            <button class="complete-btn" aria-label="Mark as complete">
                <i class="fas fa-check"></i>
            </button>
            <button class="trash-btn" aria-label="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    todoList.appendChild(todoDiv);
}

function handleTodoActions(e) {
    const item = e.target;
    const todoDiv = item.closest('.todo');
    
    if (!todoDiv) return;
    
    const todoId = parseInt(todoDiv.dataset.id);
    const todo = todos.find(t => t.id === todoId);
    
    if (!todo) return;
    
    // Complete button
    if (item.closest('.complete-btn')) {
        toggleComplete(todo, todoDiv);
    }
    
    // Delete button
    if (item.closest('.trash-btn')) {
        deleteTodo(todo, todoDiv);
    }
}

function toggleComplete(todo, todoDiv) {
    todo.completed = !todo.completed;
    
    if (todo.completed) {
        todoDiv.classList.add('completed');
        showToast('Task completed!', 'success');
    } else {
        todoDiv.classList.remove('completed');
        showToast('Task marked as pending', 'info');
    }
    
    saveTodos();
    updateStats();
    filterTodos(); // Re-apply current filter
}

function deleteTodo(todo, todoDiv) {
    todoDiv.classList.add('fall');
    todoDiv.addEventListener('animationend', () => {
        todoDiv.remove(); // Remove the element from the DOM after animation
        todos = todos.filter(t => t.id !== todo.id);
        saveTodos();
        updateStats();
        showEmptyState();
        filterTodos(); // Re-apply filter after deletion
        showToast('Task deleted!', 'info');
        updateContainerState();
    }, { once: true }); // Only run once
}

function filterTodos() {
    const filterValue = filterOption.value;
    const todoElements = todoList.querySelectorAll('.todo');
    let visibleCount = 0;
    
    console.log('Filtering todos:', filterValue, 'Total todos:', todoElements.length);
    
    todoElements.forEach(todoEl => {
        const isCompleted = todoEl.classList.contains('completed');
        let shouldShow = false;
        
        switch (filterValue) {
            case 'all':
                shouldShow = true;
                break;
            case 'completed':
                shouldShow = isCompleted;
                break;
            case 'uncompleted':
                shouldShow = !isCompleted;
                break;
            default:
                shouldShow = true;
        }
        
        if (shouldShow) {
            todoEl.style.display = 'flex';
            visibleCount++;
        } else {
            todoEl.style.display = 'none';
        }
    });
    
    console.log('Visible todos:', visibleCount);
    
    // Show empty state if no todos match the current filter
    if (visibleCount === 0 && todos.length > 0) {
        emptyState.classList.add('show');
        emptyState.innerHTML = `
            <i class="fas fa-filter"></i>
            <p>No ${filterValue} tasks found</p>
        `;
    } else {
        emptyState.classList.remove('show');
    }
}

function clearAllTodos() {
    if (todos.length === 0) {
        showToast('No tasks to clear!', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
        todos = [];
        saveTodos();
        todoList.innerHTML = '';
        updateStats();
        showEmptyState();
        updateContainerState();
        showToast('All tasks cleared!', 'success');
    }
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function showEmptyState() {
    if (todos.length === 0) {
        emptyState.classList.add('show');
        todoList.style.display = 'none';
        updateContainerState();
    } else {
        emptyState.classList.remove('show');
        todoList.style.display = 'block';
        updateContainerState();
    }
}

function loadTodos() {
    todos.forEach(todo => {
        createTodoElement(todo);
    });
    filterTodos(); // Apply filter after loading todos
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Utility Functions
function showToast(message, type = 'info') {
    console.log('Showing toast:', message, type); // Debug log
    
    // Clear any existing toast
    toast.classList.remove('show', 'hide', 'success', 'error', 'info');
    
    // Set the message and type
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Force a reflow to ensure the element is properly reset
    toast.offsetHeight;
    
    // Show the toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.classList.remove('show', 'hide');
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-save functionality
let saveTimeout;
function debouncedSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveTodos();
    }, 1000);
}

// Add some sample todos for first-time users
if (todos.length === 0 && !localStorage.getItem('hasUsedApp')) {
    const sampleTodos = [
        { id: Date.now(), text: 'Welcome to your todo list!', completed: false, createdAt: new Date().toISOString() },
        { id: Date.now() + 1, text: 'Click the checkmark to complete tasks', completed: false, createdAt: new Date().toISOString() },
        { id: Date.now() + 2, text: 'Use the filter to view different task states', completed: false, createdAt: new Date().toISOString() }
    ];
    
    todos = sampleTodos;
    localStorage.setItem('hasUsedApp', 'true');
    saveTodos();
    loadTodos();
    updateStats();
    showEmptyState();
}

function updateContainerState() {
    const todoContainer = document.querySelector('.todo-container');
    const todoList = document.querySelector('.todo-list');
    
    if (todos.length === 0) {
        todoContainer.style.minHeight = '0';
        todoContainer.style.padding = '0';
    } else {
        todoContainer.style.minHeight = 'auto';
        todoContainer.style.padding = '';
    }
}