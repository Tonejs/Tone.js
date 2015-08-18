define(["Test", "Tone/source/Source", "Offline"], function (Test, Source, Offline) {

	describe("Source", function(){

		it("can be created and disposed", function(){
			var source = new Source();
			source.dispose();
			Test.wasDisposed(source);
		});

		it("can be started and stopped", function(){
			var source = new Source();
			source.start(0);
			source.stop(1);
			source.dispose();
		});

		it("can be constructed with an options object", function(){
			var source = new Source({
				"volume" : -20,
			});
			expect(source.volume.value).to.be.closeTo(-20, 0.1);
			source.dispose();
		});

		it("can set the volume", function(){
			var source = new Source();
			source.volume.value = -8;
			expect(source.volume.value).to.be.closeTo(-8, 0.1);
			source.dispose();
		});

		it("can get and set values with an object", function(){
			var source = new Source();
			source.set("volume", -10);
			expect(source.get().volume).to.be.closeTo(-10, 0.1);
			source.dispose();
		});

		it("is initally stopped", function(){
			var source = new Source();
			expect(source.state).to.equal("stopped");
			source.dispose();
		});

		it("cannot be scheduled to stop/start twice in a row", function(){
			var source = new Source();
			source.start(0).start(1);
			source.stop(2).stop(3);
			source.dispose();
		});

		it("has an output", function(){
			var source = new Source();
			source.connect(Test);
			source.dispose();
		});

		it("can be scheduled with multiple starts/stops", function(){
			var source = new Source();
			source.start(0).stop(0.5).start(0.75).stop(1).start(1.25).stop(1.5);
			expect(source._state.getStateAtTime(0)).to.equal("started");
			expect(source._state.getStateAtTime(0.5)).to.equal("stopped");
			expect(source._state.getStateAtTime(0.8)).to.equal("started");
			expect(source._state.getStateAtTime(1)).to.equal("stopped");
			expect(source._state.getStateAtTime(1.25)).to.equal("started");
			expect(source._state.getStateAtTime(1.6)).to.equal("stopped");
			source.dispose();
		});

		it ("can sync its start time to the Transport", function(){

		});

		it ("can unsync after it was synced", function(){
			var source = new Source();
			source.sync();
			source.unsync();
			source.dispose();
		});

		it ("correctly returns the scheduled play state", function(done){
			var source = new Source();
			expect(source.state).to.equal("stopped");
			source.start().stop("+0.5");
			setTimeout(function(){
				expect(source.state).to.equal("started");
			}, 100);
			setTimeout(function(){
				expect(source.state).to.equal("stopped");
				source.dispose();
				done();
			}, 600);
		});
	});
});