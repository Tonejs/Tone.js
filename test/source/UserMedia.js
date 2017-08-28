define(["helper/Basic", "Tone/source/UserMedia", "Test", "Tone/source/Source"], 
	function (BasicTests, UserMedia, Test, Source) {

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
					"volume" : -10,
					"mute" : false
				});
				expect(extIn.volume.value).to.be.closeTo(-10, 0.1);
				expect(extIn.mute).to.be.false;
				extIn.dispose();
			});

			it ("indicates if the browser has UserMedia support", function(){
				expect(UserMedia.supported).to.be.a.boolean;
			});

		});


		//if it is a manual test (i.e. there is a person to 'allow' the microphone)
		if (UserMedia.supported){

			context("Opening and closing", function(){

				//long timeout to give testers time to allow the microphone
				this.timeout(100000);

				it ("open returns a promise", function(){
					var extIn = new UserMedia();
					var promise = extIn.open();
					expect(promise).to.be.instanceOf(Promise);
					return promise.then(function(){
						extIn.dispose();
					});
				});

				it ("can open an input", function(){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						extIn.dispose();
					});
				});

				it ("can open an input by name", function(){
					var extIn = new UserMedia();
					return extIn.open("default").then(function(){
						expect(extIn.deviceId).to.equal("default");
						extIn.dispose();
					});
				});

				it ("can open an input by index", function(){
					var extIn = new UserMedia();
					return extIn.open(0).then(function(){
						extIn.dispose();
					});
				});

				it ("throws an error if it cant find the device name", function(){
					var extIn = new UserMedia();
					return extIn.open("doesn't exist").catch(function(){
						extIn.dispose();
					})
				});

				it ("is 'started' after media is open and 'stopped' otherwise", function(){
					var extIn = new UserMedia();
					expect(extIn.state).to.equal("stopped");
					return extIn.open().then(function(){
						expect(extIn.state).to.equal("started");
						extIn.dispose();
					});
				});

				it ("has a label, group and device id when open", function(){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						expect(extIn.deviceId).to.be.a("string");
						expect(extIn.groupId).to.be.a("string");
						expect(extIn.label).to.be.a("string");
						extIn.dispose();
					});
				});

				it ("can close an input", function(){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						extIn.close();
						extIn.dispose();
					});
				});

				it ("can enumerate devices", function(){
					return UserMedia.enumerateDevices().then(function(devices){
						expect(devices).to.be.instanceOf(Array);
					});
				});
			});
		}

	});
});