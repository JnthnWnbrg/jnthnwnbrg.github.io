/*! Copyright (c) 2013 - Peter Coles (mrcoles.com)
 *  Licensed under the MIT license: http://mrcoles.com/media/mit-license.txt
 */

var tremelo=true;//false
//line moved slightly higher for global access
var notesOffset = 0;//use for transpose

//2 lines from below
var notesShift = -12; //can be reset
var downKeys = {};

//(function() {//commented out by jon to be able to transpose with buttons

    //
    // Setup keys!
    //


    
    var blackKeys = {
        1: 1,
        3: 3,
        6: 1,
        8: 2,
        10: 3
    };
    $.each(blackKeys, function(k, v) {
        blackKeys[k] = ' black black'+v; //zw
    });

    function blackKeyClass(i) {
        return blackKeys[(i % 12) + (i < 0 ? 12 : 0)] || '';
    }

    var $keys = $('<div>', {'class': 'keys'}).appendTo('#piano');

    var buildingPiano = false;

    var isIos = navigator.userAgent.match(/(iPhone|iPad)/i);

    function buildPiano() {
        if (buildingPiano) return;
        buildingPiano = true;

        $keys.trigger('build-start.piano');
        $keys.empty().off('.play');

        function addKey(i) {
            var dataURI = isIos ? '' : Notes.getDataURI(i);

            // trick to deal with note getting hit multiple times before finishing...
            var sounds = [
                new Audio(dataURI),
                new Audio(dataURI),
                new Audio(dataURI)
            ];
            var curSound = 0;
            var pressedTimeout;
            dataURI = null;
            function play(evt) {
                // sound
                sounds[curSound].pause();
                try {
                    sounds[curSound].currentTime = 0.001; //HACK - was for mobile safari, but sort of doesn't matter...
                } catch (x) {
                    console.log(x);
                }
                sounds[curSound].play();
                curSound = ++curSound % sounds.length;

                var $k = $keys.find('[data-key='+i+']').addClass('pressed');

                //TODO - it'd be nice to have a single event for triggering and reading
                $keys.trigger('played-note.piano', [i, $k]);

                // visual feedback
                window.clearTimeout(pressedTimeout);
                pressedTimeout = window.setTimeout(function() {
                    $k.removeClass('pressed');
                }, 200);
            }
            $keys.on('note-'+i+'.play', play);
            var $key = $('<div>', {
                'class': 'key' + blackKeyClass(i),
                'data-key': i,
                mousedown: function(evt) { $keys.trigger('note-'+i+'.play'); }
            }).appendTo($keys);
        }

        // delayed for-loop to stop browser from crashing :'(
        // go slower on Chrome...
        var i = -12, max = 14, addDelay = /Chrome/i.test(navigator.userAgent) ? 80 : 0;
        (function go() {
            addKey(i + notesOffset);
            if (++i < max) {
                window.setTimeout(go, addDelay);
            } else {
                buildingPiano = false;
                $keys.trigger('build-done.piano');
            }
        })();
    }

    buildPiano();


    //
    // Setup synth controls
    //

    function camelToText(x) {
        x = x.replace(/([A-Z])/g, ' $1');
        return x.charAt(0).toUpperCase() + x.substring(1);
    }

    $.each(['volume', 'style'], function(i, setting) {
        var $opts = $('<div>', {
            'class': 'opts',
            html: '<p><strong>' + camelToText(setting) + ':</strong></p>'
        }).appendTo('#synth-settings');

        $.each(DataGenerator[setting], function(name, fn) {
            if (name != 'default') {
                $('<p>')
                    .append($('<a>', {
                        text: camelToText(name),
                        href: '#',
                        'class': fn === DataGenerator[setting].default ? 'selected' : '',
                        click: function(evt) {
                            evt.preventDefault();
                            DataGenerator[setting].default = fn;
                            buildPiano();
                            var $this = $(this);
                            $this.closest('.opts').find('.selected').removeClass('selected');
                            $this.addClass('selected');
                        }
                    }))
                    .appendTo($opts);
            }
        });
    });


    //code chunk moved to index.html

    //2 lines moved up

    function isModifierKey(evt) {
        return evt.metaKey || evt.shiftKey || evt.altKey;
    }

