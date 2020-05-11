class Particle {
  constructor(x, y, r, pitch, waveform, lifespan, bounciness, friction) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.channelVolume = -10;
    this.isAlive = true;
    this.lifespan = lifespan
    this.life = lifespan;
    this.pitch = pitch;
    this.waveform = waveform;
    this.bounciness = bounciness;
    this.friction = friction;
    
    this.freq = Tone.Midi(pitch).toFrequency();
    this.filter = new Tone.Filter({
      "type" : "lowpass" ,
      "frequency" : 100 ,
      "rolloff" : -12 ,
      "Q" : 1 ,
      "gain" : 0
      });
    this.channel = new Tone.Channel();
    this.filter.connect(this.channel);
    this.makeSynth();
    this.playing = false;

    this.bodyOptions = {
      restitution: this.bounciness,
      friction: this.friction,
      density: 1
    }
    
    this.body = Bodies.polygon(x, y, 3, r, this.bodyOptions);
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

  makeSynth(){
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
    this.synth.connect(this.filter);
  }

  playOscillator() {
    this.synth.triggerAttackRelease(this.freq, "16n");
    //this.channelVolume = map(this.life,0,300,-100,-10);
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
    //ellipse(0, 0, this.r * 2);
    fill(this.hue, 200, this.brightness, this.life);
    polygon(0, 0, this.r, 3);
    pop();
  }

  live() {
    this.life -= 1;
    this.channel.volume.value = map(this.life,0,this.lifespan,-35,-6);
  }

  die() {
    this.playing = false;
    this.synth.dispose();
    this.filter.dispose();
    this.channel.dispose();
  }

  isOffScreen() {
    var x = this.body.position.x;
    var y = this.body.position.y;
    return (x < -50 || x > width + 50 || y > height);
  }
}