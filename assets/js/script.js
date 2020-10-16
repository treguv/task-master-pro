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
  
  //Check due date
  console.log("Task Creation : " + taskLi);
  auditTask(taskLi);

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
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      //when calender closed force change event on date input
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

//When you click off the task
$(".list-group").on("change","input[type = 'text']", function(){
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
    //check the time and such
  auditTask($(taskSpan).closest(".list-group-item"));
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
$("#task-form-modal .btn-save").click(function() {
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
//make the lists sortable
$(".list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    //console.log("activate", this);
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    //console.log("deactivate", this);
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    //console.log("over", event.target);
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
   //console.log("out", event.target);
   $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
   var tempArr = [];
   //loop over all children in sortable list
    $(this).children().each(function(){
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      //Push to temp array
      tempArr.push({
        text:text,
        date:date
      });
    });

    //trim down list id to match objct property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");
    //Update the correct task array with the new array
    tasks[arrName] = tempArr;
    saveTasks();
    // console.log(tempArr)
  }

});

//Delete stuff
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    console.log("out");
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
});

//date picker
$("#modalDueDate").datepicker({
  minDate: 1 // how many days minimum we want to push it forward
});

function auditTask(taskEl){
  console.log(taskEl);
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  //convert to moment object
  var time = moment(date, "L").set("hour", 17);

  //Remove old stuff
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //Apply new class if the task is near/over due date
  if (moment().isAfter(time)) { // check to see if the currentt time is past the event time
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time,"days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
}

setInterval(function(){
  $(".card .list-group-item").each(function(index,el){
    auditTask(el);
  });
}, (1000 * 60) * 30);

