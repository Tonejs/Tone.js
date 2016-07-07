
define(["Tone/signal/Signal", "Tone/signal/Expr", "Test", "helper/Basic", 
	"helper/OutputAudio", "helper/PassAudio", "helper/Offline"], 
function(Signal, Expr, Test, Basic, OutputAudio, PassAudio, Offline){

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

			it("outputs audio", function(done){
				var exp;
				OutputAudio(function(out){
					exp = new Expr("1.1");
					exp.connect(out);
				}, function(){
					exp.dispose();
					done();
				});
			});

			it("passes input", function(done){
				var exp;
				PassAudio(function(input, output){
					exp = new Expr("$0");
					input.connect(exp);
					exp.connect(output);
				}, function(){
					exp.dispose();
					done();
				});
			});
		});

		context("Parsing", function(){

			it("can do string replacements", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("% + %", 0.2, 0.8);
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(1, 0.001);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("can do string replacements with strings", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("%", "1 + 2");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(3, 0.001);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("handles precendence", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("8 + 16 * 4 * (2 - 1)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(72, 0.01);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("tolerates inconsistent spacing", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("2 *    3-2 *4 ");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-2);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("handles parens", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("(8 + 16) * (4 - 1)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(72);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});
		});

		context("Math", function(){

			it("does signal addition", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("1 + 3");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(4);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("does signal multiplication", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("1.5 * 6");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(9);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("does signal subtraction", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("8 - 16");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-8);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});
		});

		context("Unary Operators", function(){

			it("correctly outputs negative", function(done){
				var exp, sig;
				var offline = new Offline(); 
				offline.before(function(dest){
					sig = new Signal(1);
					exp = new Expr("-$0");
					sig.connect(exp);
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(-1);
				}); 
				offline.after(function(){
					exp.dispose();
					sig.dispose();
					done();
				});
				offline.run();
			});
		});

		context("Functions", function(){

			it("handles abs(-1)", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("abs(-1)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.equal(1);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("handles abs(0.11)", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("abs(0.11)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.11, 0.01);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("handles mod(0.1, 0.9)", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("mod(0.1, 0.9)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.1, 0.0001);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("handles mod(0.5, 0.25)", function(done){
				var exp;
				var offline = new Offline(); 
				offline.before(function(dest){
					exp = new Expr("mod(0.6, 0.25)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.1, 0.0001);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});

			it("computes pow(0.2, 3)", function(done){
				var exp;
				var offline = new Offline(); offline.before(function(dest){
					exp = new Expr("pow(0.2, 3)");
					exp.connect(dest);
				}); 
				offline.test(function(sample){
					expect(sample).to.be.closeTo(0.008, 0.001);
				}); 
				offline.after(function(){
					exp.dispose();
					done();
				});
				offline.run();
			});
		});
	});

});