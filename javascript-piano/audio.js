var debugVar=1109;
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

//https://stackoverflow.com/questions/14575697/math-pow-with-negative-numbers-and-non-integer-powers
function checkRoot(x, y) {
    if (x > 0) {
        return Math.pow(x, y)
    }
    return -1 * Math.pow(-x, y)
}

function muffleHighPitch(myfreq){
    //max 2, min 1 to avoid clipping with buxian2voice
    //max 1.2 for full flute sine wave

    //return 1; //i give up, i forget how i did it, probably in prev. commit
    //console.log(myfreq);
    //return 1/Math.pow(myfreq,0.5); //-1+2/(Math.pow(myfreq,myfreq)); //pemdas
    //return (2-checkRoot(myfreq-440,1/3)/440);//2021
    //return Math.max(2,Math.min(1,(1.5-checkRoot(myfreq-440,1/3))));//2021
    //Math.max(2,Math.min(1,(440-Math.pow(myfreq-110,1/3))));//2021
    //return Math.min(1,(110*440/Math.pow(myfreq,2))); //2020
    return Math.min(1,(110*440/Math.pow(myfreq,1.5))); //2021
    //^for some reason, a specific note sounded quieter,
    // must've been canceled out by my fan noise
    //vol. adjust. more noticeable with saw wave
} //ZW: must be <= 1 and >= -1 so as not to produce errors in the function that calls volume, but not 0
//in decibals?, so can be as low as negative 1.

//even if this is overwritten it may not be loaded into the key pitches
var transpose=0; //by half-steps //zw

/*! Copyright (c) 2013 - Peter Coles (mrcoles.com)
 *  Licensed under the MIT license: http://mrcoles.com/media/mit-license.txt
 */
