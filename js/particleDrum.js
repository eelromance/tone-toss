class ParticleDrum { //most things are the same here as in particle.js
    constructor(x, y, r, pitch, lifespan, bounciness, friction) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.channelVolume = -10;
      this.isAlive = true;
      this.lifespan = lifespan
      this.life = lifespan;
      this.pitch = pitch;
      this.bounciness = bounciness;
      this.friction = friction;
      
      this.freq = Tone.Midi(pitch).toFrequency();
      this.filter = new Tone.Filter(10000,"lowpass");
      this.channel = new Tone.Channel();
      this.filter.connect(this.channel);
      this.makeSampler();
      this.playing = false;
  
      this.bodyOptions = {
        restitution: this.bounciness,
        friction: this.friction,
        density: 1
      }
      
      this.body = Bodies.circle(x, y, r, this.bodyOptions); // except this time the bodies are circular
      this.body.label = "particle";
      World.add(world, this.body);

      this.hue = map(this.pitch % 12, 0, 12, 0, 255);
      this.saturation = 100;
      this.brightness = map(this.pitch, 24, 80, 0, 255);
    }
  
    getVel(body){
      var vel = body.velocity;
      return abs(round(vel.x,3))+abs(round(vel.y,3));
    }
  
    makeSampler(){ // and instead of a synth we have a sampler
      this.sampler = new Tone.Sampler({
        "C4" : "samples/snare.wav", // the filepaths of each drum sample
        "D4" : "samples/02.mp3", // and the notes their assigned to
        "D#4" : "samples/CP.wav",
        "E4" : "samples/Claves.wav",
        "F4" : "samples/mammut3.wav",
        "G4" : "samples/04.mp3",
        "G#4" : "samples/rim.wav",
        "A4" : "samples/06.mp3",
        "A#4" : "samples/scratch.wav",
        "B4" : "samples/whoomp.wav",
        "C#4" : "samples/CB0.WAV",
      });
      this.sampler.volume.value = -20;
      this.sampler.connect(this.channel);
    }
  
    playOscillator(){ // this functions name is misleading now since we're really triggering a sample, i kept it the same so it works in either voice mode.
      if (this.sampler.loaded){
      this.sampler.triggerAttackRelease(this.freq, "16n");
      }
      this.playing = true;
    }
  
    show() {
      var pos = this.body.position;
      colorMode(HSB,255,255,255,100);
      fill(this.hue, 200, this.brightness, this.life);
      noStroke();
      push();
      translate(pos.x, pos.y);
      rotate(this.body.angle - PI);
      ellipse(0, 0, this.r * 2);
      pop();
    }
  
    live() {
      this.life -= 0.25;
      this.channel.volume.value = map(this.life,0,300,-25,-10);
    }
  
    die() {
      this.playing = false;
      this.sampler.dispose();
      this.filter.dispose();
      this.channel.dispose();
    }
  }
