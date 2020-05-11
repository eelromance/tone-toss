var Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Bodies = Matter.Bodies;
var engine;
var world;

var particles = [];
var bounds = [];
var boundMargin = 400;
var throttleThreshold = 50;
var particleLimit = 12;
var particleCount = 0;
var LifespanMode = 1;
var Lifespan = 600;
var LifespanMin = 50;
var LifespanMax = 2000;
var Bounciness = 0.75;
var BouncinessMin = 0;
var BouncinessMax = 2;
var BouncinessStep = 0.01;
var Friction = 0.5;
var FrictionMin = 0;
var FrictionMax = 1;
var FrictionStep = 0.01
var particleSizeMinimum = 40;
var particleSizeMinimumMin = 1;
var particleSizeMinimumMax = 50;
var particleSizeMaximum = 80;
var particleSizeMaximumMin = 51;
var particleSizeMaximumMax = 500;

var removeCount = 0;
var gravityToggle = true;
var voiceToggle = true;
var reverbWet = 20;
var reverbWetMin = 0;
var reverbWetMax = 100;
var reverbDecay = 3;
var reverbDecayMin = 0;
var reverbDecayMax = 10;
var gravityMultiplier = 1;
var gravityX = 0 * gravityMultiplier;
var gravityY = 1 * gravityMultiplier;
var octave = 4;
var transpose = 0;
const keyboard = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l'];
const keyboardCapital = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K', 'O', 'L'];
var bgColorMelody = '#9DC4F9';
var bgColorDrums = '#1A222C';
var Waveform = ['sine','triangle','sawtooth','square','pwm','pulse','fmsine','fmtriangle','fmsawtooth','fmsquare','amsine','amtriangle','amsawtooth','amsquare'];
const masterChannel = new Tone.Channel().toMaster();
const reverb = new Tone.Reverb({
  "decay" : 3,
  "preDelay": 0,
  "wet": 0
}).connect(masterChannel);

var gui;

function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  engine = Engine.create();
  world = engine.world;
  world.gravity.x = gravityX;
  world.gravity.y = gravityY;
  Matter.Bounds.create(0, 0, 800, 800, 400);
  reverb.generate();

  //gui
  gui = createGui('Settings');
  gui.addGlobals('gravityToggle', 'voiceToggle','midiInputs','midiOutputs','Waveform','reverbWet', 'reverbDecay','Lifespan','Bounciness','Friction','particleSizeMinimum','particleSizeMaximum','bgColorMelody','bgColorDrums');
  gui.hide();


  //Events
  Events.on(engine, 'collisionStart', onCollision);

  //Add mouse interaction
  var mouse = Mouse.create(document.body),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2
      }
    });
  World.add(engine.world, mouseConstraint);

  //Create boundaries
  var ground = new Boundary(width / 2, height + boundMargin, width * 2, 800);
  var ceiling = new Boundary(width / 2, -boundMargin, width * 2, 800);
  var wallL = new Boundary(-boundMargin, height / 2, 800, height);
  var wallR = new Boundary(width + boundMargin, height / 2, 800, height);
  bounds.push(ground);
  bounds.push(ceiling);
  bounds.push(wallL);
  bounds.push(wallR);
}

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

function newParticle(key) {
  if (voiceToggle){
  particles.push(new Particle(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, Waveform,Lifespan, Bounciness, Friction));
  } else if (!voiceToggle){
    particles.push(new ParticleDrum(random(width / 20, width - width / 20), random(height / 20, height - height / 2), random(particleSizeMinimum, particleSizeMaximum), key, Lifespan,Bounciness,Friction));
  }
  particleCount += 1;
}

function onCollision(event) {
  //console.log("Evento: ", event)
  var pairs = event.pairs;
  var aId = pairs[0].bodyA.id;
  var bId = pairs[0].bodyB.id;
  var aLabel = pairs[0].bodyA.label;
  var bLabel = pairs[0].bodyB.label;
  //console.log(`colision between ${aId} - ${bId}`);
  if (bId >= 6 && aLabel === "boundary") {
    //console.log(bId-6);
    particles[bId - 6].playOscillator();
    //console.log(particles[bId-6].body.velocity);
  } else if (aLabel === "particle" && bLabel === "particle"){
    particles[aId - 6].playOscillator();
    particles[bId - 6].playOscillator();
  }
}

