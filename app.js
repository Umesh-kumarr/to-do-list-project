//selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');

//Event listeners
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', deletecheck);

//functions
function addTodo(e){
    //prevent form from submitting
    e.preventDefault();
    
    //todo DIV
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    //create list
    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add('todo-item');
    todoDiv.appendChild(newTodo);
    todoInput.value = "";
    



    //CHECK MARK BUTTON
    const completeButton = document.createElement('button');
    completeButton.innerHTML='<i class = "fas fa-check"></i>';
    completeButton.classList.add("complete-btn");
    todoDiv.appendChild(completeButton);

    //CHECK DELETE BUTTON
    const trashButton = document.createElement('button');
    trashButton.innerHTML='<i class = "fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    //APPEND TO LIST
    todoList.appendChild(todoDiv);

}


function deletecheck(e){
    const item = e.target;
    //delete todo
    if (item.classList[0] === "trash-btn"){
        const todo = item.parentElement;
        //animation
        todo.classList.add("fall");
        todo.addEventListener('transitionend',function(){
            todo.remove();
        });
    }

    //check mark
    if (item.classList[0] === "complete-btn"){
        const todo = item.parentElement;
        todo.classList.toggle("completed");
    }


}