function startAudio() {

    // test if we can use blobs
    var canBlob = false;
    if (window.webkitURL && window.Blob) {
        try {
            new Blob();
            canBlob = true;
        } catch(e) {}
    }

    function asBytes(value, bytes) {
        // Convert value into little endian hex bytes
        // value - the number as a decimal integer (representing bytes)
        // bytes - the number of bytes that this value takes up in a string

        // Example:
        // asBytes(2835, 4)
        // > '\x13\x0b\x00\x00'
        var result = [];
        for (; bytes>0; bytes--) {
            result.push(String.fromCharCode(value & 255));
            value >>= 8;
        }
        return result.join('');
    }

    function attack(i) {
        return i < 200 ? (i/200) : 1; //jon: time for soundwaves
//	return 1; //skype zoom call
	//return i > -200 ? (i/200) : 1; //jon: time for soundwaves
    }

    var DataGenerator = $.extend(function(styleFn, volumeFn, cfg) {
        cfg = $.extend({
            freq: 440,
            volume: 32767, //zw edited
            sampleRate: 11025, // Hz
            seconds: 1,//.5,//jon doubled time for jon's flute really
            channels: 1
        }, cfg);

        var data = [];
        var maxI = cfg.sampleRate * cfg.seconds;
        for (var i=0; i < maxI; i++) {
            for (var j=0; j < cfg.channels; j++) {
                data.push(
                    asBytes(
                        volumeFn(
                            styleFn(cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI),
                            cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI
                        )//* attack(Math.abs(i-maxI*.5)),//jon Zoom call
			//* attack(maxI*.5-Math.abs(i-maxI*.5)),//jon flouting try
			//* attack(i-maxI*.5),// //jon phaser
			 *attack(i), //original
			2
                    )
                );
            }
        }
        return data;
    }, {
        style: {
	    buxianVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x3+x2+x1)/2; 
            },
	    buxian2Voice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x4=Math.sin((2 * Math.PI) * (i / sampleRate) * 4*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x3+x4+x2+x1)/5; 
            },

	    
	    rapunzelVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x2+x1)/2; 
            },
	    
	    erhuVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x4=Math.sin((2 * Math.PI) * (i / sampleRate) * 4*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x5+x4+x2+x1)/6; 
            },
	    
	    
	    //good for flute, sine, OG
	    wave: function(freq, volume, i, sampleRate, seconds) {
                // wave
                // i = 0 -> 0
                // i = (sampleRate/freq)/4 -> 1
                // i = (sampleRate/freq)/2 -> 0
                // i = (sampleRate/freq)*3/4 -> -1
                // i = (sampleRate/freq) -> 0
                return Math.sin((2 * Math.PI) * (i / sampleRate) * freq);
            },

	    //desktop limit
	    
	    madokaVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x1+x7)/2; 
            },

	    //needs low vol. to not clip
	    girlVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x5+x1)/2;// /4; 
            },
	    kidVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x3+x1)/4; 
            },

	    	    //https://blog.timesunion.com/womenatwork/is-your-voice-holding-you-back/2531/
	    //keep going octave lower than the manly voice, it gets 'higher'
	    //and smoother
	    womanVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x3+x1); 
            },

	    	    //keep going octave lower than the manly voice, it gets 'higher'
	    //and smoother
	    nasalVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x5)/2; 
            },

	    //human
	    //https://physics.stackexchange.com/questions/240106/how-is-a-human-voice-unique
	    manVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x5+x3+x1)/5; 
            },

	    //laughing woman
	    BFFVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x5+x3+x1)/2; 
            },


	    //OG
	    squareWave: function(freq, volume, i, sampleRate, seconds, maxI) {
                // square
                // i = 0 -> 1
                // i = (sampleRate/freq)/4 -> 1
                // i = (sampleRate/freq)/2 -> -1
                // i = (sampleRate/freq)*3/4 -> -1
                // i = (sampleRate/freq) -> 1
                var coef = sampleRate / freq;
                return (i % coef) / coef < .5 ? 1 : -1;
            },

	    //go octave lower than manly for smooth flute
	    fluteVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x3+x1)/2; 
            },
	    
	    ghostVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x3+x5)/2; 
            },

	    
	    purrManVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);

		//sawing
	     var coef = 9*sampleRate / freq;
                return -1 + (x7+x3+x2+x1) * ((i % coef) / coef)/4;

		
            },

	    
	    trollolVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x7+x5+x3+x2+x1)/4; 
            },
	    
            triangleWave: function(freq, volume, i, sampleRate, seconds, maxI) {
                return Math.asin(Math.sin((2 * Math.PI) * (i / sampleRate) * freq));
            },
            sawtoothWave: function(freq, volume, i, sampleRate, seconds, maxI) {
                // sawtooth
                // i = 0 -> -1
                // i = (sampleRate/freq)/4 -> -.5
                // i = (sampleRate/freq)/2 -> 0
                // i = (sampleRate/freq)*3/4 -> .5
                // i = (sampleRate/freq) - delta -> 1
                var coef = sampleRate / freq;
                return -1 + 2 * ((i % coef) / coef);
            },

	    
	    //dizi scale based test
	    droneVoice: function(freq, volume, i, sampleRate, seconds) {
                // sine waves layered
		var x8=Math.sin((2 * Math.PI) * (i / sampleRate) * 8*freq);
		var x6=Math.sin((2 * Math.PI) * (i / sampleRate) * 6*freq);
		var x10=Math.sin((2 * Math.PI) * (i / sampleRate) * 10*freq);
		var x9=Math.sin((2 * Math.PI) * (i / sampleRate) * 9*freq);
		var x7=Math.sin((2 * Math.PI) * (i / sampleRate) * 7*freq);
		var x5=Math.sin((2 * Math.PI) * (i / sampleRate) * 5*freq);
		var x4=Math.sin((2 * Math.PI) * (i / sampleRate) * 4*freq);
		var x3=Math.sin((2 * Math.PI) * (i / sampleRate) * 3*freq);
		var x2=Math.sin((2 * Math.PI) * (i / sampleRate) * 2*freq);
		var x1=Math.sin((2 * Math.PI) * (i / sampleRate) * 1*freq);
		return (x10+x8+x6+x5+x3+x1)/6; 
            },
	    
	    metalTriangleInstrument: function(freq, volume, i, sampleRate, seconds) {
		return Math.sin((2 * Math.PI) * (Math.sin(i) / sampleRate) * freq);
            },
        },
        volume: {
	    

	    //hourglass volume
            trippyFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    maxI-Math.abs((maxI*0.5)-i,2) *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    fluteFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    (maxI-Math.abs((maxI*0.5)-i,2))/maxI *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    voiceFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    (maxI-Math.abs((maxI*0.5)-i-maxI/3,2))/maxI *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    fullFluteFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    (maxI-Math.abs((maxI*0.5)-i)*2)/maxI *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    flat: function(data, freq, volume) {
		var output=(volume*muffleHighPitch(freq)) * data; //zw //reduces volume of higher pitches
		if(output>0)
		    debugVar=output;
		return output;
            },
	    flatOG: function(data, freq, volume) {
		var output=(volume) * data; //zw //reduces volume of higher pitches
		if(output>0)
		    debugVar=output;
		return output;
            },
            linearFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//Note: freq is not the frequency of the note being played but rather the base (or top?) frequency of the 2 to 3 octaves being shown on the piano image, such as 1108.73something
		var output=(volume*muffleHighPitch(freq)) * ((maxI - i) / maxI) * data;
		//output=(volume*(110*440/freq/freq)) * ((maxI - i) / maxI) * data;
		//output=(volume*(1108/freq)) * ((maxI - i) / maxI) * data;
		//output=(volume*(1)) * ((maxI - i) / maxI) * data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
		//ZW: for cool effect, use this instead
		// return (volume*(440/freq^2)) * ((maxI - i) / maxI) * data;
		//I realize my mistake now, should be Math.pow instead of ^2
            },
            
	    reverseLinear: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		var output=(volume*muffleHighPitch(freq)) * ((i) / maxI) * data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    quadraticFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
                // y = -a(x - m)(x + m); and given point (m, 0)
                // y = -(1/m^2)*x^2 + 1;
                return (volume*muffleHighPitch(freq)) * ((-1/Math.pow(maxI, 2))*Math.pow(i, 2) + 1) * data;
            },
	    //desktop can see up to this point
	    
            
	    //hourglass, do not eat
	    oxalateFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    (+Math.abs((maxI*0.5)-i)*2)/maxI *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    //on mobile can see up to this far, farther than desk 
	    
	    loudOceanFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    Math.pow((maxI*0.5)-i,2) *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    organFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		var output=(volume*muffleHighPitch(freq)) * ((maxI - .5*(i-.5)) / maxI) * data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
	    
	    marioFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
		//console.log("i is "+i);
		var output=volume*muffleHighPitch(freq) *
		    maxI*0.5-Math.pow((maxI*0.5)-i,2) *
		    data;
		if(freq<debugVar)
		    debugVar=freq;
		//console.log(output);
                return output;
            },
        }
    });
    DataGenerator.style.default = DataGenerator.style.wave;//wave;//original and ancient sine wave for flute
    DataGenerator.style.default = DataGenerator.style.squareWave;//wave;//jon for high volume (nice for seamless app switching without changing volume)
    DataGenerator.style.default = DataGenerator.style.rapunzelVoice;//tangled
    DataGenerator.style.default = DataGenerator.style.buxian2Voice;//Buxian by SING女团
    
    DataGenerator.volume.default = DataGenerator.volume.linearFade;
    DataGenerator.volume.default = DataGenerator.volume.fullFluteFade;//jon

    function toDataURI(cfg) {

        cfg = $.extend({
            channels: 1,
            sampleRate: 11025, // Hz
            bitDepth: 16, // bits/sample
            seconds: .5,
            volume: 20000,//32767,
            freq: 440
        }, cfg);

        //
        // Format Sub-Chunk
        //

        var fmtChunk = [
            'fmt ', // sub-chunk identifier
            asBytes(16, 4), // chunk-length
            asBytes(1, 2), // audio format (1 is linear quantization)
            asBytes(cfg.channels, 2),
            asBytes(cfg.sampleRate, 4),
            asBytes(cfg.sampleRate * cfg.channels * cfg.bitDepth / 8, 4), // byte rate
            asBytes(cfg.channels * cfg.bitDepth / 8, 2),
            asBytes(cfg.bitDepth, 2)
        ].join('');

        //
        // Data Sub-Chunk
        //

        var sampleData = DataGenerator(
            cfg.styleFn || DataGenerator.style.default,
            cfg.volumeFn || DataGenerator.volume.default,
            cfg);
        var samples = sampleData.length;

        var dataChunk = [
            'data', // sub-chunk identifier
            asBytes(samples * cfg.channels * cfg.bitDepth / 8, 4), // chunk length
            sampleData.join('')
        ].join('');

        //
        // Header + Sub-Chunks
        //

        var data = [
            'RIFF',
            asBytes(4 + (8 + fmtChunk.length) + (8 + dataChunk.length), 4),
            'WAVE',
            fmtChunk,
            dataChunk
        ].join('');

        if (canBlob) {
            // so chrome was blowing up, because it just blows up sometimes
            // if you make dataURIs that are too large, but it lets you make
            // really large blobs...
            var view = new Uint8Array(data.length);
            for (var i = 0; i < view.length; i++) {
                view[i] = data.charCodeAt(i);
            }
            var blob = new Blob([view], {type: 'audio/wav'});
            return  window.webkitURL.createObjectURL(blob);
        } else {
            return 'data:audio/wav;base64,' + btoa(data);
        }
    }

    function noteToFreq(stepsFromMiddleC) { //A is 440
        return 440 * Math.pow(2, (stepsFromMiddleC+3+transpose)/numNotesInOctave);//12);
    }

    var Notes;
    function initNotes(){
	Notes = {
            sounds: {},
            getDataURI: function(n, cfg) {
		cfg = cfg || {};
		cfg.freq = noteToFreq(n);
		return toDataURI(cfg);
            },
            getCachedSound: function(n, data) {
		var key = n, cfg;
		if (data && typeof data == "object") {
                    cfg = data;
                    var l = [];
                    for (var attr in data) {
			l.push(attr);
			l.push(data[attr]);
                    }
                    l.sort();
                    key += '-' + l.join('-');
		} else if (typeof data != 'undefined') {
                    key = n + '.' + key;
		}

		var sound = this.sounds[key];
		if (!sound) {
                    sound = this.sounds[key] = new Audio(this.getDataURI(n, cfg));
		}
		return sound;
            },
            noteToFreq: noteToFreq
	};
    }
    initNotes();
    
    window.DataGenerator = DataGenerator;
    window.Notes = Notes;
}
startAudio();
