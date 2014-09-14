define(["Tone/core/Tone", "chai", "Tone/component/Recorder"],function(Tone, chai, Recorder){

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

	return {
		offlineTest : offlineTest,
		offlineStereoTest : offlineStereoTest,
		wasDisposed : wasDisposed,
		onlineTest : onlineTest,
		onlineContext : function(){
			Tone.setContext(audioContext);
		}
	};
});