function removeParticle(i) {
  if (particles.length > 0) {
    World.remove(world, particles[i].body);
    particles[i].isAlive = false;
    particleCount -= 1;
    removeCount += 1;
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}

function keyPressed() {
  if (gravityToggle) {
    //world.gravity.y = 0 * gravityMultiplier;
    //world.gravity.y = 1 * gravityMultiplier;
    if (keyCode === DOWN_ARROW) {
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = 1 * gravityMultiplier;
    } else if (keyCode === UP_ARROW) {
      world.gravity.x = 0 * gravityMultiplier;
      world.gravity.y = -1 * gravityMultiplier;
    } else if (keyCode === RIGHT_ARROW) {
      world.gravity.x = 1 * gravityMultiplier;
      world.gravity.y = 0 * gravityMultiplier;
    } else if (keyCode === LEFT_ARROW) {
      world.gravity.x = -1 * gravityMultiplier;
      world.gravity.y = 0 * gravityMultiplier;
    }
  } else if (!gravityToggle) {
    world.gravity.x = 0;
    world.gravity.y = 0;
    if (keyIsDown(DOWN_ARROW)) {
      world.gravity.x = 0;
      world.gravity.y = 1;
    } else if (keyIsDown(UP_ARROW)) {
      world.gravity.x = 0;
      world.gravity.y = -1;
    } else if (keyIsDown(RIGHT_ARROW)) {
      world.gravity.x = 1;
      world.gravity.y = 0;
    } else if (keyIsDown(LEFT_ARROW)) {
      world.gravity.x = -1;
      world.gravity.y = 0;
    }
  }
}

function keyReleased() {
  if (!gravityToggle) {
    world.gravity.x = 0;
    world.gravity.y = 0;
  }
}

function keyTyped() {
  if (particleCount < particleLimit) {

    if (voiceToggle){
    if (keyboard.includes(key)) {
      let k = keyboard.indexOf(key) + octave * 12 + 12 + transpose;
      newParticle(k);
    } else if (keyboardCapital.includes(key)) {
      let k = keyboardCapital.indexOf(key) + octave * 12 + 12 + transpose;
      newParticle(k);
    } } else if (!voiceToggle){
      if (keyboard.includes(key)) {
        let k = keyboard.indexOf(key) + 4 * 12 + 12 + transpose;
        newParticle(k);
      } else if (keyboardCapital.includes(key)) {
        let k = keyboardCapital.indexOf(key) + 4 * 12 + 12 + transpose;
        newParticle(k);
    }}
    
    else if (key >= 0 || key <= 9) {
      transpose = Number(key);
    }
    if (key === 'x') {
      if (octave < 8) {
        octave += 1;
      }
    } else if (key === 'z') {
      if (octave > 1) {
        octave -= 1;
      }
    } else if (key === '/') {
      gravityToggle = !gravityToggle;
      gui.setValue('reverbWet','69');
    } else if (key === '.') {
      gravityMultiplier += 0.5;
    } else if (key === ',') {
      gravityMultiplier -= 0.5;
    } else if (key === 'c'){
      voiceToggle = !voiceToggle;
    } else if (key === 'q'){
      gui.toggleVisibility();
    }
  }
  return false;
}


function draw() {
  if (voiceToggle){
  background(bgColorMelody);
  } else if (!voiceToggle){
  background(bgColorDrums);
  }
  if (frameCount < 1000){
  push();
  colorMode(RGB);
  textSize(windowHeight/40);
  fill(0, 102, 153, 51);
  text("settings : q",10,windowHeight/40);
  pop();
}

  //Update the engine each frame
  Engine.update(engine, 1000 / 30);

  reverb.wet.value = reverbWet / 100;
  reverb.decay.value = reverbDecay;

  for (let i = 0; i < particles.length; i++) {
    if (particles[i].isAlive) {
      particles[i].show();
      particles[i].filter.frequency.value = map(particles[i].getVel(particles[i].body),0,200,500,15000);
      //console.log(particles[i].getVel(particles[i].body))
      particles[i].channel.connect(reverb);
      if (LifespanMode > 0) {
        if (particles[i].life > 0) {
          particles[i].live();
        } else if (particles[i].life < 1) {
          particles[i].die();
          removeParticle(i);
        }
      }
    }
    /*if (particles[i].isOffScreen) {
      particles[i].die();
    }*/
  }

  for (let i = 0; i < bounds.length; i++) {
    bounds[i].show();
  }
}