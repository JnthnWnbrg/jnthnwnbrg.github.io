var utf_length = 8; //8 for english and chinese etc., 16, 32
var volume = 0.25;
var audioContext = null;
var unlocked = false;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote=0;        // What note is currently last scheduled?
var tempo = 120.0;          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // length of "beep" (in seconds)
var canvas,                 // the canvas element
    canvasContext;          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages

var string = "Hello World! from metronome.js";
var bit=0;
function loadText() {
    string = document.getElementById("setmytext").value;
    console.log("string is "+string);
}

function loadBookmark() {
    current16thNote = Number(document.getElementById("bookmark").value);
    console.log("bookmark is "+current16thNote);
}

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, do NOT wrap to zero
    //if (current16thNote == 16) {
    //    current16thNote = 0;
    //}
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: (beatNumber % 16), time: time } );

    if ( (noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes

    // create an oscillator and gainNode
    var osc = audioContext.createOscillator();
    var gainNode = audioContext.createGain();

    // connect oscillator to gain node to speakers
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    var thisCharacter = string.charAt(beatNumber/utf_length);
    bit = 1 & ((string.charCodeAt(beatNumber/utf_length)) >> (beatNumber%utf_length)); //LSB first
    
    if (beatNumber % utf_length === 0) {   // beat 0 == high pitch
	console.log("beatNumber % utf_length === 0");
	console.log("thisCharacter is '" + thisCharacter + "' ");
	console.log("binary: " + (string.charCodeAt(beatNumber/utf_length)).toString(2));
	document.getElementById("output").innerHTML+=thisCharacter;
	document.getElementById("progress").innerHTML= ""+current16thNote;
	if(thisCharacter==="") {
	    //end of file
	    console.log("end of file, repeat");
	    //document.write("thisCharacter is "+thisCharacter);
	    document.getElementById("output").innerHTML+="repeat. current16thNote is "+current16thNote;
	    //if(beatNumber!=0){
	//	beatNumber=0;
	    //  }
	    current16thNote=0;// -1; //so not to skip first bit but might be messing up sync
	}
    }
    if (beatNumber % 16 === 0) {   // beat 0 == high pitch
	console.log("beatNumber % 16 === 0");
	//document.write("a");
	//document.getElementById("output").innerHTML+="writing to output";
    }
    // console.log(bit);
    if (bit)
	osc.frequency.value = 880.0; //A5
    else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
        osc.frequency.value = 440.0; //440.0 Hertz is A4 on the piano
    else                        // other 16th notes = low pitch
        osc.frequency.value = 220.0;

    // increase volume for lower pitches
    gainNode.gain.value = volume*gainNode.gain.value*(880/osc.frequency.value);

    osc.start( time );
    osc.stop( time + noteLength );
}

function scheduler() {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
}

function play() {
    if (!unlocked) {
      // play silent buffer to unlock the audio
      var buffer = audioContext.createBuffer(1, 1, 22050);
      var node = audioContext.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      unlocked = true;
    }

    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        
        nextNoteTime = audioContext.currentTime;
        timerWorker.postMessage("start");
        return "stop";
    } else {
        timerWorker.postMessage("stop");
        return "play";
    }
}

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0); 
}

function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = audioContext.currentTime;

    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
    }

    // We only need to draw if the note has moved.
    if (last16thNoteDrawn != currentNote) {
        var x = Math.floor( canvas.width / 18 );
        canvasContext.clearRect(0,0,canvas.width, canvas.height); 
        for (var i=0; i<8; i++) {
            canvasContext.fillStyle = ( currentNote == i ) ? 
                ((bit/*currentNote%4 === 0*/)?"red":"blue") : "black";
            canvasContext.fillRect( x * (i+1), x, x/2, x/2 );
        }
for (var i=8; i<16; i++) {
            canvasContext.fillStyle = ( currentNote == i ) ? 
                ((bit/*currentNote%4 === 0*/)?"red":"blue") : "black";
            canvasContext.fillRect( x * (i+1), x*3, x/2, x/2 );
        }
        last16thNoteDrawn = currentNote;
    }

    // set up to draw again
    requestAnimFrame(draw);
}

function init(){
    var container = document.createElement( 'div' );
	document.getElementById("output").innerHTML+=document.lastModified+" is metronome.js last modified. \n";
    container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    document.body.appendChild( container );
    container.appendChild(canvas);    
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;

    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    audioContext = new AudioContext();

    // if we wanted to load audio files, etc., this is where we should do it.

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    requestAnimFrame(draw);    // start the drawing loop.

    timerWorker = new Worker("js/metronomeworker.js");

    timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
            // console.log("tick!");
            scheduler();
        }
        else
            console.log("message: " + e.data);
    };
    timerWorker.postMessage({"interval":lookahead});
}

window.addEventListener("load", init );

