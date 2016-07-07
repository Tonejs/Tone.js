define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Subtract", "Tone/signal/Multiply", 
	"Tone/signal/GreaterThan", "Tone/signal/GreaterThanZero", "Tone/signal/Abs", "Tone/signal/Negate", 
	"Tone/signal/Modulo", "Tone/signal/Pow", "Tone/signal/AudioToGain"], 
	function(Tone){

	"use strict";

	/**
	 *  @class Evaluate an expression at audio rate. <br><br>
	 *         Parsing code modified from https://code.google.com/p/tapdigit/
	 *         Copyright 2011 2012 Ariya Hidayat, New BSD License
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {string} expr the expression to generate
	 *  @example
	 * //adds the signals from input[0] and input[1].
	 * var expr = new Tone.Expr("$0 + $1");
	 */
	Tone.Expr = function(){

		var expr = this._replacements(Array.prototype.slice.call(arguments));
		var inputCount = this._parseInputs(expr);

		/**
		 *  hold onto all of the nodes for disposal
		 *  @type {Array}
		 *  @private
		 */
		this._nodes = [];

		/**
		 *  The inputs. The length is determined by the expression. 
		 *  @type {Array}
		 */
		this.input = new Array(inputCount);

		//create a gain for each input
		for (var i = 0; i < inputCount; i++){
			this.input[i] = this.context.createGain();
		}

		//parse the syntax tree
		var tree = this._parseTree(expr);
		//evaluate the results
		var result;
		try {
			result = this._eval(tree);
		} catch (e){
			this._disposeNodes();
			throw new Error("Tone.Expr: Could evaluate expression: "+expr);
		}

		/**
		 *  The output node is the result of the expression
		 *  @type {Tone}
		 */
		this.output = result;
	};

	Tone.extend(Tone.Expr, Tone.SignalBase);

	//some helpers to cut down the amount of code
	function applyBinary(Constructor, args, self){
		var op = new Constructor();
		self._eval(args[0]).connect(op, 0, 0);
		self._eval(args[1]).connect(op, 0, 1);
		return op;
	}
	function applyUnary(Constructor, args, self){
		var op = new Constructor();
		self._eval(args[0]).connect(op, 0, 0);
		return op;
	}
	function getNumber(arg){
		return arg ? parseFloat(arg) : undefined;
	}
	function literalNumber(arg){
		return arg && arg.args ? parseFloat(arg.args) : undefined;
	}

	/*
	 *  the Expressions that Tone.Expr can parse.
	 *
	 *  each expression belongs to a group and contains a regexp 
	 *  for selecting the operator as well as that operators method
	 *  
	 *  @type {Object}
	 *  @private
	 */
	Tone.Expr._Expressions = {
		//values
		"value" : {
			"signal" : {
				regexp : /^\d+\.\d+|^\d+/,
				method : function(arg){
					var sig = new Tone.Signal(getNumber(arg));
					return sig;
				}
			},
			"input" : {
				regexp : /^\$\d/,
				method : function(arg, self){
					return self.input[getNumber(arg.substr(1))];
				}
			}
		},
		//syntactic glue
		"glue" : {
			"(" : {
				regexp : /^\(/,
			},
			")" : {
				regexp : /^\)/,
			},
			"," : {
				regexp : /^,/,
			}
		},
		//functions
		"func" : {
			"abs" :  {
				regexp : /^abs/,
				method : applyUnary.bind(this, Tone.Abs)
			},
			"mod" : {
				regexp : /^mod/,
				method : function(args, self){
					var modulus = literalNumber(args[1]);
					var op = new Tone.Modulo(modulus);
					self._eval(args[0]).connect(op);
					return op;
				}
			},
			"pow" : {
				regexp : /^pow/,
				method : function(args, self){
					var exp = literalNumber(args[1]);
					var op = new Tone.Pow(exp);
					self._eval(args[0]).connect(op);
					return op;
				}
			},
			"a2g" : {
				regexp : /^a2g/,
				method : function(args, self){
					var op = new Tone.AudioToGain();
					self._eval(args[0]).connect(op);
					return op;
				}
			},
		},
		//binary expressions
		"binary" : {
			"+" : {
				regexp : /^\+/,
				precedence : 1,
				method : applyBinary.bind(this, Tone.Add)
			},
			"-" : {
				regexp : /^\-/,
				precedence : 1,
				method : function(args, self){
					//both unary and binary op
					if (args.length === 1){
						return applyUnary(Tone.Negate, args, self);
					} else {
						return applyBinary(Tone.Subtract, args, self);
					}
				}
			},
			"*" : {
				regexp : /^\*/,
				precedence : 0,
				method : applyBinary.bind(this, Tone.Multiply)
			}
		},
		//unary expressions
		"unary" : {
			"-" : {
				regexp : /^\-/,
				method : applyUnary.bind(this, Tone.Negate)
			},
			"!" : {
				regexp : /^\!/,
				method : applyUnary.bind(this, Tone.NOT)
			},
		},
	};
		
	/**
	 *  @param   {string} expr the expression string
	 *  @return  {number}      the input count
	 *  @private
	 */
	Tone.Expr.prototype._parseInputs = function(expr){
		var inputArray = expr.match(/\$\d/g);
		var inputMax = 0;
		if (inputArray !== null){
			for (var i = 0; i < inputArray.length; i++){
				var inputNum = parseInt(inputArray[i].substr(1)) + 1;
				inputMax = Math.max(inputMax, inputNum);
			}
		}
		return inputMax;
	};

	/**
	 *  @param   {Array} args 	an array of arguments
	 *  @return  {string} the results of the replacements being replaced
	 *  @private
	 */
	Tone.Expr.prototype._replacements = function(args){
		var expr = args.shift();
		for (var i = 0; i < args.length; i++){
			expr = expr.replace(/\%/i, args[i]);
		}
		return expr;
	};

	/**
	 *  tokenize the expression based on the Expressions object
	 *  @param   {string} expr 
	 *  @return  {Object}      returns two methods on the tokenized list, next and peek
	 *  @private
	 */
	Tone.Expr.prototype._tokenize = function(expr){
		var position = -1;
		var tokens = [];

		while(expr.length > 0){
			expr = expr.trim();
			var token =  getNextToken(expr);
			tokens.push(token);
			expr = expr.substr(token.value.length);
		}

		function getNextToken(expr){
			for (var type in Tone.Expr._Expressions){
				var group = Tone.Expr._Expressions[type];
				for (var opName in group){
					var op = group[opName];
					var reg = op.regexp;
					var match = expr.match(reg);
					if (match !== null){
						return {
							type : type,
							value : match[0],
							method : op.method
						};
					}
				}
			}
			throw new SyntaxError("Tone.Expr: Unexpected token "+expr);
		}

		return {
			next : function(){
				return tokens[++position];
			},
			peek : function(){
				return tokens[position + 1];
			}
		};
	};

	/**
	 *  recursively parse the string expression into a syntax tree
	 *  
	 *  @param   {string} expr 
	 *  @return  {Object}
	 *  @private
	 */
	Tone.Expr.prototype._parseTree = function(expr){
		var lexer = this._tokenize(expr);
		var isUndef = this.isUndef.bind(this);

		function matchSyntax(token, syn) {
			return !isUndef(token) && 
				token.type === "glue" &&
				token.value === syn;
		}

		function matchGroup(token, groupName, prec) {
			var ret = false;
			var group = Tone.Expr._Expressions[groupName];
			if (!isUndef(token)){
				for (var opName in group){
					var op = group[opName];
					if (op.regexp.test(token.value)){
						if (!isUndef(prec)){
							if(op.precedence === prec){	
								return true;
							}
						} else {
							return true;
						}
					}
				}
			}
			return ret;
		}

		function parseExpression(precedence) {
			if (isUndef(precedence)){
				precedence = 5;
			}
			var expr;
			if (precedence < 0){
				expr = parseUnary();
			} else {
				expr = parseExpression(precedence-1);
			}
			var token = lexer.peek();
			while (matchGroup(token, "binary", precedence)) {
				token = lexer.next();
				expr = {
					operator: token.value,
					method : token.method,
					args : [
						expr,
						parseExpression(precedence-1)
					]
				};
				token = lexer.peek();
			}
			return expr;
		}

		function parseUnary() {
			var token, expr;
			token = lexer.peek();
			if (matchGroup(token, "unary")) {
				token = lexer.next();
				expr = parseUnary();
				return {
					operator: token.value,
					method : token.method,
					args : [expr]
				};
			}
			return parsePrimary();
		}

		function parsePrimary() {
			var token, expr;
			token = lexer.peek();
			if (isUndef(token)) {
				throw new SyntaxError("Tone.Expr: Unexpected termination of expression");
			}
			if (token.type === "func") {
				token = lexer.next();
				return parseFunctionCall(token);
			}
			if (token.type === "value") {
				token = lexer.next();
				return {
					method : token.method,
					args : token.value
				};
			}
			if (matchSyntax(token, "(")) {
				lexer.next();
				expr = parseExpression();
				token = lexer.next();
				if (!matchSyntax(token, ")")) {
					throw new SyntaxError("Expected )");
				}
				return expr;
			}
			throw new SyntaxError("Tone.Expr: Parse error, cannot process token " + token.value);
		}

		function parseFunctionCall(func) {
			var token, args = [];
			token = lexer.next();
			if (!matchSyntax(token, "(")) {
				throw new SyntaxError("Tone.Expr: Expected ( in a function call \"" + func.value + "\"");
			}
			token = lexer.peek();
			if (!matchSyntax(token, ")")) {
				args = parseArgumentList();
			}
			token = lexer.next();
			if (!matchSyntax(token, ")")) {
				throw new SyntaxError("Tone.Expr: Expected ) in a function call \"" + func.value + "\"");
			}
			return {
				method : func.method,
				args : args,
				name : name
			};
		}

		function parseArgumentList() {
			var token, expr, args = [];
			while (true) {
				expr = parseExpression();
				if (isUndef(expr)) {
					// TODO maybe throw exception?
					break;
				}
				args.push(expr);
				token = lexer.peek();
				if (!matchSyntax(token, ",")) {
					break;
				}
				lexer.next();
			}
			return args;
		}

		return parseExpression();
	};

	/**
	 *  recursively evaluate the expression tree
	 *  @param   {Object} tree 
	 *  @return  {AudioNode}      the resulting audio node from the expression
	 *  @private
	 */
	Tone.Expr.prototype._eval = function(tree){
		if (!this.isUndef(tree)){
			var node = tree.method(tree.args, this);
			this._nodes.push(node);
			return node;
		} 
	};

	/**
	 *  dispose all the nodes
	 *  @private
	 */
	Tone.Expr.prototype._disposeNodes = function(){
		for (var i = 0; i < this._nodes.length; i++){
			var node = this._nodes[i];
			if (this.isFunction(node.dispose)) {
				node.dispose();
			} else if (this.isFunction(node.disconnect)) {
				node.disconnect();
			}
			node = null;
			this._nodes[i] = null;
		}
		this._nodes = null;
	};

	/**
	 *  clean up
	 */
	Tone.Expr.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._disposeNodes();
	};

	return Tone.Expr;
});