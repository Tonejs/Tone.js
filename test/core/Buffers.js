import Test from "helper/Test";
import Buffers from "Tone/core/Buffers";
import Buffer from "Tone/core/Buffer";

var testFile = "./audio/sine.wav";
var testFile2 = "./audio/hh.wav";

describe("Buffers", function(){
	it("can be created and disposed", function(){
		var buff = new Buffers(testFile);
		buff.dispose();
		Test.wasDisposed(buff);
	});

	it("loads a file from an object string", function(done){
		var buffer = new Buffers({
			"sine" : testFile
		}, function(buff){
			expect(buff).to.be.instanceof(Buffers);
			buffer.dispose();
			done();
		});
	});

	it("loads a file from an array", function(done){
		var buffer = new Buffers([testFile], function(buff){
			expect(buff).to.be.instanceof(Buffers);
			buffer.dispose();
			done();
		});
	});

	it("can get a buffer loaded from an object", function(done){
		var buffer = new Buffers({
			"sine" : testFile,
			"kick" : testFile2
		}, function(buff){
			expect(buff.get("kick")).to.be.instanceof(Buffer);
			buffer.dispose();
			done();
		});
	});

	it("tests if it has a buffer", function(done){
		var buffer = new Buffers({
			"sine" : testFile,
			"kick" : testFile2
		}, function(buff){
			expect(buffer.has("kick")).to.be.true;
			expect(buffer.has("sine")).to.be.true;
			expect(buffer.has("nope")).to.be.false;
			buffer.dispose();
			done();
		});
	});

	it("can pass in buffers as object and options object in second arg", function(done){
		var buffer = new Buffers({
			"sine" : "sine.wav"
		}, {
			"onload" : function(){
				expect(buffer.has("sine")).to.be.true;
				buffer.dispose();
				done();
			},
			"baseUrl" : "./audio/"
		});
	});

	it("reports itself as loaded", function(done){
		var buffer = new Buffers({
			"sine" : testFile,
			"kick" : testFile2
		}, function(buff){
			expect(buffer.loaded).to.be.true;
			buffer.dispose();
			done();
		});
		expect(buffer.loaded).to.be.false;
	});

	it("can get a buffer loaded from an array", function(done){
		var buffer = new Buffers([testFile, testFile2], function(buff){
			expect(buff.get(0)).to.be.instanceof(Buffer);
			expect(buff.get(1)).to.be.instanceof(Buffer);
			buffer.dispose();
			done();
		});
	});

	it("can load from a base url", function(done){
		var buffer = new Buffers(["hh.wav"], function(buff){
			expect(buff.get(0)).to.be.instanceof(Buffer);
			buffer.dispose();
			done();
		}, "./audio/");
	});

	it("can add a buffer", function(done){
		var buffer = new Buffers();
		buffer.add("name", testFile, function(){
			expect(buffer.get("name")).to.be.instanceof(Buffer);
			buffer.dispose();
			done();
		});
	});

	it("can add a buffer url", function(done){
		var buffer = new Buffers();
		buffer.add("name", testFile, function(){
			expect(buffer.get("name")).to.be.instanceof(Buffer);
			buffer.dispose();
			done();
		});
	});

	it("throws an error if no buffer exists with that name or index", function(){
		var buffer = new Buffers();
		expect(function(){
			buffer.get("nope");
		}).to.throw(Error);
		buffer.dispose();
	});

	it("can add a Tone.Buffer", function(){
		var buff = new Buffer();
		var buffer = new Buffers();
		buffer.add("name", buff);
		expect(buffer.get("name")).to.equal(buff);
	});

	it("can add an AudioBuffer", function(done){
		Buffer.load(testFile, function(buff){
			var buffer = new Buffers();
			buffer.add("name", buff);
			expect(buffer.get("name").get()).to.equal(buff);
			done();
		});
	});

	it("can be constructed with Tone.Buffers", function(){
		var buff = new Buffer();
		var buffer = new Buffers({
			"buff" : buff
		});
		expect(buffer.get("buff")).to.equal(buff);
	});

});

