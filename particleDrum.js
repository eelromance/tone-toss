class ParticleDrum {
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
      
      //this.body = Bodies.polygon(x, y, 3, r, this.bodyOptions);
      this.body = Bodies.circle(x, y, r, this.bodyOptions);
      this.body.label = "particle";
      World.add(world, this.body);
  
      //console.log(this.getVel(this.body));
      this.hue = map(this.pitch % 12, 0, 12, 0, 255);
      this.saturation = 100;
      this.brightness = map(this.pitch, 24, 80, 0, 255);
    }
  
    getVel(body){
      var vel = body.velocity;
      return abs(round(vel.x,3))+abs(round(vel.y,3));
    }
  
    makeSampler(){
      this.sampler = new Tone.Sampler({
        "C4" : "samples/kick.wav",
        "D4" : "samples/snare.wav",
        "E4" : "samples/rim.wav",
        "F4" : "samples/hatc.wav",
        "G4" : "samples/hato.wav",
        "A4" : "samples/tomlo.wav",
        "B4" : "samples/tomhi.wav",
      });
      this.sampler.connect(this.filter);
    }
  
    playOscillator(){
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
      //fill(this.hue, 200, this.brightness, this.life);
      //polygon(0, 0, this.r, 3);
      pop();
    }
  
    live() {
      this.life -= 0.25;
      this.channel.volume.value = map(this.life,0,300,-25,-10);
    }
  
    die() {
      this.playing = false;
      //this.synth.dispose();
      this.sampler.dispose();
      this.filter.dispose();
      this.channel.dispose();
    }
  
    isOffScreen() {
      var x = this.body.position.x;
      var y = this.body.position.y;
      return (x < -50 || x > width + 50 || y > height);
    }
  }