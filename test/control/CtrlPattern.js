import CtrlPattern from "Tone/control/CtrlPattern";
import Basic from "helper/Basic";

describe("CtrlPattern", function(){

	Basic(CtrlPattern);

	context("API", function(){

		it("can be constructed with an array and type", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3], "down");
			expect(pattern.values).to.deep.equal([0, 1, 2, 3]);
			expect(pattern.type).to.equal("down");
			pattern.dispose();
		});

		it("can be constructed with an object", function(){
			var pattern = new CtrlPattern({
				values : [1, 2, 3],
				type : "upDown"
			});
			expect(pattern.values).to.deep.equal([1, 2, 3]);
			expect(pattern.type).to.equal("upDown");
			pattern.dispose();
		});

		it("returns undefined with no pattern", function(){
			var pattern = new CtrlPattern();
			expect(pattern.next()).to.be.undefined;
			pattern.dispose();
		});

		it("can set the index", function(){
			var pattern = new CtrlPattern([0, 2, 3, 4]);
			pattern.index = 2;
			expect(pattern.index).to.be.equal(2);
			pattern.dispose();
		});

		it("can be resized smaller when the index is after the previous length", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3, 4]);
			pattern.index = 2;
			pattern.next();
			expect(pattern.index).to.equal(3);
			pattern.values = [0, 1, 2];
			expect(pattern.next()).to.equal(0);
			expect(pattern.index).to.equal(0);
			pattern.dispose();
		});
	});

	context("Patterns", function(){

		it("does the up pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3], "up");
			var output = [];
			for (var i = 0; i < 6; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([0, 1, 2, 3, 0, 1]);
			pattern.dispose();
		});

		it("does the down pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3], "down");
			var output = [];
			for (var i = 0; i < 6; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([3, 2, 1, 0, 3, 2]);
			pattern.dispose();
		});

		it("does the upDown pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3], "upDown");
			var output = [];
			for (var i = 0; i < 10; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([0, 1, 2, 3, 2, 1, 0, 1, 2, 3]);
			pattern.dispose();
		});

		it("does the downUp pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3], "downUp");
			var output = [];
			for (var i = 0; i < 10; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([3, 2, 1, 0, 1, 2, 3, 2, 1, 0]);
			pattern.dispose();
		});

		it("does the alternateUp pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3, 4], "alternateUp");
			var output = [];
			for (var i = 0; i < 10; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([0, 2, 1, 3, 2, 4, 3, 0, 2, 1]);
			pattern.dispose();
		});

		it("does the alternateDown pattern", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3, 4], "alternateDown");
			var output = [];
			for (var i = 0; i < 10; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			expect(output).to.deep.equal([4, 2, 3, 1, 2, 0, 1, 4, 2, 3]);
			pattern.dispose();
		});

		it("outputs random elements form the values", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3, 4], "random");
			for (var i = 0; i < 10; i++){
				var output = pattern.value;
				pattern.next();
				expect(pattern.values.indexOf(output)).to.not.equal(-1);
			}
			pattern.dispose();
		});

		it("does a randomWalk", function(){
			var pattern = new CtrlPattern([0, 1, 2, 3, 4], "randomWalk");
			pattern.index = 2;
			expect(pattern.value).to.equal(2);
			pattern.next();
			//has moved one away
			expect(Math.abs(pattern.index - 2)).to.equal(1);
			var currentIndex = pattern.index;
			//moved another one away
			pattern.next();
			expect(Math.abs(pattern.index - currentIndex)).to.equal(1);
			pattern.dispose();
		});

		it("does randomOnce pattern", function(){
			var pattern = new CtrlPattern([4, 5, 6, 7, 8], "randomOnce");
			var output = [];
			for (var i = 0; i < 5; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			output = output.sort();
			expect(output).to.deep.equal([4, 5, 6, 7, 8]);
			pattern.dispose();
		});
		
		it("randomOnce can update if length of pattern changes", function(){
			var pattern = new CtrlPattern([4, 5, 6, 7, 8], "randomOnce");
			pattern.values = [4, 5, 6, 7, 8, 9];
			var output = [];
			for (var i = 0; i < 6; i++){
				output[i] = pattern.value;
				pattern.next();
			}
			output = output.sort();
			expect(output).to.deep.equal([4, 5, 6, 7, 8, 9]);
			pattern.dispose();
		});
	});
});

