import BasicTests from "helper/Basic";
import UserMedia from "Tone/source/UserMedia";
import Test from "helper/Test";
import Source from "Tone/source/Source";
import Supports from "helper/Supports";

describe("UserMedia", function(){

	//run the common tests
	BasicTests(UserMedia);

	context("Source Tests", function(){

		it("can connect the output", function(){
			var extIn = new UserMedia();
			extIn.connect(Test);
			extIn.dispose();
		});

		it("can be constructed with the input number", function(){
			var extIn = new UserMedia();
			extIn.dispose();
		});

		it("can be constructed with an options object", function(){
			var extIn = new UserMedia({
				"volume" : -10,
				"mute" : false
			});
			expect(extIn.volume.value).to.be.closeTo(-10, 0.1);
			expect(extIn.mute).to.be.false;
			extIn.dispose();
		});

		it("indicates if the browser has UserMedia support", function(){
			expect(UserMedia.supported).to.be.a.boolean;
		});

	});

	//if it is a manual test (i.e. there is a person to 'allow' the microphone)
	if (Supports.GET_USER_MEDIA && UserMedia.supported){

		context("Opening and closing", function(){

			//long timeout to give testers time to allow the microphone
			this.timeout(100000);

			var HAS_USER_MEDIA_INPUTS = false;

			before(function(){
				return UserMedia.enumerateDevices().then(function(devices){
					HAS_USER_MEDIA_INPUTS = devices.length > 0;
				});
			});

			it("open returns a promise", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					var promise = extIn.open();
					expect(promise).to.have.property("then");
					return promise.then(function(){
						extIn.dispose();
					});
				}
			});

			it("can open an input", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						extIn.dispose();
					});
				}
			});

			it("can open an input by name", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					var name = null;
					return UserMedia.enumerateDevices().then(function(devices){
						name = devices[0].deviceId;
						return extIn.open(name);
					}).then(function(){
						expect(extIn.deviceId).to.equal(name);
						extIn.dispose();
					});
				}
			});

			it("can open an input by index", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open(0).then(function(){
						extIn.dispose();
					});
				}
			});

			it("throws an error if it cant find the device name", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open("doesn't exist").then(function(){
						//shouldn't call 'then'
						throw new Error("shouldnt call 'then'");
					}).catch(function(){
						extIn.dispose();
					});
				}
			});

			it("is 'started' after media is open and 'stopped' otherwise", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					expect(extIn.state).to.equal("stopped");
					return extIn.open().then(function(){
						expect(extIn.state).to.equal("started");
						extIn.dispose();
					});
				}
			});

			it("has a label, group and device id when open", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						expect(extIn.deviceId).to.be.a("string");
						expect(extIn.groupId).to.be.a("string");
						expect(extIn.label).to.be.a("string");
						extIn.dispose();
					});
				}
			});

			it("can reopen an input", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						return extIn.open();
					}).then(function(){
						extIn.dispose();
					});
				}
			});

			it("can close an input", function(){
				if (HAS_USER_MEDIA_INPUTS){
					var extIn = new UserMedia();
					return extIn.open().then(function(){
						extIn.close();
						extIn.dispose();
					});
				}
			});

			it("can enumerate devices", function(){
				return UserMedia.enumerateDevices().then(function(devices){
					expect(devices).to.be.instanceOf(Array);
				});
			});
		});
	}

});