transcript="";
    $(window).keydown(function(evt) {
        var keyCode = evt.keyCode;
        // prevent repeating keys
        if (//!downKeys[keyCode] && //jon commented out
	    !isModifierKey(evt)) {
	    //console.log("downKeys[keyCode] "+downKeys[keyCode])
	    if (!downKeys[keyCode]
		|| (downKeys[keyCode]>=8 && tremelo) //jon for tremelo
		//|| true
	       ){
		//console.log("key "+keyCode) //jon
		downKeys[keyCode] = 1;
		var key = keyNotes[keyCode];
		if (typeof key != 'undefined') {
                    $keys.trigger('note-'+(key+notesShift+notesOffset)+'.play');
                    evt.preventDefault();
		    //doesn't seem to make a noticeable difference? -jon

		    console.log('note '+(key+notesShift+notesOffset)) //jon
		    transcript+='[4,'+(key+notesShift+notesOffset)+'],'
		} else if (evt.keyCode == 188) { // , is 188 //up is 38
                    notesShift = -12;
		} else if (evt.keyCode == 190) { //190 is . // down is 40
                    notesShift = 0;
		} else if (keyCode == 37 || keyCode == 39) {//left right
                    notesOffset += (keyCode == 37 ? -1 : 1) * 12;
                    buildPiano();
		}
		else if (keyCode == 78) {//N
                    notesOffset = (notesOffset+1)%12;
                    buildPiano();
		}
	    }//else{
		downKeys[keyCode]++;//jon
	    //}
        }
    }).keyup(function(evt) {
        delete downKeys[evt.keyCode];//lags for tremelo but need for chords
    });


    //
    // Piano colors
    //

    var colors = 'fff f33 33f 3f3 ff3 f3f 3ff'.split(' '),
        curColor = 0;

    function colorHandler(evt) { //` is 192 //c is 67
        if (evt.type === 'click' || (evt.keyCode == 192 && !isModifierKey(evt))) {
            if (++curColor >= colors.length) curColor = 0;
            document.getElementById('piano').style.backgroundColor = '#' + colors[curColor];
        }
    }

    $(window).keyup(colorHandler);
    $('.toggle-color').click(colorHandler);

    //
    // Help controls
    //

    var $help = $('.help');

    $(window).click(function(evt) {
        var $closestHelp = $(evt.target).closest('.help');
        if (!((evt.target.nodeName == 'A' || ~evt.target.className.search('hold')) && $closestHelp.length) &&
            ($closestHelp.length || $help.hasClass('show'))) {
            $help.toggleClass('show');
        }
    });

    var qTimeout, qCanToggle = true; //zw
    $(window).keypress(function(evt) {
        // trigger help when ? is pressed, but make sure it doesn't repeat crazy
        if (evt.which == 63 || evt.which == 77) { //m is 77 //0 is 48 // esc is 27 // / is 191 // shift is 16
            window.clearTimeout(qTimeout);
            qTimeout = window.setTimeout(function() {
                qCanToggle = true;
            }, 1000);
            if (qCanToggle) {
                qCanToggle = false;
                $help.toggleClass('show');
            }
        }
    });

    window.setTimeout(function() {
        $help.removeClass('show');
    }, 700);

    // prevent quick find...
    $(window).keydown(function(evt) {
        if (evt.target.nodeName != 'INPUT' && evt.target.nodeName != 'TEXTAREA') {
            if (evt.keyCode == 222 ||evt.keyCode==191) {
		//222 is Grave,
		//191 is forward slash (/ which is quickfind on firefox)
		//jon added 191
                evt.preventDefault();
                return false;
            }
        }
        return true;
    });

    //
    // Scroll nav
    //
    $.each([['#info', '#below'], ['#top', '#content']], function(i, x) {
        $(x[0]).click(function() {
            $('html,body').animate({
                scrollTop: $(x[1]).offset().top
            }, 1000);
        });
    });


var slowFactor=1;//1.5; //1 for desktop,1 for mobile Chrome
//1 on mobile DuckDuckGo gets muted sometimes, maybe try 2
//increase for teaching

//jon's simplified The Untamed cover for bamboo flute scale
var wuji=(function() {
    slowFactor=2; //messes up speed for other demos even if you don't call this
    var data = [  {
                    'style': 'wave',
                    'volume': 'linearFade',
                    'notesOffset': 0 //so that 0 is C
                }
               ];
    var staggeredDescent=[[8*2+4,3],[8*2,-1],[4*2,-4],[4*2,-2],[4*2,-6],[4*2,-9]]
    data.push.apply(data,staggeredDescent)
    data.push([4*4,-4],[4*2,-2],[4,-1],[4,1],[4*2,-6],[4*2,-4],[4*2])
    data.push.apply(data,staggeredDescent)
    data.push([4*4,-4],[4*4,1],[4,-1],[4,-2],[4,-1],[4,-2],[4])
    return data;
})();

