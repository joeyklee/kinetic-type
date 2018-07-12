// P_3_2_2_01
//
// Generative Gestaltung – Creative Coding im Web
// ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
// Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
// with contributions by Joey Lee and Niels Poldervaart
// Copyright 2018
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * fontgenerator with dynamic elements
 *
 * MOUSE
 * position x          : curve rotation
 * position y          : curve height
 *
 * KEYS
 * a-z                 : text input (keyboard)
 * del, backspace      : remove last letter
 * alt                 : toggle fill style
 * ctrl                : save png
 */

var textTyped = 'Hello Bye';

var font;

var filled = false;
let path;
let movers = [];
function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  opentype.load('data/Affogato-Regular.otf', function(err, f) {
    if (err) {
      print(err);
    } else {
      font = f;

      if (textTyped.length > 0) {
        // get a path from OpenType.js
        var fontPath = font.getPath(textTyped, 0, 0, 200);
        // convert it to a g.Path object
        path = new g.Path(fontPath.commands);
        // resample it with equidistant points
        path = g.resampleByLength(path, 30);
        // path = g.resampleByAmount(path, 500);

        // map mouse axis
        // var addToAngle = map(mouseX, 0, width, -PI, PI);
        // var curveHeight = map(mouseY, 0, height, 0.1, 2);

        let counter = 0;
        path.commands.forEach( (pt, idx) => {
        	if(pt.type == "M"){
        		counter++;

        		if(counter > 5){
        			movers.push(new Mover(pt.x, pt.y, 4, true))	
        		} else{
        			movers.push(new Mover(pt.x, pt.y, 4, false))	
        		}
        	} else{
        		movers.push(new Mover(pt.x, pt.y, 4, false))
        	}
        	
        })
      }

      loop();
    }
  });
}

function draw() {
  if (!font) return;

  background(255, 255, 255, 20);
  if (filled) {
    noStroke();
    fill(0);
  } else {
    noFill();
    stroke(0);
    strokeWeight(2);
  }

  // margin border
  translate(20, 260);

  movers.forEach( (mover1, idx1) =>{
  	movers.forEach( (mover2, idx2) => {
  		if(idx1 !== idx2 && mover1.attractor == false){
  		  let moverAttractionforce = mover2.attract(mover1)
  		  mover1.applyForce(moverAttractionforce)
  		}
  	})
  	mover1.update();
  	mover1.display();
  })
  
}


class Mover{
	constructor(x, y, mass, attractor){
		this.x = x;
		this.y = y;
		this.mass = mass;
		this.G = 10;
		this.attractor = attractor || false;

		this.angle = 0;
		this.angularVelocity = 0;
		this.angularAcceleration = 0.01;

		this.location = createVector(this.x, this.y);
		this.velocity = createVector(0,0);
		this.acceleration = createVector(0,0);
	}
}

Mover.prototype.attract = function( _mover ){

  let force = p5.Vector.sub(this.location, _mover.location)

  let distance = force.mag();
  distance = constrain(distance,10.0,100.0);
  force.normalize();

  let strength = (this.G * this.mass * _mover.mass) / (distance * distance);

  force.mult(strength);

  return force;

}

Mover.prototype.applyForce = function( force ){

  let f = force.copy();
  // force = mass * acceleration
  f.div(this.mass)
  this.acceleration.add(f);

}

Mover.prototype.update = function(){
	
	// this.angularVelocity += this.angularAcceleration;
	// this.angle += this.angularVelocity;
	// if(this.angularVelocity > 3){
	// 	this.angularVelocity= 3;
	// }

	let distorterX = map(mouseX, 0, width, -2, 2)
	let distorterY = map(mouseY, 0, height, -2, 2)

	if(mouseIsPressed) this.acceleration = createVector(random(-0.25, 0.25), random(-0.25, 0.25))
	// this.acceleration = createVector(distorterX, distorterY)


		this.velocity.add(this.acceleration)
		this.location.add(this.velocity)

		this.velocity.limit(1)

		this.acceleration.mult(0)	
	
}

Mover.prototype.display = function(){

	push();
	translate(this.location.x, this.location.y)
	rotate(radians(this.angle));
	// ellipse(0, 0, this.mass/2, this.mass/2);
	line(-this.mass/2, 0, this.mass/2, 0)
	// line(0, 0, this.mass, 0)
	pop();
}

function keyReleased() {
  if (keyCode == ALT) filled = !filled;
}

function keyPressed() {
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    if (textTyped.length > 0) {
      textTyped = textTyped.substring(0, textTyped.length - 1);
    }
  }
}

function keyTyped() {
  if (keyCode >= 32) {
    textTyped += key;
  }
}