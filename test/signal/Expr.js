
define(["Tone/signal/Signal", "Tone/signal/Expr", "Test", "helper/Basic", 
	"helper/OutputAudio", "helper/PassAudio", "helper/Offline", "helper/ConstantOutput"], 
function(Signal, Expr, Test, Basic, OutputAudio, PassAudio, Offline, ConstantOutput){

	describe("Expr", function(){

		Basic(Expr, "1");

		context("I/O", function(){

			it("can create inputs", function(){
				var exp = new Expr("$0 + $1");
				Test.connect(exp, 0);
				Test.connect(exp, 1);
				exp.dispose();
			});

			it("has an output", function(){
				var exp = new Expr("0 + 0");
				exp.connect(Test);
				exp.dispose();
			});

			it("outputs audio", function(){
				return OutputAudio(function(){
					new Expr("1.1").toMaster();
				});
			});

			it("passes input", function(){
				return PassAudio(function(input){
					var exp = new Expr("$0");
					input.connect(exp);
					exp.toMaster();
				});
			});
		});

		context("Parsing", function(){

			it("can do string replacements", function(){
				return ConstantOutput(function(){
					var exp = new Expr("% + %", 0.2, 0.8);
					exp.toMaster();
				}, 1); 
			});

			it("can do string replacements with strings", function(){
				return ConstantOutput(function(){
					new Expr("%", "1 + 2").toMaster();
				}, 3);
			});

			it("handles precendence", function(){
				return ConstantOutput(function(){
					new Expr("8 + 16 * 4 * (2 - 1)").toMaster();
				}, 72);
			});

			it("tolerates inconsistent spacing", function(){
				return ConstantOutput(function(){
					new Expr("2 *    3-2 *4 ").toMaster();
				}, -2);
			});

			it("handles parens", function(){
				return ConstantOutput(function(){
					new Expr("(8 + 16) * (4 - 1)").toMaster();
				}, 72);
			});
		});

		context("Math", function(){

			it("does signal addition", function(){
				return ConstantOutput(function(){
					new Expr("1 + 3").toMaster();
				}, 4);
			});

			it("does signal multiplication", function(){
				return ConstantOutput(function(){
					new Expr("1.5 * 6").toMaster();
				}, 9);
			});

			it("does signal subtraction", function(){
				return ConstantOutput(function(){
					new Expr("8 - 16").toMaster();
				}, -8);
			});
		});

		context("Unary Operators", function(){

			it("correctly outputs negative", function(){
				return ConstantOutput(function(){
					var sig = new Signal(1);
					var exp = new Expr("-$0");
					sig.connect(exp);
					exp.toMaster();
				}, -1);
			});
		});

		context("Functions", function(){

			it("handles abs(-1)", function(){
				return ConstantOutput(function(){
					new Expr("abs(-1)").toMaster();
				}, 1);
			});

			it("handles abs(0.11)", function(){
				return ConstantOutput(function(){
					new Expr("abs(0.11)").toMaster();
				}, 0.11);
			});

			it("handles mod(0.2, 0.9)", function(){
				return ConstantOutput(function(){
					new Expr("mod(0.2, 0.9)").toMaster();
				}, 0.2);
			});

			it("handles mod(0.5, 0.25)", function(){
				return ConstantOutput(function(){
					new Expr("mod(0.6, 0.25)").toMaster();
				}, 0.1);
			});

			it("computes pow(0.2, 3)", function(){
				return ConstantOutput(function(){
					new Expr("pow(0.2, 3)").toMaster();
				}, 0.008, 0.001);
			});
		});
	});

});