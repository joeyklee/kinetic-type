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

var textTyped = ['Hello', 'Bye'];


var font;
let movers = [];
let attractors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  opentype.load('data/Affogato-Regular.otf', function(err, f) {
    if (err) {
      print(err);
    } else {
      font = f;

      // create 
      movers = createFontPaths(textTyped[0], font, false)
      attractors = createFontPaths(textTyped[1], font, true)

      loop();
    }
  });
}


function draw() {
  if (!font) return;
  randomSeed(1)

  background(255, 255, 255, 20);

  // margin border
  translate(300, 300);

  movers.forEach( (mover1, idx1) =>{

    if(frameCount > 150){


    let attractionForce = attractors[int(random(0,attractors.length))].attract(mover1);
    mover1.applyForce(attractionForce)
    }

	  // mover1.applyForce(moverAttractionforce)	
  	mover1.update();
  	mover1.display();
  })
  
}





class Mover{
	constructor(x, y, mass, attractor){
		this.x = x;
		this.y = y;
		this.mass = mass;
		this.G = 0.1;
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
	distance = constrain(distance,1.0,2.0);
	force.normalize();

	let strength = (this.G * this.mass * _mover.mass) / (distance * distance);	
	force.mult(strength);

  return force;

}

Mover.prototype.repel = function( _mover ){
	let force = p5.Vector.sub(this.location, _mover.location)

	let distance = force.mag();
	distance = constrain(distance,100.0,200.0);
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
	
	this.angularVelocity += this.angularAcceleration;
	this.angle += this.angularVelocity;
	if(this.angularVelocity > 3){
		this.angularVelocity= 3;
	}

	if(mouseIsPressed) this.acceleration = createVector(random(-0.25, 0.25), random(-0.25, 0.25))

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
	stroke(0,0,0, 50)
	// fill(0,0,0, 10)
	line(-this.mass/2, 0, this.mass/2, 0)
	// line(0, 0, this.mass, 0)
	pop();
}





/*@@
@ keys & helpers
*/

function createFontPaths(textTyped, font, attractorStatus){
  let output = [];
  // get a path from OpenType.js
  var fontPath = font.getPath(textTyped, 0, 0, 200);
  // convert it to a g.Path object
  path = new g.Path(fontPath.commands);
  // resample it with equidistant points
  path = g.resampleByLength(path, 2);
  // path = g.resampleByAmount(path, 500);

  path.commands.forEach( (pt, idx) => {
      output.push(new Mover(pt.x, pt.y, 4, attractorStatus)) 
  })

  return output;
}

function keyReleased() {
  if (keyCode == ALT) {

  }
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
  // if(keyCode )
}