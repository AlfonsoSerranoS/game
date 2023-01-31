const canvas = document.querySelector('canvas');
//var screenWidth = window.innerWidth;
//var screenHeight = window.innerHeight;

// We make sure the canvas' width and height is adjusted to the size of the user's screen (at least when it is first displayed)
var parent = canvas.parentNode;
var parentWidth = parent.clientWidth;
var parentHeight = parent.clientHeight;
canvas.width = parentWidth-20;
canvas.height = parentHeight;
const context = canvas.getContext('2d');

var user_id = 0;
var bounce_counter = 0;
var bounce_limit = 15;
var game_ended = 0;  // Control variable, while its value is 0 the game continues.


class Element {
  // Constructor function to initialize the properties of the square
  constructor(initial_x, initial_y, direction) {
    this.position = {
      x: initial_x,
      y: initial_y
    }
    this.width = 50;
    this.height = 50;
    this.velocity = {
      x: 0,
      y: 0
    }
    this.direction = direction;
    this.start_time = new Date().toISOString();
    this.in_visible_area = 0;
  }
  // 'Setter' function to set the new position of the square
  setPosition(new_x, new_y) {
    this.position = {
      x: new_x,
      y: new_y
    }
    this.in_visible_area = 0;
    bounce_counter = 0;
  }
  // 'Setter' function to set the new direction of the square
  setDirection(new_direction) {
    this.direction = new_direction;
  }
  // 'Setter' function to set the new velocity of the square
  setVelocity() {
    var seed = 2*Math.random();
    this.velocity = {
      x: (this.direction[0]*seed)+0.3,
      y: (this.direction[1]*Math.sqrt(4-seed*seed))
    }
    if (this.velocity.y == 0) {
      this.velocity.y = this.direction[1]*0.1
    }
  }
  // 'Setter' function that when called sets the new start time of the square
  setStartTime(new_time) {
    this.start_time = new_time;
  }
  // 'Getter' function to get the start time of the square
  getStartTime() {
    return this.start_time;
  }
  stop() {
    this.velocity = {
      x: 0,
      y: 0
    }
  }
  // Function to draw the square
  draw() {
    context.fillStyle = 'green';
    if (this.position.x == canvas.width-50) {
      context.fillRect(this.position.x,this.position.y,this.width-4,this.height);
    } else {
      context.fillRect(this.position.x,this.position.y,this.width,this.height);
    }
  }
  // Function to move the square
  move() {
    this.draw();
    this.position.x += this.velocity.x;
    // Control statements to correct any potential misspositioning error.
    if(this.position.x>canvas.width-49) {
      this.position.x = canvas.width-50;
    }
    if(this.position.y>canvas.height-49) {
      this.position.y = canvas.height-50;
    }
    this.position.y += this.velocity.y;
    if (this.position.x + this.height + this.velocity.x > 100 && this.position.y + this.height + this.velocity.y > 100
      && this.position.y + this.height + this.velocity.y < canvas.height-50 && 
      this.position.x + this.width + this.velocity.x < canvas.width-50) {
        this.in_visible_area = 1;
    }
    // check if the square reaches the borders of the visible area
    if (this.in_visible_area == 1) {
      if (this.position.y + this.height + this.velocity.y > canvas.height-49) {
        this.velocity.y = -this.velocity.y;
        bounce_counter++;
      }
      if (this.position.x + this.width + this.velocity.x > canvas.width-49) {
        this.velocity.x = -this.velocity.x;
        bounce_counter++;
      }
      if (this.position.x + this.height + this.velocity.x < 99) {
        this.velocity.x = -this.velocity.x;
        bounce_counter++;
      }
      if (this.position.y + this.width + this.velocity.y < 99) {
        this.velocity.y = -this.velocity.y;
        bounce_counter++;
      }
      if(bounce_counter >= bounce_limit) {
        endgame();
      }
    }
    // Just in case, we force the figure to bounce if it somehow reaches the actual borders of the canvas
    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      this.velocity.y = -this.velocity.y;
    }
    if (this.position.x + this.width + this.velocity.x >= canvas.width) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.position.x + this.height + this.velocity.x <= 0) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.position.y + this.width + this.velocity.y <= 0) {
      this.velocity.y = -this.velocity.y;
    }
  }
}

// Function to draw the borders of the visible area
function drawBorders(){
  context.fillStyle = 'white';
  context.fillRect(0,0,50,canvas.height);
  context.fillRect(0,0,canvas.width,50);
  context.fillRect(0,canvas.height-52,canvas.width,52);
  context.fillRect(canvas.width-51,0,50,canvas.height);
}

// Function to regenerate the square's initial (hidden) position (x and y coordinates) and its direction.
function regenerate_position() {
  var x = 0;
  var y = 0;
  bounce_counter = 0;
  var enter_side = Math.floor(Math.random() * 4);
  var direction = []
  var indifferent = Math.random() < 0.5 ? -1 : 1;
  switch (enter_side){
    case 0:
      x = 0;
      y = 50 + Math.random() * (canvas.height-50);
      if (y < 60){
        direction.push(1, -1);
      } else if (y > canvas.height-70) {
        direction.push(1, 1);
      } else {
        direction.push(1, indifferent);
      }
      break;
    case 1:
      x = canvas.width-50;
      y = 50 + Math.random() * (canvas.height-50);
      if (y < 60){
        direction.push(-1, -1);
      } else if (y > canvas.height-70) {
        direction.push(-1, 1);
      } else {
        direction.push(-1, indifferent);
      }
      break;
    case 2:
      y = 0;
      x = 50 + Math.random() * (canvas.width-50);
      if (x < 60){
        direction.push(1, 1);
      } else if (x > canvas.width-70) {
        direction.push(-1, 1);
      } else {
        direction.push(indifferent,1);
      }
      break;
    case 3:
      y = canvas.height-50;
      x = 50 + Math.random() * (canvas.width-50);
      if (x < 60){
        direction.push(1, -1);
      } else if (x > canvas.width-70) {
        direction.push(-1, -1);
      } else {
        direction.push(indifferent,-1);
      }
      break;
    default:
      y = canvas.height-50;
      direction.push(indifferent,-1);
      x = 50 + Math.random() * (canvas.width-50);
      break;
  }
  return { x, y, direction };
}

