WebMidi.enable(function(err) {
  var midiLog = true;
    //Choose an input port
  inputMidi = WebMidi.inputs[1];

  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
  }

  //name our visible MIDI input and output ports
  if (midiLog){
  console.log("---");
  console.log("Inputs Ports: ");
  for (i = 0; i < WebMidi.inputs.length; i++) {
    console.log(i + ": " + WebMidi.inputs[i].name);
    midiInputs.push(i + ": " + WebMidi.inputs[i].name);
  }

  console.log("---");
  console.log("Output Ports: ");
  for (i = 0; i < WebMidi.outputs.length; i++) {
    console.log(i + ": " + WebMidi.outputs[i].name);
  }
}
  //listen to all incoming "note on" input events
  inputMidi.addListener('noteon', "all",
    function(e) {
      //console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ") "+ e.note.number +".");
      //particles.push(new Particle(random(0, width), 200, random(40, 55), e.note.number));
      newParticle(e.note.number)
    }
  );
});