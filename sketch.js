// Tone Toss 
// by Cameron Lee May 12 2020
// Final Project for AUDI-314 at Columbia College Chicago
var Engine = Matter.Engine, // Define Variables for Physics Engine (Matter.js)
  World = Matter.World,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Bodies = Matter.Bodies;
var engine;
var world;
var gravityMultiplier = 1;
var gravityX = 0 * gravityMultiplier;
var gravityY = 1 * gravityMultiplier;
// Arrays that will hold our objects 
var particles = []; 
var bounds = [];
var boundMargin = 400;

var octave = 4; // Octave transposition
var transpose = 0; // Semitone transposition
var currentScale = 0;

var particleLimit = 12; // maximum amount of particles allowed on the screen at once.
var particleCount = 0; // keeps track of amount of particles in the screen.
var removeCount = 0; // Keeps track of amount of particles removed. Unused so far.

//----- variables for the GUI ------
var gui; // define gui
var gravityToggle = true; // boolean for gravity modes 'constant' and 'applied'.
var voiceToggle = true; // boolean for voice modes melody and rhythm.
var Waveform = ['amsine','triangle','sawtooth','square','pwm','pulse','fmsine','fmtriangle','fmsawtooth','fmsquare','sine','amtriangle','amsawtooth','amsquare'];
var waveformList = ['sine','triangle','sawtooth','square','pwm','pulse','fmsine','fmtriangle','fmsawtooth','fmsquare','amsine','amtriangle','amsawtooth','amsquare'];
var reverbWet = 30; // Reverb mix
var reverbWetMin = 0; // quicksettings recognizes 'min' 'max' and 'step' suffixes and automatically applies them to the gui.
var reverbWetMax = 100;
var reverbDecay = 3; // Reverb decay time in seconds
var reverbDecayMin = 0;
var reverbDecayMax = 10;
var Lifespan = 800; // Lifespan - how long particles persist (in frames)
var LifespanMin = 50;
var LifespanMax = 2000;
var Bounciness = 0.75; // Bounciness - restitution values for matter.js bodies
var BouncinessMin = 0;
var BouncinessMax = 2;
var BouncinessStep = 0.01;
var Friction = 0.3; // Friction - friction values for matter.js bodies
var FrictionMin = 0;
var FrictionMax = 1;
var FrictionStep = 0.01
var particleSizeMinimum = 40; // Particle Size is random, but the user can change the range of the randomization in pixels.
var particleSizeMinimumMin = 1;
var particleSizeMinimumMax = 50;
var particleSizeMaximum = 80;
var particleSizeMaximumMin = 51;
var particleSizeMaximumMax = 500;
var bgColorMelody = '#9DC4F9'; //Bg colors for the two voice modes
var bgColorDrums = '#1A222C';
var p = document.getElementById("keyguide"); // get a reference to the keyguide element and cache it

function toggleKeyguide() {
  p.classList.toggle('hideKeyguide'); // toggle the hideKeyguide class
}

const keyboard = ['1', '2', '3', '4', '5', '6', '7', '8', '9']; // string arrays of acceptable keyboard piano input
const surpriseNote = [0, 2, 4, 5, 7, 9, 11, -7, -12, 14];
const scales = [
  ['major',[0,2,4,5,7,9,11,12,14,16]],
  ['minor',[0,2,3,5,7,8,10,12,14,15]]
]

// Tone.js Master Channel
const masterChannel = new Tone.Channel().toMaster();
const reverb = new Tone.Reverb({
  "decay" : 3,
  "preDelay": 0,
  "wet": 0
}).connect(masterChannel);

