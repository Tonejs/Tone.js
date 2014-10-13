define(["Tone/core/Tone", "chai", "Tone/component/Recorder", "Tone/core/Master"],function(Tone, chai, Recorder, Master){

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
				!(member instanceof AudioContext)){
				expect(obj[prop]).to.equal(null);
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

	function outputsAudio(node, done){
		var sampleRate = 44100;
		var offline = new OfflineAudioContext(2, sampleRate * 0.1, sampleRate);
		offline.oncomplete = function(e){
			var buffer = e.renderedBuffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				if (buffer[i] !== 0){
					done();
					return;
				}
			}
			throw new Error("node outputs silence");
		};
		Tone.setContext(offline);
		node.connect(offline.destination);
		offline.startRendering();
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
			Master.mute();
		},
		acceptsInput : acceptsInput,
		acceptsOutput : acceptsOutput,
		acceptsInputAndOutput : function(node){
			acceptsInput(node);
			acceptsOutput(node);
		},
		outputsAudio : outputsAudio
	};
});