define(["helper/Basic", "Tone/source/UserMedia", "Test", "Tone/source/Source", "helper/Offline2"], 
	function (BasicTests, UserMedia, Test, Source, Offline) {

	describe("UserMedia", function(){

		//run the common tests
		BasicTests(UserMedia);

		context("Source Tests", function(){

			it ("can connect the output", function(){
				var extIn = new UserMedia();
				extIn.connect(Test);
				extIn.dispose();
			});

			it ("can be constructed with the input number", function(){
				var extIn = new UserMedia();
				extIn.dispose();
			});

			it ("can be constructed with an options object", function(){
				var extIn = new UserMedia({
					"volume" : -10
				});
				expect(extIn.volume.value).to.be.closeTo(-10, 0.1);
				extIn.dispose();
			});

			it ("indicates if the browser has UserMedia support", function(){
				expect(UserMedia.supported).to.be.a.boolean;
			});

		});


		//if it is a manual test (i.e. there is a person to 'allow' the microphone)
		if (window.MANUAL_TEST && UserMedia.supported){

			context("Opening and closing", function(){

				//long timeout to give testers time to allow the microphone
				this.timeout(100000);

				it ("open returns a promise", function(done){
					var extIn = new UserMedia();
					var promise = extIn.open();
					expect(promise).to.be.instanceOf(Promise);
					promise.then(function(){
						extIn.dispose();
						done();
					})
				});

				it ("can open an input", function(done){
					var extIn = new UserMedia();
					extIn.open().then(function(){
						extIn.dispose();
						done();
					});
				});

				it ("can close an input", function(done){
					var extIn = new UserMedia();
					extIn.open().then(function(){
						extIn.close();
						extIn.dispose();
						done();
					});
				});

				it ("can enumerate devices", function(done){
					var extIn = new UserMedia();
					extIn.enumerateDevices().then(function(devices){
						expect(devices).to.be.instanceOf(Array);
						extIn.dispose();
						done();
					});
				});
			});
		}

	});
});