function setup() { // setup runs once when the program is initialized
  let canvas = createCanvas(windowWidth, windowHeight); // define HTML canvas that p5 draws on
  canvas.parent('sketchHolder');
  colorMode(HSB); // hue saturation brightness
  engine = Engine.create(); //define engine
  world = engine.world; //define world
  world.gravity.x = gravityX; // intialize gravity
  world.gravity.y = gravityY;
  Matter.Bounds.create(0, 0, 800, 800, 400);
  reverb.generate(); // intialize reverb

  gui = createGui('Settings'); // create gui and add the variables
  gui.addGlobals('gravityToggle', 'voiceToggle','Waveform','reverbWet', 'reverbDecay','Lifespan','Bounciness','Friction','particleSizeMinimum','particleSizeMaximum');
  gui.hide(); // hide the gui so it can be toggled on later

  //Tells matter to listen for collision events, and call the function 'onCollision' when it detects one. It also passes the events' data to that function.
  Events.on(engine, 'collisionStart', onCollision);

  //Add mouse interaction
  var mouse = Mouse.create(document.body),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2
  }});
  World.add(engine.world, mouseConstraint);

  //Create boundary objects
  var ground = new Boundary(width / 2, height + boundMargin, width * 2, 800);
  var ceiling = new Boundary(width / 2, -boundMargin, width * 2, 800);
  var wallL = new Boundary(-boundMargin, height / 2, 800, height);
  var wallR = new Boundary(width + boundMargin, height / 2, 800, height);
  bounds.push(ground); // and add them to the array
  bounds.push(ceiling);
  bounds.push(wallL);
  bounds.push(wallR);
} // END SETUP() --------

// a function for drawing n-gons.
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// function that spawns particles, called when note input is detected
function newParticle(key) { // receives 'key' which is the midi note #
  if (voiceToggle){ //if statement checks what voiceMode we're in. True is Melody and False is Drums.
  //spawn melody particles by adding a Particle object to the particles array.
  // see particles.js for more info about the constructor
  particles.push(new Particle(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, Waveform,Lifespan, Bounciness, Friction));
  } else if (!voiceToggle){
  //spawn drum particles by adding a ParticleDrum object to the particles array.
    particles.push(new ParticleDrum(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, Lifespan,Bounciness,Friction));
  }
  particleCount += 1; // add to the particleCount tally
}

// function that spawns particles, called when note input is detected
function newRandomParticle(key,randomWave) { // receives 'key' which is the midi note #
  if (voiceToggle){ //if statement checks what voiceMode we're in. True is Melody and False is Drums.
  //spawn melody particles by adding a Particle object to the particles array.
  // see particles.js for more info about the constructor
  particles.push(new Particle(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, randomWave, Lifespan, Bounciness, Friction));
  } else if (!voiceToggle){
  //spawn drum particles by adding a ParticleDrum object to the particles array.
    particles.push(new ParticleDrum(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, Lifespan,Bounciness,Friction));
  }
  particleCount += 1; // add to the particleCount tally
}

// function that reads collision events coming from Matter, and tells p5 and tone to trigger the sounds of the correct particle
function onCollision(event) {
  var pairs = event.pairs; // matter handles events in pairs, bodyA and bodyB are the two bodies involved the collision event.
  var aId = pairs[0].bodyA.id; // define variables for both the ID and the Label of both bodies. 
  var bId = pairs[0].bodyB.id;
  var aLabel = pairs[0].bodyA.label;
  var bLabel = pairs[0].bodyB.label;

  if (bId >= 6 && aLabel === "boundary") { // if the collision is between a particle and wall,
    particles[bId - 6].playOscillator(); // only play the sound for the particle.
  } else if (aLabel === "particle" && bLabel === "particle"){ // if the collision is between two particles,
    particles[aId - 6].playOscillator(); // play the sound of both particles
    particles[bId - 6].playOscillator();
    // the correct particle is accessed by taking the ID # from the event and subtracting 6.
    // this is because the bodies with IDs 0-5 are the walls
    // this adjusted value aligns with the index of the particle object that collided.
  }
}
// deletes particles, called when their lifespan runs out
function removeParticle(i) {
  if (particles.length > 0) {
    World.remove(world, particles[i].body);
    particles[i].isAlive = false;
    particleCount -= 1;
    removeCount += 1;
  }
}
// resizes the sketch to the window
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}

function mouseMoved(){
}