//jon's globally callable demo for console (made other demos global too)
//Bad Apple!! by Zun but it can be totally in key like a bamboo flute,
//unlike the original which has an extra sharp
var sharpApple=1;//1 for original ("musically dark"), 0 for in-key

function initBadAppleDemo() {//jon
    slowFactor=1.2;//a little slower for the remix
	    var data = [
                {
                    'style': 'wave',
                    'volume': 'linearFade',
                    'notesOffset': 0 //so that 0 is C
                }
            ];

	crescendo=[
	    [4, 8-12],
	    //1st value is wait time before playing note, 2nd and 3rd values are notes
                [8-4, 10-12], //8 wait is half note at 120 bpm
		[4,11-12],[4,13-12],[4,15-12],
	]
	data=data.concat(crescendo); 
    
	//each measure, 1st values should add up to mult of 16 if 16th notes
	var verseDive=[ 
                [4+4,20-12],[4,18-12],[4,15-12],[8,-4], //[0,8], //chord test
		[8,3],[4,1],[4,-1],[4,-2],
	];
    data=data.concat(verseDive);
	data=data.concat(crescendo); 
    data.push([8,1],[4,-1],[4,-2],[4,-4],[4,-2],[4,-1],[4,-2],[4,-4],
	      [4,-6+sharpApple],
	      [4,-2],//-4], //-4 sounds ok without sharp 
	     );
    data=data.concat(crescendo); 
    data=data.concat(verseDive);
    data=data.concat(crescendo); 
    data.push([8,1],[4,-1],[4,-2],[8,-1],[8,1],[8,3],[4],);//2nd to last one not sure
    var uselessTime=[[4,6],[4,8],[4,3],[4,1],[4,3],
		     [8,1],[4,3],[4,6],[4,8],[4,3],
		     [4,1],[4,3],
		     [8,1],
		     [4,3],[4,1],[4,-1],[4,-2],
		     [4,-6],[4,-4],
		     [8,-4],[4,-4],[4,-4],[4,-2],[4,-1],[4,1],[4,-4],[12],];
    var chorusPart2=[[4,6],[4,8],[4,3],[4,1],[4,3],
		     [8,1],[4,3],[4,6],[4,8],[4,3],[4,1],[4,3],
		     //[8,6],//not sure about this note
		     [8,8],[4,10],[4,11],[4,10],//reduce wait if u want it
		     [4,8],[4,6],[4,8],[4,6],
		     [4,3],[4,1],[4,3],[4,1],
		     [4,3],[4,6],[4,8],[4],[8],]
    data.push.apply(data,uselessTime);
    data.push.apply(data,chorusPart2);
	return data;
    }

//Suffocation by Crystal Castles in the on-key scale
var badBambooShoot=(initBadAppleDemo());

    //
    // Demo
    //
//(function(undefined) { //jon x'd out
			
	//Fox Spirit Matchmaker
var foxOpeningSong3 = (function() {
    slowFactor=1.2;//slow it down for mobile DuckDuckGo (desktop can't catch up too sometimes)
            var data = [
                {
                    'style': 'wave',
                    'volume': 'linearFade',
                    'notesOffset': 0 //so that 0 is C
                }
            ];

            data.push( //each measure, 1st values should add up to mult of 16 if 16th notes

		//can use 0 for first note or chords but weird timing on
		//loading first note
                [4, 4], //1st value is wait time before playing note, 2nd and 3rd values are notes
                [8-4, 6], //8 wait is half note at 120 bpm
                [8, 7],
                [8, 9],
                [8, 11], //28
		[4+16],
		
		[0, 11],
		[8, 9],
		[8, 11],
		[8, 12],
		[4, 9],
		[8, 7],
		[8, 6],
		[8, 7],
		[4]
		
            );

	data.push(
                [0, 4],
                [4, 6],
                [8, 7],
                [8, 9],
                [8, 9],

		[12, 9],

		[12, 11],

		[8, 9],

		[12, 8],

	    [12, 4],
	    [84-64-4]
		
            );


	    //note: A
	    
            data.push( //each measure, 1st values should add up to mult of 16 if 16th notes
                [0, 4-7], //1st value is wait time before playing note, 2nd and 3rd values are notes
                [8-4, 6-7], //8 wait is half note at 120 bpm
                [8, 7-7],
                [8, 9-7],
                [8, 11-7], //28
		[4+16],
		
		[0, 11-7],
		[8, 9-7],
		[8, 11-7],
		[8, 12-7],
		[4, 9-7],
		[8, 7-7],
		[8, 6-7],
		[8, 7-7],
		[4]
		
            );

	data.push(
                [0, 6-7],
                [4, 4-7],
                [8, 6-7],
                [8, 7-7],
                [8, 9-7],

		[12, 9-7],

		[12, 11-7],

		[8, 9-7],

		[12, 8-7],

	    [12, 11-7],
	    [84-64]
		
            );


            return data;
        })();
	///////////
