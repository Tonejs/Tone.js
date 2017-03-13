define(["helper/Basic", "Test", "Tone/type/TimeBase", "Tone/core/Tone", "helper/Offline"], 
	function (Basic, Test, TimeBase, Tone, Offline) {

	describe("TimeBase", function(){

		Basic(TimeBase);

		context("Constructor", function(){

			it("can be made with or without 'new'", function(){
				var t0 = TimeBase();
				expect(t0).to.be.instanceOf(TimeBase);
				t0.dispose();
				var t1 = new TimeBase();
				expect(t1).to.be.instanceOf(TimeBase);
				t1.dispose();
			});

			it("can pass in a number in the constructor", function(){
				var time = TimeBase(1);
				expect(time).to.be.instanceOf(TimeBase);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});

			it("can pass in a string in the constructor", function(){
				var time = TimeBase("1");
				expect(time).to.be.instanceOf(TimeBase);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});

			it("can pass in a TimeBase in the constructor", function(){
				var arg = TimeBase(1);
				var time = TimeBase(arg);
				expect(time.valueOf()).to.equal(1);
				time.dispose();
			});

			it("can pass in a value and a type", function(){
				expect(TimeBase(4, "n").valueOf()).to.equal(0.5);
				expect(TimeBase("4", "n").valueOf()).to.equal(0.5);
			});

		});

		context("Copy/Clone/Set", function(){

			it("can set a new value", function(){
				var time = new TimeBase(1);
				expect(time.valueOf()).to.equal(1);
				time.set(2);
				expect(time.valueOf()).to.equal(2);
			});

			it("can clone a TimeBase", function(){
				var time = new TimeBase(1);
				var cloned = time.clone();
				expect(cloned).to.not.equal(time);
				expect(cloned).to.be.instanceOf(TimeBase);
				expect(time.valueOf()).to.equal(1);
				expect(cloned.valueOf()).to.equal(1);
			});

			it("the clone is not modified when the original is", function(){
				var time = new TimeBase(1);
				var cloned = time.clone();				
				expect(time.valueOf()).to.equal(1);
				expect(cloned.valueOf()).to.equal(1);
				time.add(1);
				expect(time.valueOf()).to.equal(2);
				expect(cloned.valueOf()).to.equal(1);
				time.set(3);
				expect(time.valueOf()).to.equal(3);
				expect(cloned.valueOf()).to.equal(1);
			});

			it("can copy values from another TimeBase", function(){
				var time = new TimeBase(2);
				var copy = new TimeBase(1);	
				expect(time.valueOf()).to.equal(2);
				expect(copy.valueOf()).to.equal(1);
				copy.copy(time);
				expect(time.valueOf()).to.equal(2);
				expect(copy.valueOf()).to.equal(2);
			});
		});

		context("Eval", function(){

			it("evaluates numbers as seconds", function(){
				expect(TimeBase("1").valueOf()).to.equal(1);
				expect(TimeBase(2, "s").valueOf()).to.equal(2);
				expect(TimeBase(3.2).valueOf()).to.equal(3.2);
			});

			it("evaluates notation", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					Transport.timeSignature = 4;
					expect(TimeBase("4n").valueOf()).to.equal(0.5);
					expect(TimeBase("8n").valueOf()).to.equal(0.25);
					expect(TimeBase(16, "n").valueOf()).to.equal(0.125);
					expect(TimeBase("32n").valueOf()).to.equal(0.5/8);
					expect(TimeBase("2t").valueOf()).to.equal(2/3);
					Transport.bpm.value = 60;
					Transport.timeSignature = [5,4];
					expect(TimeBase("1m").valueOf()).to.equal(5);
					expect(TimeBase(2, "m").valueOf()).to.equal(10);
					expect(TimeBase("5m").valueOf()).to.equal(25);
				});
			});

			it("evalutes hertz", function(){
				expect(TimeBase("1hz").valueOf()).to.equal(1);
				expect(TimeBase("2hz").valueOf()).to.equal(0.5);
				expect(TimeBase(4, "hz").valueOf()).to.equal(0.25);
				expect(TimeBase("0.25hz").valueOf()).to.equal(4);
			});

			it("evalutes ticks", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					Transport.timeSignature = 4;
					expect(TimeBase(Transport.PPQ, "i").valueOf()).to.equal(0.5);
					expect(TimeBase(1, "i").valueOf()).to.equal(0.5 / Transport.PPQ);
				});
			});

			it("evalutes transport time", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					Transport.timeSignature = 4;
					expect(TimeBase("1:0:0").valueOf()).to.equal(2);
					expect(TimeBase("0:3:2").valueOf()).to.equal(1.75);
					expect(TimeBase("0:0:2.2").valueOf()).to.equal(0.275);
				});
			});

			it("is evaluated in equations and comparisons using valueOf", function(){
				expect(TimeBase(1) + 1).to.equal(2);
				expect(TimeBase(1) + TimeBase(1)).to.equal(2);
				expect(TimeBase(1) > TimeBase(0)).to.be.true;
				expect(+TimeBase(1)).to.equal(1);
			});
		});

		context("Evaluates Expressions", function(){

			it("addition", function(){
				expect(TimeBase("1 + 1").valueOf()).to.equal(2);
				expect(TimeBase("1+1+2").valueOf()).to.equal(4);
				expect(TimeBase("1 + 1 +  2 + 3").valueOf()).to.equal(7);
			});

			it("subtraction", function(){
				expect(TimeBase("2 - 1").valueOf()).to.equal(1);
				expect(TimeBase("1+1-2").valueOf()).to.equal(0);
				expect(TimeBase("1 + 1 - 2 + 3").valueOf()).to.equal(3);
			});

			it("multiplication", function(){
				expect(TimeBase("2 * 0.5").valueOf()).to.equal(1);
				expect(TimeBase("1.5*2*3").valueOf()).to.equal(9);
				expect(TimeBase("1*2*3*4.5").valueOf()).to.equal(27);
			});

			it("division", function(){
				expect(TimeBase("0.5 / 4").valueOf()).to.equal(0.125);
				expect(TimeBase("4 / 0.5").valueOf()).to.equal(8);
				expect(TimeBase("4/0.5/2").valueOf()).to.equal(4);
			});

			it("negative numbers", function(){
				expect(TimeBase("-1").valueOf()).to.equal(-1);
				expect(TimeBase("1 - -2").valueOf()).to.equal(3);
				expect(TimeBase("-1 + -2").valueOf()).to.equal(-3);
			});

			it("handles precedence", function(){
				expect(TimeBase("1 + 2 / 4").valueOf()).to.equal(1.5);
				expect(TimeBase("1 + 2 / 4 * 3").valueOf()).to.equal(2.5);
				expect(TimeBase("1 + 2 / 4 * 3 - 2").valueOf()).to.equal(0.5);
			});

			it("handles parenthesis", function(){
				expect(TimeBase("(1 + 2) / 4").valueOf()).to.equal(0.75);
				expect(TimeBase("(1 + 2) / (4 * 3)").valueOf()).to.equal(0.25);
				expect(TimeBase("1 - ((2 / (4 * 2)) - 2)").valueOf()).to.equal(2.75);
			});

			it("evals expressions combining multiple types", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					Transport.timeSignature = 4;
					expect(TimeBase("1n + 1").valueOf()).to.equal(3);
					expect(TimeBase("1:2:0 + 2t * 1.5").valueOf()).to.equal(4);
					expect(TimeBase("(1:2:0 + 2n) * (1m / 4)").valueOf()).to.equal(2);
					expect(TimeBase("0.5hz + 1").valueOf()).to.equal(3);
				});
			});
		});

		context("Operators", function(){

			it("can add values", function(){
				expect(TimeBase(1).add(2).valueOf()).to.equal(3);
				expect(TimeBase(3).add(-2).add(2).valueOf()).to.equal(3);
			});

			it("can multiply values", function(){
				expect(TimeBase(5).mult(2).valueOf()).to.equal(10);
				expect(TimeBase(8).mult(-2).mult(4).valueOf()).to.equal(-64);
			});

			it("can divide values", function(){
				expect(TimeBase(4).div(2).valueOf()).to.equal(2);
				expect(TimeBase(8).div(2).div(2).valueOf()).to.equal(2);
			});

			it("can subtract values", function(){
				expect(TimeBase(4).sub(2).valueOf()).to.equal(2);
				expect(TimeBase(8).sub(2).sub(2).valueOf()).to.equal(4);
			});

			it("can combine operations", function(){
				expect(TimeBase(4).mult(2).add(3).valueOf()).to.equal(11);
				expect(TimeBase(8).sub(2).div(2).mult(8).valueOf()).to.equal(24);
			});

			it("can combine operation with nested expressions", function(){
				expect(TimeBase("4 + 0.5").mult(2).add("6/3").valueOf()).to.equal(11);
			});

		});

	});
});