// Arrow / WASD events for gravity manipulation
function keyPressed() {
  if (keyCode === 16){
    currentScale = 1 - currentScale
  } 
  if (gravityToggle) { // MODE TRUE Constant Gravity
    if (keyCode === DOWN_ARROW) { // Down arrow or S
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = 1 * gravityMultiplier; // gravity down
    } else if (keyCode === UP_ARROW) { // Up arrow or W
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = -1 * gravityMultiplier; // gravity up
    } else if (keyCode === RIGHT_ARROW) { // Right arrow or D
      world.gravity.x = 1 * gravityMultiplier; // gravity right
      world.gravity.y = 0 * gravityMultiplier;
    } else if (keyCode === LEFT_ARROW) { // Left arrow or A
      world.gravity.x = -1 * gravityMultiplier; // gravity left
      world.gravity.y = 0 * gravityMultiplier;
    } else if (keyCode === 83) { // Down arrow or S
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = 1 * gravityMultiplier; // gravity down
    } else if (keyCode === 87) { // Up arrow or W
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = -1 * gravityMultiplier; // gravity up
    } else if (keyCode === 68) { // Right arrow or D
      world.gravity.x = 1 * gravityMultiplier; // gravity right
      world.gravity.y = 0 * gravityMultiplier;
    } else if (keyCode === 65) { // Left arrow or A
      world.gravity.x = -1 * gravityMultiplier; // gravity left
      world.gravity.y = 0 * gravityMultiplier;
    }
  } else if (!gravityToggle) { // MODE FALSE Applied Gravity
    world.gravity.x = 0; 
    world.gravity.y = 0; // zero gravity
    if (keyIsDown(DOWN_ARROW)) {
      world.gravity.x = 0;
      world.gravity.y = 1;  // gravity down
    } else if (keyIsDown(UP_ARROW)) {
      world.gravity.x = 0;
      world.gravity.y = -1; // gravity up
    } else if (keyIsDown(RIGHT_ARROW)) {
      world.gravity.x = 1; // gravity right
      world.gravity.y = 0;
    } else if (keyIsDown(LEFT_ARROW)) {
      world.gravity.x = -1; // gravity left
      world.gravity.y = 0;
    } else if (keyIsDown(83)) {
      world.gravity.x = 0;
      world.gravity.y = 1;  // gravity down
    } else if (keyIsDown(87)) {
      world.gravity.x = 0;
      world.gravity.y = -1; // gravity up
    } else if (keyIsDown(68)) {
      world.gravity.x = 1; // gravity right
      world.gravity.y = 0;
    } else if (keyIsDown(65)) {
      world.gravity.x = -1; // gravity left
      world.gravity.y = 0;
    }
  }
}
function keyReleased() { //when keys are released, only for Applied gravity mode 
  if (!gravityToggle) {
    world.gravity.x = 0; // zero gravity
    world.gravity.y = 0;
  }
}

