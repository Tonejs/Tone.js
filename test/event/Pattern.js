define(["helper/Basic", "Tone/event/Pattern", "Tone/core/Tone", "Tone/core/Transport", "helper/Offline2"], 
	function (Basic, Pattern, Tone, Transport, Offline) {

	describe("Pattern", function(){

		Basic(Pattern);

		function resetTransport(done){
			Tone.Transport.cancel(0);
			Tone.Transport.off("start stop pause pattern");
			Tone.Transport.stop();
			Tone.Transport.pattern = false;
			Tone.Transport.bpm.value = 120;
			Tone.Transport.timeSignature = [4, 4];
			setTimeout(done, 200);
		}

		context("Constructor", function(){

			afterEach(resetTransport);

			it ("takes a callback, an array of values and a pattern name", function(){
				var callback = function(){};
				var pattern = new Pattern(callback, [0, 1, 2, 3], "down");
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal([0, 1, 2, 3]);
				expect(pattern.pattern).to.equal("down");
				pattern.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var pattern = new Pattern();
				pattern.dispose();
			});

			it ("can pass in arguments in options object", function(){
				var callback = function(){};
				var pattern = new Pattern({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3,
					"interval" : "8t",
					"values" : [1, 2, 3],
					"pattern" : "upDown"
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.interval).to.equal("8t");
				expect(pattern.iterations).to.equal(4);
				expect(pattern.values).to.deep.equal([1, 2, 3]);
				expect(pattern.probability).to.equal(0.3);
				expect(pattern.pattern).to.equal("upDown");
				pattern.dispose();
			});
		});

		context("Get/Set", function(){

			afterEach(resetTransport);

			it ("can set values with object", function(){
				var callback = function(){};
				var pattern = new Pattern();
				pattern.set({
					"callback" : callback,
					"values" : ["a", "b", "c"],
					"index" : 2
				});
				expect(pattern.callback).to.equal(callback);
				expect(pattern.values).to.deep.equal(["a", "b", "c"]);
				expect(pattern.index).to.equal(2);
				pattern.dispose();
			});

			it ("can set get a the values as an object", function(){
				var callback = function(){};
				var pattern = new Pattern({
					"callback" : callback,
					"pattern" : "random",
					"probability" : 0.3,
				});
				var values = pattern.get();
				expect(values.pattern).to.equal("random");
				expect(values.probability).to.equal(0.3);
				pattern.dispose();
			});
		});


		context("Callback", function(){

			afterEach(resetTransport);

			it ("is invoked after it's started", function(done){
				Offline(function(output, test, after){
					var wasInvoked = false;
					var pattern = new Pattern(function(){
						wasInvoked = true;
					}, [0, 1, 2]).start(0);
					Tone.Transport.start();
					after(function(){
						expect(wasInvoked).to.be.true;
						pattern.dispose();
						done();
					});
				}, 0.2);
			});

			it ("passes in the scheduled time and pattern index to the callback", function(done){
				Offline(function(output, test, after){

					var now = Tone.Transport.now();

					var pattern = new Pattern(function(time, note){
						expect(time).to.be.a.number;
						expect(time - now).to.be.closeTo(0.3, 0.01);
						expect(note).to.be.equal("a");
					}, ["a"], "up");

					Tone.Transport.start();

					pattern.start(0.3);
					after(function(){
						pattern.dispose();
						done();
					});
				}, 0.4);
			});

			it ("passes in the next note of the pattern", function(done){
				Offline(function(output, test, after){

					var counter = 0;
					var pattern = new Pattern(function(time, note){
						expect(note).to.equal(counter % 3);
						counter++;
					}, [0, 1, 2], "up").start();

					pattern.interval = "16n";
					
					Tone.Transport.start();
					after(function(){
						pattern.dispose();
						done();
					});

				}, 0.7);
			});
		});

	});
});