var chopsticks = (function() {
    slowFactor=1;//jon maintaining original speed
            var data = [
                {
                    'style': 'wave',
                    'volume': 'linearFade',
                    'notesOffset': 0
                }
            ];

            var main = [ //zw: 6 because of triplets?
                [6, -7, -5],
                [6, -7, -5],
                [6, -7, -5],
                [6, -7, -5],
                [6, -7, -5],
                [6, -7, -5],

                [6, -8, -5],
                [6, -8, -5],
                [6, -8, -5],
                [6, -8, -5],
                [6, -8, -5],
                [6, -8, -5],

                [6, -10, -1],
                [6, -10, -1],
                [6, -10, -1],
                [6, -10, -1],
                [6, -10, -1],
                [6, -10, -1],

                [6, -12, 0],
                [6, -12, 0],
                [6, -12, 0]
            ];

            data.push.apply(data, main);
            data.push(
                [6, -12, 0],
                [6, -10, -1],
                [6, -8, -3]
            );
            data.push.apply(data, main);
            data.push(
                [6, -12, 0],
                [6, -5],
                [6, -8],

                [6, -12],
                [12]
            );

            var main2 = [
                [6, 0, 4],
                [6, -1, 2],
                [6],

                [6, -3, 0],
                [6, -5, -1],
                [6],

                [6, -7, -3],
                [6, -8, -5],
                [6],

                [6, 0, 4],
                [6, 0, 4],
                [6],

                [6, -8, -5],
                [6, -10, -7],
                [6],

                [6, -1, 2],
                [6, -1, 2],
                [6]
            ];
            data.push.apply(data, main2);
            data.push(
                [6, -10, -7],
                [6, -12, -8],
                [6],

                    [6, -8, 0],
                [6, -8, 0],
                [6]
            );
            data.push.apply(data, main2);
            data.push(
                [6, -5, -1],
                [6, -8, 0],
                [6, -5],

                [6, -8],
                [6, -12],
                [6] //zw: interval break?
            );
            return data;
        })();


var demoing = false, demoingTimeout;
function stopDemo(){ //I'm guessing there's already a function like this 
    demoing=false; //in a different file, but I think it's not stop()
}

