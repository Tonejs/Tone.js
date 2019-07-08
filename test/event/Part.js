import Basic from "helper/Basic";
import Part from "Tone/event/Part";
import Tone from "Tone/core/Tone";
import Transport from "Tone/core/Transport";
import Event from "Tone/event/Event";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Time from "Tone/type/Time";

describe("Part", function(){

	Basic(Part);

	context("Constructor", function(){

		it("takes a callback and an array of values", function(){
			return Offline(function(){
				var callback = function(){};
				var part = new Part(callback, [0, 1, 2]);
				expect(part.callback).to.equal(callback);
				expect(part.length).to.equal(3);
				part.dispose();
			});
		});

		it("can be constructed with no arguments", function(){
			return Offline(function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.dispose();
			});
		});

		it("can pass in arguments in options object", function(){
			return Offline(function(){
				var callback = function(){};
				var part = new Part({
					"callback" : callback,
					"humanize" : true,
					"events" : [0, 1, 2],
					"loop" : true,
					"loopEnd" : "4n",
					"probability" : 0.3
				});
				expect(part.callback).to.equal(callback);
				expect(part.length).to.equal(3);
				expect(part.loop).to.be.true;
				expect(part.loopEnd).to.equal(Time("4n").valueOf());
				expect(part.probability).to.equal(0.3);
				expect(part.humanize).to.be.true;
				part.dispose();
			});
		});
	});

	context("Adding / Removing / Getting Events", function(){

		it("can take events in the constructor as an array of times", function(){
			return Offline(function(){
				var part = new Part(function(){}, ["0", "8n", "4n"]);
				expect(part.length).to.equal(3);
				part.dispose();
			});
		});

		it("can take events in the constructor as an array of times and values", function(){
			return Offline(function(){
				var part = new Part(function(){}, [["0", "C4"], ["8n", "D3"], ["4n", "E4"]]);
				expect(part.length).to.equal(3);
				part.dispose();
			});
		});

		it("can retrieve an event using 'at'", function(){
			return Offline(function(){
				var part = new Part(function(){}, [["0", 0], ["8n", "C2"], ["4n", 2]]);
				expect(part.length).to.equal(3);
				expect(part.at(0)).to.be.instanceof(Event);
				expect(part.at(0).value).to.equal(0);
				expect(part.at("8n").value).to.equal("C2");
				expect(part.at("4n").value).to.equal(2);
				expect(part.at("2n")).to.be.null;
				part.dispose();
			});
		});

		it("can set the value of an existing event with 'at'", function(){
			return Offline(function(){
				var part = new Part({
					"events" : [[0, "C3"]]
				});
				expect(part.length).to.equal(1);
				expect(part.at(0).value).to.equal("C3");
				part.at(0, "C4");
				expect(part.at(0).value).to.equal("C4");
				part.dispose();
			});
		});

		it("can take events in the constructor as an array of objects", function(){
			return Offline(function(){
				var part = new Part(function(){}, [{
					"time" : 0.3,
					"note" : "C3"
				},
				{
					"time" : 1,
					"note" : "D3"
				}]);
				expect(part.length).to.equal(2);
				expect(part.at(0.3).value).to.be.object;
				expect(part.at(0.3).value.note).to.equal("C3");
				part.dispose();
			});
		});

		it("can cancel event changes", function(){
			var count = 0;
			return Offline(function(Transport){
				var part = new Part(function(time){
					count++;
				}, [{
					"time" : 0,
					"note" : "C3"
				},
				{
					"time" : 0.2,
					"note" : "D3"
				}]).start(0).stop(0.1);
				part.cancel(0.1);
				Transport.start(0);
			}, 0.3).then(function(){
				expect(count).to.equal(2);
			});
		});

		it("can add an event as a time and value", function(){
			return Offline(function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.add(1, "D3");
				expect(part.length).to.equal(1);
				expect(part.at(1).value).to.equal("D3");
				part.dispose();
			});
		});

		it("can add an event as an object", function(){
			return Offline(function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.add({
					"time" : 0.5,
					"note" : "D4",
					"duration" : "8n"
				});
				expect(part.length).to.equal(1);
				expect(part.at(0.5).value).to.be.object;
				expect(part.at(0.5).value.duration).to.deep.equal("8n");
				expect(part.at(0.5).value.note).to.deep.equal("D4");
				part.dispose();
			});
		});

		it("can add another part", function(){
			return Offline(function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				var subPart = new Part({
					"events" : [0, 0.5]
				});
				part.add(0.2, subPart);
				expect(part.length).to.equal(1);
				expect(part.at(0.2)).to.equal(subPart);
				part.dispose();
			});
		});

		it("can remove an event by time", function(){
			return Offline(function(){
				var part = new Part({
					"events" : [[0.2, "C3"], [0.2, "C4"]]
				});
				expect(part.length).to.equal(2);
				part.remove(0.2);
				expect(part.length).to.equal(0);
				part.dispose();
			});
		});

		it("can remove an event by time and value", function(){
			return Offline(function(){
				var secondEvent = {
					time : 0.2,
					note : "C4"
				};
				var part = new Part({
					"events" : [[0.2, "C2"], secondEvent]
				});
				expect(part.length).to.equal(2);
				part.remove(0.2, "C2");
				expect(part.length).to.equal(1);
				part.remove(secondEvent);
				expect(part.length).to.equal(0);
				part.dispose();
			});
		});

		it("added events have the same settings as the parent", function(){
			return Offline(function(){
				var part = new Part({
					"loopEnd" : "1m",
					"loopStart" : "4n",
					"probability" : 0.2,
					"events" : [[0.2, "C3"], [0.3, "C4"]]
				});
				part.humanize = 0.1;
				var firstEvent = part.at(0.2);
				expect(firstEvent.humanize).to.equal(0.1);
				expect(firstEvent.probability).to.equal(0.2);
				//loop duration is the same
				expect(firstEvent.loopEnd).to.equal(Time("1m").valueOf());
				expect(firstEvent.loopStart).to.equal(Time("4n").valueOf());

				var secondEvent = part.at(0.3);
				expect(secondEvent.humanize).to.equal(0.1);
				expect(secondEvent.probability).to.equal(0.2);
				//loop duration is the same
				expect(secondEvent.loopEnd).to.equal(Time("1m").valueOf());
				expect(secondEvent.loopStart).to.equal(Time("4n").valueOf());
				part.dispose();
			});
		});

		it("will create an event using at if one wasn't there at that time", function(){
			return Offline(function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				expect(part.at(0.1, "C4").value).to.equal("C4");
				expect(part.length).to.equal(1);
				part.dispose();
			});
		});

		it("can remove all of the events", function(){
			return Offline(function(){
				var part = new Part(function(){}, [0, 1, 2, 3, 4, 5]);
				expect(part.length).to.equal(6);
				part.removeAll();
				expect(part.length).to.equal(0);
				part.dispose();
			});
		});

	});

	context("Part callback", function(){

		it("does not invoke get invoked until started", function(){
			return Offline(function(Transport){
				new Part(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 0.4]);
				Transport.start();
			}, 0.5);
		});

		it("is invoked after it's started", function(){
			var invokations = 0;
			return Offline(function(Transport){
				new Part(function(){
					invokations++;
				}, [0, 0.1]).start(0);
				Transport.start();
			}, 0.2).then(function(){
				expect(invokations).to.equal(2);
			});
		});

		it("passes in the scheduled time to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var startTime = 0.1;
				var part = new Part(function(time){
					expect(time).to.be.a.number;
					expect(time - startTime).to.be.closeTo(0.5, 0.01);
					invoked = true;
				}, [0.3]);
				part.start(0.2);
				Transport.start(startTime);
			}, 0.62).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the value to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var part = new Part(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					part.dispose();
					invoked = true;
				}, [[0, "thing"]]).start();
				Transport.start();
			}, 0.6).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can mute the callback", function(){
			return Offline(function(){
				var part = new Part(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 0.1, 0.2, 0.3]).start();
				part.mute = true;
				expect(part.mute).to.be.true;
				Transport.start();
			}, 0.5);
		});

		it("can trigger with some probability", function(){
			return Offline(function(){
				var part = new Part(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 0.1, 0.2, 0.3]).start();
				part.probability = 0;
				expect(part.probability).to.equal(0);
				Transport.start();
			}, 0.4);
		});

		it("invokes all of the scheduled events", function(){
			var count = 0;
			return Offline(function(Transport){
				new Part(function(){
					count++;
				}, [0, 0.1, 0.2, 0.3]).start();
				Transport.start();
			}, 0.4).then(function(){
				expect(count).to.equal(4);
			});
		});

		it("invokes all of the scheduled events at the correct times", function(){
			var count = 0;
			return Offline(function(Transport){
				var now = Transport.now() + 0.1;
				new Part(function(time, value){
					count++;
					expect(time - now).to.be.closeTo(value, 0.01);
				}, [[0, 0], [0.1, 0.1], [0.2, 0.2]]).start();
				Transport.start(now);
			}, 0.4).then(function(){
				expect(count).to.equal(3);
			});
		});

		it("starts an event added after the part was started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var part = new Part({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1){
							invoked = true;
						}
					},
					"events" : [[0, 0]]
				}).start(0);
				Transport.start();

				return Test.atTime(0.1, function(){
					part.add(0.1, 1);
				});
			}, 0.6).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can schedule a subpart", function(){
			var invokations = 0;
			return Offline(function(Transport){
				var startTime = 0.1;
				var subPart = new Part({
					"events" : [[0, 1], [0.3, 2]]
				});
				var part = new Part(function(time, value){
					invokations++;
					if (value === 0){
						expect(time - startTime).to.be.closeTo(0, 0.01);
					} else if (value === 1){
						expect(time - startTime).to.be.closeTo(0.2, 0.01);
					} else if (value === 2){
						expect(time - startTime).to.be.closeTo(0.5, 0.01);
						part.dispose();
					}
				}).add(0.2, subPart).add(0, 0).start(0);
				Transport.start(startTime);
			}, 0.7).then(function(){
				expect(invokations).to.equal(3);
			});
		});

		it("can start with an offset", function(){
			var invoked = false;
			return Offline(function(Transport){
				var startTime = 0.1;
				var part = new Part(function(time, number){
					expect(time - startTime).to.be.closeTo(0.1, 0.01);
					expect(number).to.equal(1);
					invoked = true;
				}, [[0, 0], [1, 1]]).start(0, 0.9);
				Transport.start(startTime);
			}, 0.3).then(function(){
				expect(invoked).to.be.true;
			});
		});

	});

	context("Looping", function(){

		it("can be set using a boolean as an argument when created", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Part({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(){
						callCount++;
					},
					"events" : [[0, 1], [0.1, 2]]
				}).start(0);
				Transport.start();
			}, 0.55).then(function(){
				expect(callCount).to.equal(6);
			});
		});

		it("can be toggled off using a boolean", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var part = new Part({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(){
						callCount++;
					},
					"events" : [[0, 1], [0.1, 2]]
				}).start(0);
				part.loop = false;
				Transport.start();
			}, 0.55).then(function(){
				expect(callCount).to.equal(2);
			});
		});

		it("can be toggled on using a boolean", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var part = new Part({
					"loopEnd" : 0.2,
					"loop" : false,
					"callback" : function(){
						callCount++;
					},
					"events" : [[0, 1], [0.1, 2]]
				}).start(0);
				part.loop = true;
				Transport.start();
			}, 0.55).then(function(){
				expect(callCount).to.equal(6);
			});
		});

		it("can be set to loop at a specific interval", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				var part = new Part({
					"loopEnd" : 0.25,
					"loop" : true,
					"callback" : function(time){
						if (lastCall){
							invoked = true;
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					},
					"events" : [0]
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("a started part will be stopped if it is after the loopEnd", function(){
			var invoked = true;
			return Offline(function(Transport){
				var switched = false;
				var part = new Part({
					"loopEnd" : 0.5,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1 && !switched){
							switched = true;
							part.loopEnd = 0.2;
						} else if (switched){
							expect(value).to.equal(0);
							invoked = true;
						}
					},
					"events" : [[0, 0], [0.25, 1]]
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("a started part will be stopped if it is before the loopStart", function(){
			var invoked = false;
			return Offline(function(Transport){
				var switched = false;
				var part = new Part({
					"loopEnd" : 0.5,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1 && !switched){
							switched = true;
							part.loopStart = 0.2;
						} else if (switched){
							expect(value).to.equal(1);
							invoked = true;
						}
					},
					"events" : [[0, 0], [0.25, 1]]
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can loop a specific number of times", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Part({
					"loopEnd" : 0.125,
					"loop" : 3,
					"callback" : function(){
						callCount++;
					},
					"events" : [0, 0.1]
				}).start(0.1);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(6);
			});
		});

		it("plays once when loop is 1", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Part({
					"loopEnd" : 0.125,
					"loop" : 1,
					"callback" : function(){
						callCount++;
					},
					"events" : [0, 0.1]
				}).start(0.1);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(2);
			});
		});

    it("plays once when loop is 0", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Part({
					"loopEnd" : 0.125,
					"loop" : 0,
					"callback" : function(){
						callCount++;
					},
					"events" : [0, 0.1]
				}).start(0.1);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(2);
			});
		});

    it("plays once when loop is false", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Part({
					"loopEnd" : 0.125,
					"loop" : false,
					"callback" : function(){
						callCount++;
					},
					"events" : [0, 0.1]
				}).start(0.1);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(2);
			});
		});

		it("can loop between loopStart and loopEnd", function(){
			var invoked = false;
			return Offline(function(Transport){
				new Part({
					"loopStart" : "8n",
					"loopEnd" : "4n",
					"loop" : true,
					"callback" : function(time, value){
						expect(value).to.be.at.least(1);
						expect(value).to.be.at.most(2);
						invoked = true;
					},
					"events" : [[0, 0], ["8n", 1], ["8n + 16n", 2], ["4n", 3]]
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can be started and stopped multiple times", function(){
			var eventTimeIndex = 0;
			return Offline(function(Transport){
				var eventTimes = [[0.5, 0], [0.6, 1], [1.1, 0], [1.2, 1], [1.3, 2], [1.4, 0], [1.5, 1], [1.6, 2]];
				new Part({
					"loopEnd" : 0.3,
					"loopStart" : 0,
					"loop" : true,
					"callback" : function(time, value){
						expect(eventTimes.length).to.be.gt(eventTimeIndex);
						expect(eventTimes[eventTimeIndex][0]).to.be.closeTo(time, 0.05);
						expect(eventTimes[eventTimeIndex][1]).to.equal(value);
						eventTimeIndex++;
					},
					"events" : [[0, 0], [0.1, 1], [0.2, 2]]
				}).start(0.3).stop(0.81);
				Transport.start(0.2).stop(0.61).start(0.8);
			}, 2).then(function(){
				expect(eventTimeIndex).to.equal(8);
			});
		});

		it("can adjust the loopEnd times", function(){
			var eventTimeIndex = 0;
			return Offline(function(Transport){
				var eventTimes = [[0.5, 0], [0.6, 1], [1.1, 0], [1.2, 1], [1.3, 2], [1.4, 0], [1.5, 1], [1.6, 2]];
				var part = new Part({
					"loopEnd" : 0.2,
					"loopStart" : 0,
					"loop" : true,
					"callback" : function(time, value){
						expect(eventTimes.length).to.be.gt(eventTimeIndex);
						expect(eventTimes[eventTimeIndex][0]).to.be.closeTo(time, 0.05);
						expect(eventTimes[eventTimeIndex][1]).to.equal(value);
						eventTimeIndex++;
					},
					"events" : [[0, 0], [0.1, 1], [0.2, 2]]
				}).start(0.3).stop(0.81);
				part.loopEnd = 0.4;
				part.loopEnd = 0.3;
				Transport.start(0.2).stop(0.61).start(0.8);
			}, 2).then(function(){
				expect(eventTimeIndex).to.equal(8);
			});
		});

		it("reports the progress of the loop", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var part = new Part({
					"loopStart" : 0,
					"loopEnd" : 1,
					"loop" : true,
					"callback" : function(){
						callCount++;
					},
					"events" : [0]
				}).start(0);
				Transport.start(0);
				return function(time){
					expect(part.progress).to.be.closeTo(time, 0.01);
				};
			}, 0.8).then(function(){
				expect(callCount).to.equal(1);
			});
		});

		it("can start a loop with an offset", function(){
			var iteration = 0;
			return Offline(function(Transport){
				var now = Tone.now();
				var part = new Part(function(time, number){
					if (iteration === 0){
						expect(number).to.equal(1);
						expect(time - now).to.be.closeTo(0.2, 0.05);
					} else if (iteration === 1){
						expect(number).to.equal(0);
					}
					iteration++;
				}, [[0, 0], [0.25, 1]]);
				part.loop = true;
				part.loopEnd = 0.5;
				part.start(0, 1.05);
				Transport.start(0);
			}, 0.6).then(function(){
				expect(iteration).to.equal(2);
			});
		});

		it("can start a loop with an offset before loop start", function(){
			var iteration = 0;
			return Offline(function(Transport){
				var part = new Part(function(time, number){
					if (iteration === 0){
						expect(number).to.equal(0);
					} else if (iteration === 1){
						expect(number).to.equal(1);
					} else if (iteration === 2){
						expect(number).to.equal(2);
					} else if (iteration === 3){
						expect(number).to.equal(1);
					} else if (iteration === 4){
						expect(number).to.equal(2);
					}
					iteration++;
				}, [[0, 0], [0.25, 1], [0.30, 2]]);
				part.loop = true;
				part.loopStart = 0.25;
				part.loopEnd = 0.5;
				part.start(0, 0);
				Transport.start(Tone.now());
			}, 0.7).then(function(){
				expect(iteration).to.equal(5);
			});
		});

	});

	context("playbackRate", function(){

		it("can adjust the playbackRate", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				new Part({
					"playbackRate" : 2,
					"loopEnd" : 1,
					"loop" : true,
					"events" : [0, 0.5],
					"callback" : function(time){
						if (lastCall){
							invoked = true;
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start(0);
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can adjust the playbackRate after starting", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				var part = new Part({
					"playbackRate" : 1,
					"loopEnd" : 0.5,
					"loop" : true,
					"events" : [0, 0.25],
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.5, 0.01);
						} else {
							invoked = true;
							part.playbackRate = 0.5;
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start(0);
			}, 0.8).then(function(){
				expect(invoked).to.be.true;
			});
		});
	});
});

