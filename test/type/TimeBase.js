define(["helper/Basic", "Test", "Tone/core/Transport", "Tone/type/TimeBase", "Tone/core/Tone"], 
	function (Basic, Test, Transport, TimeBase, Tone) {

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
				expect(time.eval()).to.equal(1);
				time.dispose();
			});

			it("can pass in a string in the constructor", function(){
				var time = TimeBase("1");
				expect(time).to.be.instanceOf(TimeBase);
				expect(time.eval()).to.equal(1);
				time.dispose();
			});

			it("can pass in a TimeBase in the constructor", function(){
				var arg = TimeBase(1);
				var time = TimeBase(arg);
				expect(time.eval()).to.equal(1);
				time.dispose();
			});

			it("can pass in a value and a type", function(){
				expect(TimeBase(4, "n").eval()).to.equal(0.5);
				expect(TimeBase("4", "n").eval()).to.equal(0.5);
			});

		});

		context("Copy/Clone/Set", function(){

			it("can set a new value", function(){
				var time = new TimeBase(1);
				expect(time.eval()).to.equal(1);
				time.set(2);
				expect(time.eval()).to.equal(2);
			});

			it("can clone a TimeBase", function(){
				var time = new TimeBase(1);
				var cloned = time.clone();
				expect(cloned).to.not.equal(time);
				expect(cloned).to.be.instanceOf(TimeBase);
				expect(time.eval()).to.equal(1);
				expect(cloned.eval()).to.equal(1);
			});

			it("the clone is not modified when the original is", function(){
				var time = new TimeBase(1);
				var cloned = time.clone();				
				expect(time.eval()).to.equal(1);
				expect(cloned.eval()).to.equal(1);
				time.add(1);
				expect(time.eval()).to.equal(2);
				expect(cloned.eval()).to.equal(1);
				time.set(3);
				expect(time.eval()).to.equal(3);
				expect(cloned.eval()).to.equal(1);
			});

			it("can copy values from another TimeBase", function(){
				var time = new TimeBase(2);
				var copy = new TimeBase(1);	
				expect(time.eval()).to.equal(2);
				expect(copy.eval()).to.equal(1);
				copy.copy(time);
				expect(time.eval()).to.equal(2);
				expect(copy.eval()).to.equal(2);
			});
		});

		context("Eval", function(){

			it("evaluates numbers as seconds", function(){
				expect(TimeBase("1").eval()).to.equal(1);
				expect(TimeBase(2, "s").eval()).to.equal(2);
				expect(TimeBase(3.2).eval()).to.equal(3.2);
			});

			it("evaluates notation", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(TimeBase("4n").eval()).to.equal(0.5);
				expect(TimeBase("8n").eval()).to.equal(0.25);
				expect(TimeBase(16, "n").eval()).to.equal(0.125);
				expect(TimeBase("32n").eval()).to.equal(0.5/8);
				expect(TimeBase("2t").eval()).to.equal(2/3);

				Tone.Transport.bpm.value = 60;
				Tone.Transport.timeSignature = [5,4];
				expect(TimeBase("1m").eval()).to.equal(5);
				expect(TimeBase(2, "m").eval()).to.equal(10);
				expect(TimeBase("5m").eval()).to.equal(25);

				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
			});

			it("evalutes hertz", function(){
				expect(TimeBase("1hz").eval()).to.equal(1);
				expect(TimeBase("2hz").eval()).to.equal(0.5);
				expect(TimeBase(4, "hz").eval()).to.equal(0.25);
				expect(TimeBase("0.25hz").eval()).to.equal(4);
			});

			it("evalutes ticks", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(TimeBase(Tone.Transport.PPQ, "i").eval()).to.equal(0.5);
				expect(TimeBase(1, "i").eval()).to.equal(0.5 / Tone.Transport.PPQ);
			});

			it("evalutes transport time", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(TimeBase("1:0:0").eval()).to.equal(2);
				expect(TimeBase("0:3:2").eval()).to.equal(1.75);
				expect(TimeBase("0:0:2.2").eval()).to.equal(0.275);
			});
		});

		context("Evaluates Expressions", function(){

			it("addition", function(){
				expect(TimeBase("1 + 1").eval()).to.equal(2);
				expect(TimeBase("1+1+2").eval()).to.equal(4);
				expect(TimeBase("1 + 1 +  2 + 3").eval()).to.equal(7);
			});

			it("subtraction", function(){
				expect(TimeBase("2 - 1").eval()).to.equal(1);
				expect(TimeBase("1+1-2").eval()).to.equal(0);
				expect(TimeBase("1 + 1 - 2 + 3").eval()).to.equal(3);
			});

			it("multiplication", function(){
				expect(TimeBase("2 * 0.5").eval()).to.equal(1);
				expect(TimeBase("1.5*2*3").eval()).to.equal(9);
				expect(TimeBase("1*2*3*4.5").eval()).to.equal(27);
			});

			it("division", function(){
				expect(TimeBase("0.5 / 4").eval()).to.equal(0.125);
				expect(TimeBase("4 / 0.5").eval()).to.equal(8);
				expect(TimeBase("4/0.5/2").eval()).to.equal(4);
			});

			it("negative numbers", function(){
				expect(TimeBase("-1").eval()).to.equal(-1);
				expect(TimeBase("1 - -2").eval()).to.equal(3);
				expect(TimeBase("-1 + -2").eval()).to.equal(-3);
			});

			it("handles precedence", function(){
				expect(TimeBase("1 + 2 / 4").eval()).to.equal(1.5);
				expect(TimeBase("1 + 2 / 4 * 3").eval()).to.equal(2.5);
				expect(TimeBase("1 + 2 / 4 * 3 - 2").eval()).to.equal(0.5);
			});

			it("handles parenthesis", function(){
				expect(TimeBase("(1 + 2) / 4").eval()).to.equal(0.75);
				expect(TimeBase("(1 + 2) / (4 * 3)").eval()).to.equal(0.25);
				expect(TimeBase("1 - ((2 / (4 * 2)) - 2)").eval()).to.equal(2.75);
			});

			it("evals expressions combining multiple types", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(TimeBase("1n + 1").eval()).to.equal(3);
				expect(TimeBase("1:2:0 + 2t * 1.5").eval()).to.equal(4);
				expect(TimeBase("(1:2:0 + 2n) * (1m / 4)").eval()).to.equal(2);
				expect(TimeBase("0.5hz + 1").eval()).to.equal(3);
			});
		});

		context("Operators", function(){

			it("can add values", function(){
				expect(TimeBase(1).add(2).eval()).to.equal(3);
				expect(TimeBase(3).add(-2).add(2).eval()).to.equal(3);
			});

			it("can multiply values", function(){
				expect(TimeBase(5).mult(2).eval()).to.equal(10);
				expect(TimeBase(8).mult(-2).mult(4).eval()).to.equal(-64);
			});

			it("can divide values", function(){
				expect(TimeBase(4).div(2).eval()).to.equal(2);
				expect(TimeBase(8).div(2).div(2).eval()).to.equal(2);
			});

			it("can subtract values", function(){
				expect(TimeBase(4).sub(2).eval()).to.equal(2);
				expect(TimeBase(8).sub(2).sub(2).eval()).to.equal(4);
			});

			it("can combine operations", function(){
				expect(TimeBase(4).mult(2).add(3).eval()).to.equal(11);
				expect(TimeBase(8).sub(2).div(2).mult(8).eval()).to.equal(24);
			});

			it("can combine operation with nested expressions", function(){
				expect(TimeBase("4 + 0.5").mult(2).add("6/3").eval()).to.equal(11);
			});

		});

	});
});