function demo(data) {
    demoing=false; //jon test. wanted to stop to switch but it enables musical rounds from console.
    //You can still stop by pressing M or entering demoing=false
    //Rounds sound good with in-key songs (sharp=0)
    
            var cfg = data[0];
            if (!buildingPiano && !demoing) {
                demoing = true;
                cfg.style && (DataGenerator.style.default = DataGenerator.style[cfg.style]);
                cfg.volume && (DataGenerator.volume.default = DataGenerator.volume[cfg.volume]);
                cfg.notesOffset !== undefined && (notesOffset = cfg.notesOffset);
                $keys.one('build-done.piano', function() {
                    //NOTE - jQuery.map flattens arrays
                    var i = 0, song = $.map(data, function(x, i) { return i === 0 ? null : [x]; }); //zw
                    (function play() {
                        if (!demoing) return;
                        if (i >= song.length) { i = 0; }
                        var part = song[i++];
                        if (part) {
                            var delay = part[0];
                            demoingTimeout = window.setTimeout(function() {
                                demoing && play();
                                for (var j=1, len=part.length; j<len; j++) {
                                    $keys.trigger('note-'+(part[j]+notesOffset)+'.play');
                                }
                            }, delay*50*slowFactor);
                        }
                    })();
                });
                buildPiano();
            }
        }

        function demoHandler(evt) {
            if (evt.type === 'click' || (evt.keyCode == 77 && !isModifierKey(evt))) { //m is 77 // control is 
                if (demoing) {
                    demoing = false;
                    window.clearTimeout(demoingTimeout);
                    $keys.unbind('build-done.piano');
                } else {
                    demo(foxOpeningSong3);//chopsticks); //foxOpeningSong3); //zw
                }
            }
        }

        $(window).keyup(demoHandler);
        $('.toggle-demo').click(demoHandler);
    //})(); //jon x'd out


    //
    // Looper
    //
    (function() {
        var $looper = $('.loop'),
            recording = false,
            startTime,
            totalTime,
            data,
            stopTimeout,
            loopInterval, loopTimeouts = [];

        $keys.on('played-note.piano', function(evt, key) {
            if (recording) {
                data.push({'key': key, 'time': new Date().getTime()});
            }
        });

        function recordStart() {
            if (!recording) {
                data = [];
                startTime = new Date().getTime();
                recording = true;
                window.clearTimeout(stopTimeout);
                stopTimeout = window.setTimeout(recordStop, 60*1000); // 1 minute max?
                $looper.addClass('active');

                // stop old loop
                window.clearInterval(loopInterval);
                $.each(loopTimeouts, function(i, x) { window.clearTimeout(x); });
            }
        }
        function recordStop() {
            if (recording) {
                recording = false;
                totalTime = new Date().getTime() - startTime;
                window.clearTimeout(stopTimeout);
                for (var i=0, len=data.length; i<len; i++) {
                    data[i].time = data[i].time - startTime;
                }
                if (data.length) {
                    playLoop(data, totalTime);
                }
                $looper.removeClass('active');
            }
        }

        function playLoop(data, totalTime) {
            loopInterval = window.setInterval(function() {
                loopTimeouts = [];
                $.each(data, function(i, x) {
                    loopTimeouts.push(window.setTimeout(function() {
                        $keys.trigger('note-'+x.key+'.play');
                    }, x.time));
                });
            }, totalTime);
        }

        $looper.mousedown(recordStart).mouseup(recordStop);

        $(window).on('keydown keyup', function(evt) {
            if (evt.which == 8 && !isModifierKey(evt)) { //delete is 8 //9 is keycode 57
                evt.type == 'keydown' ? recordStart() : recordStop();
            }
        });
    })();


    //
    // Silly colors
    //
    (function() {
        var shouldAnimate = true,
            $piano = $('#piano'),
            W = $piano.width(),
            H = 500,
            $canvas = $('<canvas>', {
                css: {
                    position: 'absolute',
                    top: ($piano.offset().top + $piano.outerHeight() - 1) + 'px',
                    left: '50%',
                    marginLeft: Math.floor(-W/2) + 'px', // need to figure this out...
                    width: W,
                    height: H
                }
            })
            .attr('width', W)
            .attr('height', H)
            .prependTo('body'),
            canvas = $canvas.get(0),
            ctx = canvas.getContext('2d');

        function choice(x) {
            return x[Math.floor(Math.random()*x.length)];
        }

        function getData(note) {
            var data = [], freq = Notes.noteToFreq(note), vol = 1, sampleRate = 2024, secs = 0.1;
            var volumeFn = DataGenerator.volume.default;
            var styleFn = DataGenerator.style.default;
            var maxI = sampleRate * secs;
            for (var i=0; i<maxI; i++) {
                var sf = styleFn(freq, vol, i, sampleRate, secs, maxI);
                data.push(volumeFn(
                    styleFn(freq, vol, i, sampleRate, secs, maxI),
                    freq, vol, i, sampleRate, secs, maxI));
            }
            return data;
        }

        var keyToData = {},
            keyAnimCounts = {};

        $keys.on('build-done.piano', function() {
            $keys.find('.key').each(function() {
                var key = $(this).data('key');
                keyToData[key] = getData(key);
            });
        });

        $keys.on('played-note.piano', function(evt, key, $elt) {
            if (!shouldAnimate) return;

            var eOffset = $elt.offset(),
                eWidth = $elt.width(),
                cOffset = $canvas.offset(),
                startX = (eOffset.left + eWidth/2) - cOffset.left,
                startY = 0,
                endY = 200,
                amplitude = 8,
                data = keyToData[key],
                animCount = keyAnimCounts[key] = (keyAnimCounts[key] || 0) + 1;

            if (!data) return;

            var len = data.length,
                maxTime = 500,
                stepRate = 80,
                cleanupStepDelay = 8,
                steps = Math.floor(maxTime / stepRate),
                iPerStep = len / steps,
                yPerStep = (endY - startY) / steps,
                yIncrement = yPerStep / iPerStep,
                step = 0,
                i = 0,
                
                color = '#23f3'; //zw //black
                color = '#f7df1e'; //zw //yellow
                color = '#0df1a'; //zw //black
	    color = '#' + choice('f33 33f 3f3 ff3 f3f 3ff'.split(' ')); 
	    //color = '#00ff00'; //zw //green
	    
            // startY -> endY in steps
            // each step is yPerStep = (endY - startY) / steps long
            // each step covers iPerStep = len / steps data points
            //     at an increment of yIncrement = yPerStep / iPerStep

            (function draw() {

                if (step < steps) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    var newMax = i + iPerStep, first = true;
                    for (; i<=newMax; i++) {
                        startY += yIncrement;
                        ctx[first ? 'moveTo' : 'lineTo'](startX + data[i]*amplitude, startY);
                        first = false;
                        if (startY > H) return;
                    }
                    i--; // keep an overlap between draws
                    startY -= yIncrement;
                    ctx.stroke();
                }

                if (keyAnimCounts[key] == animCount && step >= cleanupStepDelay) {
                    var cleanupStep = step - cleanupStepDelay;
                    ctx.clearRect(startX - amplitude - 5, yPerStep * cleanupStep,
                                  (amplitude + 5) * 2, yPerStep * (cleanupStep + 1));
                }

                if (++step < steps + cleanupStepDelay) {
                    window.setTimeout(draw, stepRate);
                }
            })();
        });

        // button
        var bW = 20,
            bH = 20,
            $loop = $('.loop'),
            $button = $('<canvas>', {
                css: {
                    position: 'absolute',
                    top: (parseInt($loop.css('top')) + 1) + 'px',
                    right: (parseInt($loop.css('right')) + 34) + 'px',
                    width: bW,
                    height: bH,
                    cursor: 'pointer'
                }
            })
            .attr('width', bW)
            .attr('height', bH)
            .appendTo('#piano'),
            button = $button.get(0),
            bctx = button.getContext('2d'),
            coords = [
                [15, 1],
                [5, 9],
                [9, 11],
                [5, 19],
                [15, 11],
                [11, 9]
            ],
            coordsLen = coords.length;

        bctx.strokeStyle = 'rgba(0,0,0,.5)';
        bctx.lineWidth = 0.5; //zw

        function draw() {
            bctx.fillStyle = shouldAnimate ? 'rgba(255,255,0,.75)' : 'rgba(0,0,0,.25)';
            bctx.clearRect(0, 0, bW, bH);
            bctx.beginPath();
            for (var i=0; i<coordsLen; i++) {
                bctx[i === 0 ? 'moveTo' : 'lineTo'](coords[i][0], coords[i][1]); //zw
            }
            bctx.closePath();
            if (shouldAnimate) bctx.stroke();
            bctx.fill();
        }
        draw();

        // handlers
        function toggleAnimate(evt) {
            if (evt.type === 'click' || (evt.keyCode == 220 && !isModifierKey(evt))) { // \ backslash is keycode 220 //8  is keycode 56
                shouldAnimate = !shouldAnimate;
                draw();
            }
        }
        $(window).keyup(toggleAnimate);
        $('.toggle-animate').click(toggleAnimate);
        $button.click(toggleAnimate);
    })();

    if (isIos) {
        $(function() {
            var $note = $('<div>', {
                'class': 'note',
                'text': 'Note: sound does not work on iOS, but you can still enjoy pretty wave forms!'
            }).appendTo('body');

            window.setTimeout(function() {
                $note.fadeOut();
            }, 6000);
        });
    }



    // the below code was a failed experiment to support iOS...

    // //
    // // Generate files for dl...
    // //

    // function generateFilesForDL() {
    //     // backup solution for iOS... since they won't play my files :'(
    //     // add audio elts to page and then download them all!
    //     // https://addons.mozilla.org/en-US/firefox/addon/downthemall/?src=search

    //     for (var i=0; i<5; i++) {
    //         var dataURI = Notes.getDataURI(i);
    //         $('body').prepend("<br><br>");
    //         $('<audio>', {controls: 'controls'})
    //             .append('Note ' + i)
    //             .append($('<source>', {
    //                 src: dataURI,
    //                 type: 'audio/wav'
    //             }))
    //             .prependTo('body');
    //         $('body').prepend(i + ": ");
    //     }

    //     $('body').prepend("<br><br>");
    //     $('<audio>', {controls: 'controls', src: 'note.caf', type: 'audio/wav'}).prependTo('body');
    //     $('body').prepend("note: ");

    // }
    // generateFilesForDL();

//})();//commented out by jon
