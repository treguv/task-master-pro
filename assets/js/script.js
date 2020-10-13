var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click","p",function(){ //in list group, listen for p to ge clicked on
  var text = $(this).text().trim(); // this targets objext and .text() grabs the text value inside
  console.log(text);
  var textInput = $("<textarea>") //the <> Tells jQuery to make a new element
  .addClass("form-control")
  .val(text);

  $(this).replaceWith(textInput);// replaces the clicked on paragraph with the text area
  textInput.trigger("focus"); // Selects the element for editing or "focus on it"
});

$(".list-group").on("blur", "textarea", function(){ // when the text area in list group goes out of focus
  // get the text areas current value
  var text = $(this).val().trim();
  //Get the parent ul's id 
  var status = $(this) // select the paragraph
  .closest(".list-group") // find closest list group
  .attr("id") // grab its id 
  .replace("list-", ""); // removethe list- part of it to keep the number
  //Get the tasks position in the list of other elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  // update the actual task
  tasks[status][index].text = text;
  saveTasks();

  //  recreate the p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);
  //replace the text area with the p element
  $(this).replaceWith(taskP);
});

//When the due date is clicked
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this)
  .text()
  .trim(); // trim off excess spacing
  //create new input element
  var dateInput = $("<input>")
  .attr("type", "text") // set attribute type to be equal to text 1 arg get 2 get sell
  .addClass("for-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);
  //Auto focus on new element
  dateInput.trigger("focus");
})
//When you click off the task
$(".list-group").on("blur","input[type = 'text']", function(){
  //get current text
  var date = $(this)
  .val()
  .trim();

  //get parent ul id attribute
  var status = $(this)
  .closest(".list-group")//target the closest list group
  .attr("id")//grab the id
  .replace("list-", "");

  //get task position
  var index = $(this)
  .closest(".list-group-item")
  .index();
  
  //update task in array and resave to local storage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);
  
  //replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


