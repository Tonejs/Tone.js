define(["Tone/core/Tone", "chai", "Recorder", "Tone/core/Master", "Tone/signal/Signal"],
function(Tone, chai, Recorder, Master, Signal){

	var expect = chai.expect;

	var audioContext = Tone.context;

	var recorder = new Recorder();

	var noFun = function(){};

	function offlineTest(duration, setup, test, end){
		setup = setup || noFun;
		test = test || noFun;
		end = end || noFun;
		var sampleRate = 44100;
		var offline = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
		offline.oncomplete = function(e){
			var buffer = e.renderedBuffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				test(buffer[i], i / sampleRate);
			}
			end();
		};
		Tone.setContext(offline);
		setup(offline.destination);
		offline.startRendering();
	}

	function offlineStereoTest(duration, setup, test, end){
		setup = setup || noFun;
		test = test || noFun;
		end = end || noFun;
		var sampleRate = 44100;
		var offline = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
		offline.oncomplete = function(e){
			var bufferL = e.renderedBuffer.getChannelData(0);
			var bufferR = e.renderedBuffer.getChannelData(1);
			for (var i = 0; i < bufferL.length; i++){
				test(bufferL[i], bufferR[i], i / sampleRate);
			}
			end();
		};
		Tone.setContext(offline);
		setup(offline.destination);
		offline.startRendering();
	}

	function onlineTest(duration, setup, test, end){
		setup = setup || noFun;
		test = test || noFun;
		end = end || noFun;
		Tone.setContext(audioContext);
		var sampleRate = audioContext.sampleRate;
		setup(recorder);
		recorder.record(duration, 0.1, function(buffers){
			var buffer = buffers[0];
			for (var i = 0; i < buffer.length; i++){
				test(buffer[i], i / sampleRate - 0.1);
			}
			end();
		});
	}

	function wasDisposed(obj){
		for (var prop in obj){
			var member = obj[prop];
			if (typeof member !== "function" && 
				typeof member !== "string" && 
				typeof member !== "number" &&
				typeof member !== "boolean" &&
				prop !== "preset" && 
				!(member instanceof AudioContext)){
				if (member !== null){
					throw Error("property was not completely disposed: "+prop);
				}
			}
		}
	}

	function acceptsInput(node, inputNumber){
		inputNumber = inputNumber || 0;
		var inputNode = node.context.createGain();
		inputNode.connect(node, 0, inputNumber);
		inputNode.disconnect();
		inputNode = null;		
	}

	function acceptsOutput(node, outputNumber){
		outputNumber = outputNumber || 0;
		var outputNode = node.context.createGain();
		node.connect(outputNode, outputNumber, 0);
		node.disconnect(outputNumber);
		outputNode = null;		
	}

	function outputsAudio(setup, end){
		var sampleRate = 44100;
		var offline = new OfflineAudioContext(2, sampleRate * 0.4, sampleRate);
		offline.oncomplete = function(e){
			var buffer = e.renderedBuffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				if (buffer[i] !== 0){
					end();
					return;
				}
			}
			throw new Error("node outputs silence");
		};
		Tone.setContext(offline);
		setup(offline.destination);
		offline.startRendering();
	}

	function passesAudio(setup, end){
		var sampleRate = 44100;
		var duration = 0.5;
		var offline = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
		offline.oncomplete = function(e){
			var buffer = e.renderedBuffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				if (i > duration / 2 && buffer[i] !== 0){
					signal.dispose();
					end();
					return;
				} else if (i < duration / 2) {
					expect(buffer[i]).to.be.closeTo(0, 0.001);
					// throw new Error("node outputs sound when no signal is fed in");		
				}
			}
			throw new Error("node outputs silence");
		};
		Tone.setContext(offline);
		var signal = new Signal(0);
		setup(signal, offline.destination);
		signal.setValueAtTime(1, duration / 2);
		offline.startRendering();
	}

	function validatePresets(node){
		if (node.preset){
			for (var name in node.preset){
				node.setPreset(name);
			}
		}
	}

	return {
		offlineTest : offlineTest,
		offlineStereoTest : offlineStereoTest,
		wasDisposed : wasDisposed,
		onlineTest : onlineTest,
		onlineContext : function(){
			if (Tone.context !== audioContext){
				Tone.setContext(audioContext);
			}
			Master.mute = true;
		},
		acceptsInput : acceptsInput,
		acceptsOutput : acceptsOutput,
		acceptsInputAndOutput : function(node){
			acceptsInput(node);
			acceptsOutput(node);
		},
		outputsAudio : outputsAudio,
		passesAudio : passesAudio,
		validatePresets : validatePresets,
	};
});