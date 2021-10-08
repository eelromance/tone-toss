class Boundary {
  constructor(x, y, w, h,){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    var options = {
      isStatic: true
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.body.label = "boundary";
    World.add(world, this.body);
  }
  show(){
  colorMode(HSB);
  fill(250, 50, 20);
  var pos = this.body.position;
  push();
  translate(pos.x, pos.y);
  rectMode(CENTER);
  rect(0, 0, this.w, this.h);
  pop();
  }
}