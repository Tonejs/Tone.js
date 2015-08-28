define(["Tone/component/MidSideSplit", "Tone/component/MidSideMerge", "helper/Basic", "Tone/signal/Signal", "helper/PassAudioStereo", 
	"Test", "helper/Offline", "Tone/component/Merge"], 
function (MidSideSplit, MidSideMerge, Basic, Signal, PassAudioStereo, Test, Offline, Merge) {

	describe("MidSideSplit", function(){

		Basic(MidSideSplit);

		context("Splitting", function(){

			it ("handles inputs and outputs", function(){
				var split = new MidSideSplit();
				Test.connect(split);
				split.mid.connect(Test);
				split.side.connect(Test);
				split.dispose();
			});

			it("mid is if both L and R are the same", function(done){
				var split;
				var merge;
				var signalL, signalR;
				new Offline(0.2)
					.before(function(dest){
						split = new MidSideSplit();
						split.mid.connect(dest);
						merge = new Merge().connect(split);
						signalL = new Signal(0.5).connect(merge.left);
						signalR = new Signal(0.5).connect(merge.right);
					})
					.test(function(sample){
						expect(sample).to.be.closeTo(0.707, 0.01);
					})
					.after(function(){
						split.dispose();
						merge.dispose();
						signalL.dispose();
						signalR.dispose();
						done();
					}).run();
			});

			it("side is 0 if both L and R are the same", function(done){
				var split;
				var merge;
				var signalL, signalR;
				new Offline(0.2)
					.before(function(dest){
						split = new MidSideSplit();
						split.side.connect(dest);
						merge = new Merge().connect(split);
						signalL = new Signal(0.5).connect(merge.left);
						signalR = new Signal(0.5).connect(merge.right);
					})
					.test(function(sample){
						expect(sample).to.be.closeTo(0, 0.01);
					})
					.after(function(){
						split.dispose();
						merge.dispose();
						signalL.dispose();
						signalR.dispose();
						done();
					}).run();
			});

			it("mid is 0 if both L and R opposites", function(done){
				var split;
				var merge;
				var signalL, signalR;
				new Offline(0.2)
					.before(function(dest){
						split = new MidSideSplit();
						split.mid.connect(dest);
						merge = new Merge().connect(split);
						signalL = new Signal(-1).connect(merge.left);
						signalR = new Signal(1).connect(merge.right);
					})
					.test(function(sample){
						expect(sample).to.be.closeTo(0, 0.01);
					})
					.after(function(){
						split.dispose();
						merge.dispose();
						signalL.dispose();
						signalR.dispose();
						done();
					}).run();
			});

			it ("can decompose and reconstruct a signal", function(done){
				var split, midSideMerge;
				var merge;
				var signalL, signalR;
				new Offline(0.2, 2)
					.before(function(dest){
						midSideMerge = new MidSideMerge().connect(dest);
						split = new MidSideSplit();
						split.mid.connect(midSideMerge.mid);
						split.side.connect(midSideMerge.side);
						merge = new Merge().connect(split);
						signalL = new Signal(0.2).connect(merge.left);
						signalR = new Signal(0.4).connect(merge.right);
					})
					.test(function(samples){
						expect(samples[0]).to.be.closeTo(0.2, 0.01);
						expect(samples[1]).to.be.closeTo(0.4, 0.01);
					})
					.after(function(){
						split.dispose();
						merge.dispose();
						signalL.dispose();
						signalR.dispose();
						midSideMerge.dispose();
						done();
					}).run();
			});
		});
	});
});