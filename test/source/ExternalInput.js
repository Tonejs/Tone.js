define(["helper/Basic", "Tone/source/ExternalInput", "Test", "Tone/source/Source", "helper/Offline2"], 
	function (BasicTests, ExternalInput, Test, Source, Offline) {

	describe("ExternalInput", function(){

		//run the common tests
		BasicTests(ExternalInput);

		context("Source Tests", function(){

			it ("can connect the output", function(){
				var extIn = new ExternalInput();
				extIn.connect(Test);
				extIn.dispose();
			});

			it ("extends Tone.Source", function(){
				var extIn = new ExternalInput();
				expect(extIn).to.be.an.instanceof(Source);
				extIn.dispose();
			});

			it ("can be constructed with the input number", function(){
				var extIn = new ExternalInput(3);
				extIn.dispose();
			});

			it ("can be constructed with an options object", function(){
				var extIn = new ExternalInput({
					"inputNum" : 2,
					"volume" : -10
				});
				expect(extIn.volume.value).to.be.closeTo(-10, 0.1);
				extIn.dispose();
			});

			it("starts and stops", function(done){
				Offline(function(output, test, after){
					var extIn = new ExternalInput();
					expect(extIn.state).to.equal("stopped");
					extIn.start(0).stop(0.2);
					expect(extIn.state).to.equal("started");
					
					after(function(){
						expect(extIn.state).to.equal("stopped");
						extIn.dispose();
						done();
					});
				}, 0.3);
			});
		});

		context("Static methods/members", function(){

			it ("can get a list of sources", function(done){
				ExternalInput.getSources(function(sources){
					expect(sources).to.be.an.array;
					done();
				});
			});

			it ("has a list of sources", function(){
				expect(ExternalInput.sources).to.be.an.array;
			});

			it ("indicates if the browser has UserMedia support", function(){
				expect(ExternalInput.supported).to.be.a.boolean;
			});
		});

		//if it is a manual test (i.e. there is a person to 'allow' the microphone)
		if (window.MANUAL_TEST && ExternalInput.supported){

			context("Opening and closing", function(){

				//long timeout to give testers time to allow the microphone
				this.timeout(100000);

				it ("can open an input", function(done){
					var extIn = new ExternalInput();
					extIn.open(function(){
						extIn.dispose();
						done();
					});
				});

				it ("can can close an input", function(done){
					var extIn = new ExternalInput();
					extIn.open(function(){
						extIn.close();
						extIn.dispose();
						done();
					});
				});
			});
		}

	});
});