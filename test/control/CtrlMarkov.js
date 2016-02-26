define(["Tone/control/CtrlMarkov", "helper/Basic"], function (CtrlMarkov, Basic) {

	describe("CtrlMarkov", function(){

		Basic(CtrlMarkov);

		context("API", function(){

			it ("can be constructed with a description and initial state", function(){
				var markov = new CtrlMarkov({
					"a" : ["a", "b"],
					"b": ["b", "c"],
					"c": "a"
				}, "a");
				expect(markov.values).to.have.keys(["a", "b", "c"]);
				expect(markov.value).to.equal("a");
				markov.dispose();
			});

			it ("can move to the next state", function(){
				var markov = new CtrlMarkov({
					"a" : "b",
					"b": "c",
					"c": "a"
				}, "a");
				expect(markov.value).to.equal("a");
				expect(markov.next()).to.equal("b");
				expect(markov.value).to.equal("b");
				expect(markov.next()).to.equal("c");
				expect(markov.next()).to.equal("a");
				markov.dispose();
			});

			it ("can move to the next with an array of options", function(){
				var markov = new CtrlMarkov({
					"a" : ["b", "c"],
					"b": "a",
					"c": "a"
				}, "a");
				expect(markov.value).to.equal("a");
				expect(markov.next()).to.satisfy(function(state){
					return state === "b" || state === "c";
				});
				expect(markov.next()).to.equal("a");
				markov.dispose();
			});

			it ("can move to the next with an object of options", function(){
				var markov = new CtrlMarkov({
					"a" : [{
						"value" : "b",
						"probability" : 0.2
					}, {
						"value" : "c",
						"probability" : 0.9
					}],
					"b": "a",
					"c": "a"
				}, "a");
				expect(markov.value).to.equal("a");
				expect(markov.next()).to.satisfy(function(state){
					return state === "b" || state === "c";
				});
				expect(markov.next()).to.equal("a");
				markov.dispose();
			});

			it ("stays on a state when it has no more options", function(){
				var markov = new CtrlMarkov({
					"a" : "end"
				}, "a");
				expect(markov.value).to.equal("a");
				expect(markov.next()).to.equal("end");
				expect(markov.next()).to.equal("end");
				markov.value = "a";
				expect(markov.value).to.equal("a");
				expect(markov.next()).to.equal("end");
				expect(markov.next()).to.equal("end");
				markov.dispose();
			});
		});
	});
});