function endgame() {
  // Function to automatically end the game if the user does not interact
  // with it for a while.
  user_id=0;  // Setting the id to 0 will disable the play() function
  //window.removeEventListener('keydown', object_detected);
  game_ended = 1;
  console.log("GAME TERMINATED");
}

function play() {
  if (user_id != 0 && game_ended==0) {
    console.log("Entering the 'play' function");
    context.clearRect(0,0,canvas.width,canvas.height);
    drawBorders();
    element.setVelocity();
    element.setStartTime(new Date().toISOString());
    console.log("Mehtod 'setVelocity' called. Now the object should move...");
    var object_detected = ({ keyCode }) => {
      if (keyCode == 32 && game_ended==0) {
        console.log("Space key event detected...");
        element.stop();
        var startTime = new Date(element.getStartTime());
        // calculate reaction time
        var reactionTime = new Date() - startTime;
        reactionTime = reactionTime/1000;  // (Converting to seconds)
        console.log("Reaction time: ");
        console.log(reactionTime);
        // We prepare the measurement for sending...
        var measurement = {
          "user_id" : user_id,
          "timestamp" : Date.now()/1000,
          "reaction_time" : reactionTime
        };
        console.log("Datetime:");
        console.log(Date.now()/1000);
        // Sending the measurement to server via AJAX ...
        $.ajax({
          type: "POST",
          url: "/save_measurement",
          data: JSON.stringify(measurement),
          contentType: "application/json",
          dataType: 'json',
          success: function(result) {
            console.log("Storage SUCCESS. Current num. of rows:");
            console.log(result.rows);
            //numRows.innerHTML = result.rows;
          }
        });
        // ... Sending the measurement to server via AJAX
        setTimeout(function() {
          let new_pos = regenerate_position();
          element.setPosition(new_pos.x, new_pos.y);
          element.setDirection(new_pos.direction);
          console.log("Second timeout ok");
          var wait = Math.floor(Math.random() * 10000);
          window.removeEventListener('keydown', object_detected);
          setTimeout(play, wait);
        }, 1000);
      }
    }
    var object_detected_touchstart = () => {
      if (game_ended==0) {
        console.log("Touch event detected...");
        element.stop();
        var startTime = new Date(element.getStartTime());
        // calculate reaction time
        var reactionTime = new Date() - startTime;
        reactionTime = reactionTime/1000;  // (Converting to seconds)
        console.log("Reaction time: ");
        console.log(reactionTime);
        var measurement = {
          "user_id" : user_id,
          "timestamp" : Date.now()/1000,
          "reaction_time" : reactionTime
        };
        console.log("Datetime in javascript format:");
        console.log(Date.now()/1000);
        // Sending the measurement to server via AJAX ...
        $.ajax({
          type: "POST",
          url: "/save_measurement",
          data: JSON.stringify(measurement),
          contentType: "application/json",
          dataType: 'json',
          success: function(result) {
            console.log("Storage SUCCESS. Current num. of rows:");
            console.log(result.rows);
            //numRows.innerHTML = result.rows;
          }
        });
        // ... Sending the measurement to server via AJAX
        setTimeout(function() {
          let new_pos = regenerate_position();
          element.setPosition(new_pos.x, new_pos.y);
          element.setDirection(new_pos.direction);
          console.log("Second timeout ok");
          var wait = Math.floor(Math.random() * 10000);
          document.removeEventListener('touchstart', object_detected_touchstart);
          setTimeout(play, wait);
        }, 1000);
      }
    }
    window.addEventListener('keydown', object_detected);
    document.addEventListener('touchstart', object_detected_touchstart);
  } else if (game_ended == 0) {
    var wait = Math.floor(Math.random() * 4000);
    setTimeout(play, wait);
  } else {
    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = 'black';
    context.textAlign = "center";
    context.font = "30px Arial";
    context.fillText("Game Over", canvas.width/2, canvas.height/2);
  }
}


function animate() {
  if (game_ended==0) {
    requestAnimationFrame(animate);
    context.clearRect(0,0,canvas.width,canvas.height);
    drawBorders();
    context.globalCompositeOperation='destination-over';
    element.move();
  }
}

function get_id() {
  var input_id = Number(document.getElementById('id_code').value);
  if (!Number.isInteger(parseInt(input_id))) {
    alert("Please enter a valid integer for the user ID.");
    console.log("Please enter a valid integer for the user ID.");
    document.getElementById("id_code").value = 0;
  } else {
    user_id = input_id
    document.getElementById('id_getter').style.display = 'none';
  }
}

// Main
let initial_p = regenerate_position();
const element = new Element(initial_p.x, initial_p.y, initial_p.direction);

animate();
console.log("Animation activated");

var wait = Math.floor(Math.random() * 10000);
setTimeout(play, wait);
