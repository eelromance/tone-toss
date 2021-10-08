class Particle { // define particle class
  constructor(x, y, r, pitch, waveform, lifespan, bounciness, friction) { // the constructor defines variables that passed into new instances of our object.
    this.x = x; // x position
    this.y = y; // y position
    this.r = r; // radius or size
    this.pitch = pitch;
    this.waveform = waveform;
    this.lifespan = lifespan
    this.life = lifespan;
    this.bounciness = bounciness;
    this.friction = friction;
    
    this.channelVolume = -10; // default gain of each particle
    this.isAlive = true; // boolean that keeps track of whether the particle is alive
  
    this.freq = Tone.Midi(pitch).toFrequency(); //takes the midi note # and converts it to frequency in hertz.
    this.filter = new Tone.Filter({ // define filter. cutoff is changed in draw()
      "type" : "lowpass" ,
      "frequency" : 100 ,
      "rolloff" : -12 ,
      "Q" : 1 ,
      "gain" : 0
      });
    this.channel = new Tone.Channel(); // define channel strip
    this.filter.connect(this.channel); // connect the filter to the chanel strip
    this.makeSynth(); // create a Tone.js synth
    this.playing = false; // is it playing?

    this.bodyOptions = { // physics body options, controllable in GUI
      restitution: this.bounciness,
      friction: this.friction,
      density: 1
    }
  
    this.body = Bodies.polygon(x, y, 3, r, this.bodyOptions); // creates the Body in Matter.js
    this.body.label = "particle"; // gives it the label "particle"
    World.add(world, this.body); // adds it to the world

    //console.log(this.getVel(this.body));
    this.hue = map(this.pitch % 12, 0, 12, 0, 255);
    this.saturation = 100;
    this.brightness = map(this.pitch, 24, 80, 0, 255);
  }

  getVel(body){ // returns the current absolute velocity of the particle
    var vel = body.velocity;
    return abs(round(vel.x,3))+abs(round(vel.y,3));
  }

  makeSynth(){ // setup synthesizer object
    this.synth = new Tone.Synth({
      "oscillator" : {
				"type" : this.waveform
      },
      "envelope" : {
				"attackCurve" : "exponential",
				"attack" : 0.05,
				"decay" : 0.4,
				"sustain" : 0.1,
				"release" : 0.8,
      }
    });
    this.synth.connect(this.filter); // and connect its output to the filter
  }

  playOscillator() { // trigger the ADSR, this is what's called when the particle collides
    this.synth.triggerAttackRelease(this.freq, "16n");
    this.playing = true;
  }

  show() { // how the particles are displayed
    var pos = this.body.position;
    colorMode(HSB,255,255,255,100);
    fill(this.hue, 200, this.brightness, this.life);
    noStroke();
    push();
    translate(pos.x, pos.y);
    rotate(this.body.angle - PI);
    fill(this.hue, 200, this.brightness, this.life);
    polygon(0, 0, this.r, 3); // here's that polygon function from earlier in action.
    pop();
  }

  live() { // increments the 'life' value of the particle down by 1 each frame. 
    this.life -= 1;
    this.channel.volume.value = map(this.life,0,this.lifespan,-35,-6); //maps how much life the particle has to its gain.
  }

  die() { // particle dies. Tone obejcts are deleted to conserve memory
    this.playing = false;
    this.synth.dispose();
    this.filter.dispose();
    this.channel.dispose();
  }
}
// now check out particleDrum.js