function keyTyped() {
  if (particleCount < particleLimit) { // only allows newParticle to be called if particleCount is below the limit
    if (voiceToggle){ // voiceMode TRUE: Melody
    if (Number(key) <= 9 && Number(key) >=1) { // checks that the typed key belongs to the array of 'piano keys' I designated earlier.
      let k = scales[currentScale][1][Number(key)-1] + octave * 12 + 12 + (transpose%12); //k is the midi note value of our input. Determined by the index of the key we pressed in our keyboard array, plus our transposition values.
      newParticle(k); // calls newParticle and passes k into it.
    } else if (key === 'r') { // random note
      let k = surpriseNote[Math.floor(Math.random()*surpriseNote.length)];
      console.log(k);
      let w = waveformList[Math.floor(Math.random()*waveformList.length)]
    newRandomParticle(k + octave * 12 + 12 + (transpose%12), w);
  } else if (key === 'R') { // random note CAPS
    let k = surpriseNote[Math.floor(Math.random()*surpriseNote.length)];
    console.log(k);
    let w = waveformList[Math.floor(Math.random()*waveformList.length)]
  newRandomParticle(k + octave * 12 + 12 + (transpose%12), w);
}
  } else if (!voiceToggle){ // voiceMode FALSE: Drums
      if (keyboard.includes(key)) {  // the only difference here is that in Drum mode, the octave value is fixed at 4, so the octave switch will not affect its pitch.
        let k = keyboard.indexOf(key) + 4 * 12 + 12;
        newParticle(k);
      } else if (keyboardCapital.includes(key)) {
        let k = keyboardCapital.indexOf(key) + 4 * 12 + 12;
        newParticle(k);
    } else if (key === 'r'){//random drum
      let k = random(0,11) + 4 * 12 + 12;
      newRandomParticle(k);
    } else if (key === 'R'){//random drum CAPS
      let k = random(0,11) + 4 * 12 + 12;
      newRandomParticle(k);
    }
  }}
    // key mapping for other functions
    // if (key >= 0 || key <= 9) {
    //   transpose = Number(key); // semitone transpotiion
    // }
    if (key === 'x') {
      if (octave < 8) {
        octave += 1; // octave up switch
      }
    } else if (key === 'X') {
      if (octave < 8) {
        octave += 1; // octave up switch CAPS
      }
    } else if (key === 'z') {
      if (octave > 1) {
        octave -= 1; // octave down switch CAPS
      }
    } else if (key === 'Z') {
      if (octave > 1) {
        octave -= 1; // octave down switch CAPS
      } 
    } else if (key === 'e') {
        transpose += 1; // transpose up switch
    } else if (key === 'E') {
        transpose += 1; // transpose up switch CAPS
    } else if (key === 'q') {
        transpose -= 1; // transpose down switch CAPS
    } else if (key === 'Q') {
        transpose -= 1; // transpose down switch CAPS
    } else if (key === 'f') { // gravity mode toggle
      gravityToggle = !gravityToggle;
    } else if (key === 'F') { // gravity mode toggle
      gravityToggle = !gravityToggle;
    } else if (key === '-') { // gravity division
      gravityMultiplier += 0.5;
    } else if (key === '=') { // gravity multiplication
      gravityMultiplier -= 0.5;
    } else if (key === 'c'){ // voice mode toggle
      voiceToggle = !voiceToggle;
    } else if (key === 'C'){ // voice mode toggle CAPS
      voiceToggle = !voiceToggle;
    } else if (key === 'h'){ // toggle GUI
      gui.toggleVisibility();
      toggleKeyguide();
    } else if (key === 'H'){ // toggle GUI CAPS
      gui.toggleVisibility();
      toggleKeyguide();
    }
  return false;
}

function draw() { // draw loops every frame
  if (voiceToggle){
  background(bgColorMelody); // draws the background in the correct color according to the voice mode.
  } else if (!voiceToggle){
  background(bgColorDrums);
  }
  if (frameCount < 1000){ // displays temporary text that tells user how to open the GUI
  push();
  colorMode(RGB);
  textSize(windowHeight/40);
  fill(0, 102, 153, 100);
  text("advanced settings: h",30,50);
  pop();
}
  Engine.update(engine, 1000 / 30);   //Update the engine each frame
  reverb.wet.value = reverbWet / 100;  //Updates reverb parameters
  reverb.decay.value = reverbDecay;

  for (let i = 0; i < particles.length; i++) {//iterates for every particle in the particle array
    if (particles[i].isAlive) { // if the particle is alive,
      particles[i].show(); // then draw it to the screen.
      particles[i].filter.frequency.value = map(particles[i].getVel(particles[i].body),0,200,500,15000); // and map its velocity to the filter cutoff freq.
      particles[i].channel.connect(reverb); // connect each particle's output to the reverb
        if (particles[i].life > 0) { // particle lifespan
          particles[i].live();
        } else if (particles[i].life < 1) {
          particles[i].die(); // when its lifespan runs out, it dies
          removeParticle(i); // and is removed
        }
    }
  }
  for (let i = 0; i < bounds.length; i++) {
    bounds[i].show(); // draw all the boundaries
  }
}