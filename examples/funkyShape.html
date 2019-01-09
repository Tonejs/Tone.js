<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
	<title>VISUALIZING ENVELOPES</title>

	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<link rel="icon" type="image/png" sizes="174x174" href="./favicon.png">

	<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-bundle.js"></script>
	<script src="../build/Tone.js"></script>
	<script src="./js/tonejs-ui.js"></script>
	<script src="./js/p5.js"></script>
</head>
<body>
	<style type="text/css">
		canvas {
			position: absolute;
			top: 0px;
			z-index: -1;
			left: 0px;
		}
	</style>
	<tone-example>
		<tone-explanation label="Tone with p5.js">
			Access the envelopes current value to synchronize visuals. This sketch uses <a href="https://p5js.org" target="_blank">p5.js</a> for canvas rendering.
			<br><br>
			Example by <a href="https://github.com/polyrhythmatic">polyrhythmatic</a>
		</tone-explanation>

		<tone-content>
			<tone-play-toggle></tone-play-toggle>
		</tone-content>

		<tone-drawer collapsed>
			<tone-filter frequency id="hihatFilter" collapsed label="Hihat Filter"></tone-filter>
			<tone-noise-synth id="openHiHat" collapsed label="Open Hihat"></tone-noise-synth>
			<tone-noise-synth id="closedHiHat" collapsed label="Closed Hihat"></tone-noise-synth>
			<tone-oscillator id="bassOsc" collapsed label="Bass Osc" sourcetype="pulse"></tone-oscillator>
			<tone-filter frequency id="bassFilter" collapsed label="Bass Filter"></tone-filter>
			<tone-envelope id="bassEnvelope" collapsed label="Bass Envelope"></tone-envelope>
			<tone-oscillator frequency id="bleep" collapsed label="Bleep"></tone-oscillator>
			<tone-envelope id="bleepEnvelope" collapsed label="Bleep Envelope"></tone-envelope>
			<tone-oscillator frequency id="kickOsc" collapsed label="Kick Oscillator"></tone-oscillator>
			<tone-envelope id="kickEnvelope" collapsed label="Kick Envelope"></tone-envelope>
			<tone-frequency-envelope id="kickFreqEnvelope" collapsed label="Kick Frequency Envelope"></tone-frequency-envelope>
		</tone-drawer>
	</tone-example>

	<script type="text/javascript">
		function FunkyShape(){}

		/*
		FunkyShape init gives initial and offset values for 
		the perlin noise functions in update.
		Giving different initial values ensures that 
		each funky shape follows its own funky path
		*/
		FunkyShape.prototype.init = function(xInc, yInc, xOff, yOff, radius){
			this.xInc = xInc;
			this.yInc = yInc;
			this.xOff = xOff;
			this.yOff = yOff;
			this.radius = radius;
			this.xPos = 0;
			this.yPos = 0;
		};

		//updates the x, y, and radius values of the shape
		FunkyShape.prototype.update = function(envelope){
			this.xPos = noise(this.xOff) * width;
			this.yPos = noise(this.yOff) * height;
			this.xOff += this.xInc;
			this.yOff += this.yInc;
			this.sRadius = this.radius * envelope;
			return {
				"xPos" : this.xPos,
				"yPos" : this.yPos,
				"radius" : this.sRadius
			};
		};
	
		//using our FunkyShape class
		//to create a funkyCircle class
		var funkyCircle = new FunkyShape();

		//creating an empty array
		var funkySquare = [];
		//and populating it with 3 FunkyShapes
		for (var i = 0; i < 3; i++){
			funkySquare[i] = new FunkyShape();
		}

		function setup(){
			//create a canvas width and height of the screen
			createCanvas(windowWidth, windowHeight);
			//no fill
			fill(255);
			strokeWeight(1);
			rectMode(CENTER);
			//initializing our funky circle
			funkyCircle.init(0.01, 0.02, 0.0, 0.0, 400);
			//initializing our squares with random values
			//to ensure they don't follow the same path
			for (var i = 0; i < 3; i++){
				var xInc = Math.random() / 10;
				var yInc = Math.random() / 10;
				funkySquare[i].init(xInc, yInc, 0, 0, 800);
			}
		}

		var phase = 0;

		function draw(){
			background(255);
			stroke(0);
			//drawing the kick wave at the bottom
			//it is composed of a simple sine wave that
			//changes in height with the kick envelope
			for (var i = 0; i < width; i++){
				//scaling kickEnvelope value by 200 
				//since default is 0-1
				var kickValue = kickEnvelope.value * 200;
				//multiplying this value to scale the sine wave 
				//depending on x position
				var yDot = Math.sin((i / 60) + phase) * kickValue;
				point(i, height -150 + yDot);
			}
			//increasing phase means that the kick wave will 
			//not be standing and looks more dynamic
			phase += 1;
			//updating circle and square positions with 
			//bass and bleep envelope values
			var circlePos = funkyCircle.update(bassEnvelope.value);
			//circlePos returns x and y positions as an object
			ellipse(circlePos.xPos, circlePos.yPos, circlePos.radius, circlePos.radius);
			stroke("red");
			for (var i = 0; i < 3; i++){
				var squarePos = funkySquare[i].update(bleepEnvelope.value);
				rect(squarePos.xPos, squarePos.yPos, squarePos.radius, squarePos.radius);
			}
		}

		//filtering the hi-hats a bit
		//to make them sound nicer
		var lowPass = new Tone.Filter({
			"frequency" : 14000,
		}).toMaster();

		//we can make our own hi hats with 
		//the noise synth and a sharp filter envelope
		var openHiHat = new Tone.NoiseSynth({
			"volume" : -10,
			"filter" : {
				"Q" : 1
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.3
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.03,
				"baseFrequency" : 4000,
				"octaves" : -2.5,
				"exponent" : 4,
			}
		}).connect(lowPass);

		var openHiHatPart = new Tone.Part(function(time){
			openHiHat.triggerAttack(time);
		}, [{ "8n" : 2 }, { "8n" : 6 }]).start(0);

		var closedHiHat = new Tone.NoiseSynth({
			"volume" : -10,
			"filter" : {
				"Q" : 1
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.15
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.03,
				"baseFrequency" : 4000,
				"octaves" : -2.5,
				"exponent" : 4,

			}
		}).connect(lowPass);

		var closedHatPart = new Tone.Part(function(time){
			closedHiHat.triggerAttack(time);
		}, [0, { "16n" : 1 }, { "8n" : 1 }, { "8n" : 3 }, { "8n" : 4 }, { "8n" : 5 }, { "8n" : 7 }, { "8n" : 8 }]).start(0);

		//BASS
		var bassEnvelope = new Tone.AmplitudeEnvelope({
			"attack" : 0.01,
			"decay" : 0.2,
			"sustain" : 0,
		}).toMaster();

		var bassFilter = new Tone.Filter({
			"frequency" : 600,
			"Q" : 8
		});

		var bass = new Tone.PulseOscillator("A2", 0.4).chain(bassFilter, bassEnvelope);
		bass.start();

		var bassPart = new Tone.Part(function(time, note){
			bass.frequency.setValueAtTime(note, time);
			bassEnvelope.triggerAttack(time);
		}, [["0:0", "A1"],
			["0:2", "G1"],
			["0:2:2", "C2"],
			["0:3:2", "A1"]]).start(0);

		//BLEEP
		var bleepEnvelope = new Tone.AmplitudeEnvelope({
			"attack" : 0.01,
			"decay" : 0.4,
			"sustain" : 0,
		}).toMaster();

		var bleep = new Tone.Oscillator("A4").connect(bleepEnvelope);
		bleep.start();

		var bleepLoop = new Tone.Loop(function(time){
			 bleepEnvelope.triggerAttack(time);
		}, "2n").start(0);

		//KICK
		var kickEnvelope = new Tone.AmplitudeEnvelope({
			"attack" : 0.01,
			"decay" : 0.2,
			"sustain" : 0,
		}).toMaster();

		var kick = new Tone.Oscillator("A2").connect(kickEnvelope).start();

		var kickSnapEnv = new Tone.FrequencyEnvelope({
			"attack" : 0.005,
			"decay" : 0.01,
			"sustain" : 0,
			"baseFrequency" : "A2",
			"octaves" : 2.7
		}).connect(kick.frequency);

		var kickPart = new Tone.Part(function(time){
			kickEnvelope.triggerAttack(time);
			kickSnapEnv.triggerAttack(time);
		}, ["0", "0:0:3", "0:2:0", "0:3:1"]).start(0);

		//TRANSPORT
		Tone.Transport.loopStart = 0;
		Tone.Transport.loopEnd = "1:0";
		Tone.Transport.loop = true;

		//bind the interface
		document.querySelector("tone-play-toggle").bind(Tone.Transport);
		document.querySelector("#hihatFilter").bind(lowPass);
		document.querySelector("#openHiHat").bind(openHiHat);
		document.querySelector("#closedHiHat").bind(closedHiHat);
		document.querySelector("#bassOsc").bind(bass);
		document.querySelector("#bassFilter").bind(bassFilter);
		document.querySelector("#bassEnvelope").bind(bassEnvelope);
		document.querySelector("#bleep").bind(bleep);
		document.querySelector("#bleepEnvelope").bind(bleepEnvelope);
		document.querySelector("#kickOsc").bind(kick);
		document.querySelector("#kickEnvelope").bind(kickEnvelope);
		document.querySelector("#kickFreqEnvelope").bind(kickSnapEnv);
	</script>

</body>
</html>
