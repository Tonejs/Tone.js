define(["Tone/core/Tone", "Tone/signal/Abs", "Tone/signal/Negate", "Tone/signal/Multiply", 
	"Tone/signal/Subtract", "Tone/signal/NOT", "Tone/signal/AND", "Tone/signal/IfThenElse", 
	"Tone/signal/Max", "Tone/signal/Min", "Tone/signal/Modulo"], 
	function(Tone){

	"use strict";

	/**
	 *  @class evaluate an expression at audio rate. 
	 *         i.e. ($0 + ($1 * abs($2)));
	 *         parsing code: 
	 *         Copyright (C) 2010 - 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
	 *         https://code.google.com/p/tapdigit/
	 *         New BSD License {@link http://opensource.org/licenses/BSD-3-Clause}
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {string} expr the expression to generate
	 */
	Tone.Expr = function(expr){

		/**
		 *  hold onto all of the nodes for disposal
		 *  @type {Array}
		 *  @private
		 */
		this._nodes = [];


		var inputCount = this._parseInput(expr);

		/**
		 *  the inputs
		 *  @type {Array}
		 */
		this.input = new Array(inputCount);

		for (var i = 0; i < inputCount; i++){
			this.input[i] = this.context.createGain();
		}

		var tree = this._parseTree(expr);
		var result;
		result = this._eval(tree);
		/*try {
		} catch (e){
			this._disposeNodes();
			throw new Error("Could not parse expression: "+expr);
		}*/
		this.output = result;
	};

	Tone.extend(Tone.Expr);

	Tone.Expr.prototype._Functions = {
		"abs" : function(args, _eval){
			var op = new Tone.Abs();
			_eval(args[0]).connect(op, 0, 0);
			return op;
		},
		"min" : function(args, _eval){
			var op = new Tone.Min();
			_eval(args[0]).connect(op, 0, 0);
			_eval(args[1]).connect(op, 0, 1);
			return op;
		},
		"max" : function(args, _eval){
			var op = new Tone.Max();
			_eval(args[0]).connect(op, 0, 0);
			_eval(args[1]).connect(op, 0, 1);
			return op;
		},
		"if" : function(args, _eval){
			var op = new Tone.IfThenElse();
			_eval(args[0]).connect(op.if);
			_eval(args[1]).connect(op.then);
			_eval(args[2]).connect(op.else);
			return op;
		},
		"gt0" : function(args, _eval){
			var op = new Tone.GreaterThanZero();
			_eval(args[0]).connect(op);
			return op;
		},
		"eq0" : function(args, _eval){
			var op = new Tone.EqualZero();
			_eval(args[0]).connect(op);
			return op;
		},
		"mod" : function(args, _eval){
			var modulus = parseFloat(args[1].value);
			var bits = args[2] ? parseFloat(args[2].value) : 16;
			var op = new Tone.Modulo(modulus, bits);
			_eval(args[0]).connect(op);
			return op;
		},
		// "pow" : Tone.Pow,
	};

	Tone.Expr.prototype._BinaryOperators = {
		"+" : Tone.Add,
		"*" : Tone.Multiply,
		"-" : Tone.Subtract,
		">" : Tone.GreaterThan,
		"<" : Tone.LessThan,
		"==" : Tone.Equal,
		"!=" : Tone.NotEqual,
		"&&" : Tone.AND,
		"||" : Tone.OR,
	};

	Tone.Expr.prototype._UnaryOperators = {
		"-" : Tone.Negate,
		"!" : Tone.NOT,
	};

	/**
	 *  the RegExps by which the tokens are created
	 *  @type {Object}
	 */
	Tone.Expr.prototype._operators = {
		"number" : /^\d+\.\d+|^\d+/,
		"input" : /^\$\d/,
		"func" : /^abs|^pow|^min|^max|^if|^mod/,
		"operator" : /^\-|^\+|^\*|^>|^<|^==|^\(|^\)|^,|^\!/,
		"first" : /^\-|^\+/,
		"second" : /^\*|^>|^<|^==|^\!/,
	};

	/**
	 *  @param   {string} expr the expression string
	 *  @return  {number}      the input count
	 *  @private
	 */
	Tone.Expr.prototype._parseInput = function(expr){
		var inputArray = expr.match(/\$\d/g);
		var inputMax = 1;
		if (inputArray !== null){
			for (var i = 0; i < inputArray.length; i++){
				var inputNum = parseInt(inputArray[i].substr(1)) + 1;
				inputMax = Math.max(inputMax, inputNum);
			}
		}
		return inputMax;
	};

	/**
	 *  recursively parse the string expression into a syntax tree
	 *  
	 *  @param   {string} expr 
	 *  @return  {Object}
	 *  @private
	 */
	Tone.Expr.prototype._parseTree = function(expr){
		var lexer = new Token(expr);
		var openParen =  /^\(/;
		var closeParen = /^\)/;
		var comma = /^,/;
		var first = /^\-|^\+|^\!/;
		var second = /^\*|^>|^<|^==/;

		function matchOp(token, op) {
			var reg = new RegExp(op);
			return (typeof token !== "undefined") && 
				token.type === "operator" && 
				reg.test(token.value);
		}

		function parseAdditive() {
			var expr = parseMultiplicative();
			var token = lexer.peek();
			while (matchOp(token, first)) {
				token = lexer.next();
				expr = {
					"binary": {
						operator: token.value,
						left: expr,
						right: parseMultiplicative()
					}
				};
				token = lexer.peek();
			}
			return expr;
		}

		function parseMultiplicative() {
			var expr = parseUnary();
			var token = lexer.peek();
			while (matchOp(token, second)) {
				token = lexer.next();
				expr = {
					"binary" : {
						operator: token.value,
						left: expr,
						right: parseUnary()
					}
				};
				token = lexer.peek();
			}
			return expr;
		}

		function parseUnary() {
			var token, expr;
			token = lexer.peek();
			if (matchOp(token, first)) {
				token = lexer.next();
				expr = parseUnary();
				return {
					"unary": {
						operator: token.value,
						expression: expr
					}
				};
			}
			return parsePrimary();
		}

		function parsePrimary() {
			var token, expr;
			token = lexer.peek();
			if (typeof token === "undefined") {
				throw new SyntaxError("Unexpected termination of expression");
			}
			if (token.type === "func") {
				token = lexer.next();
				return parseFunctionCall(token.value);
			}
			if (token.type === "number" || token.type === "input") {
				return lexer.next();
			}
			if (matchOp(token, openParen)) {
				lexer.next();
				expr = parseAdditive();
				token = lexer.next();
				if (!matchOp(token, closeParen)) {
					throw new SyntaxError("Expecting )");
				}
				return {
					"expression": expr
				};
			}
			throw new SyntaxError("Parse error, can not process token " + token.value);
		}

		function parseFunctionCall(name) {
			var token, args = [];
			token = lexer.next();
			if (!matchOp(token, openParen)) {
				throw new SyntaxError("Expecting ( in a function call \"" + name + "\"");
			}
			token = lexer.peek();
			if (!matchOp(token, closeParen)) {
				args = parseArgumentList();
			}
			token = lexer.next();
			if (!matchOp(token, closeParen)) {
				throw new SyntaxError("Expecting ) in a function call \"" + name + "\"");
			}
			return {
				"func" : {
					"name": name,
					"args": args
				}
			};
		}

		function parseArgumentList() {
			var token, expr, args = [];
			while (true) {
				expr = parseAdditive();
				if (typeof expr === "undefined") {
					// TODO maybe throw exception?
					break;
				}
				args.push(expr);
				token = lexer.peek();
				if (!matchOp(token, comma)) {
					break;
				}
				lexer.next();
			}
			return args;
		}

		return parseAdditive();
	};

	/**
	 *  recursively evaluate the expression tree
	 *  @param   {Object} tree 
	 *  @return  {AudioNode}      the resulting audio node from the expression
	 *  @private
	 */
	Tone.Expr.prototype._eval = function(tree){
		if (tree.hasOwnProperty("binary")){
			tree = tree.binary;
			var left = this._eval(tree.left);
			var right = this._eval(tree.right);
			var binaryOp = new this._BinaryOperators[tree.operator]();
			this._nodes.push(binaryOp);
			left.connect(binaryOp, 0, 0);
			right.connect(binaryOp, 0, 1);
			return binaryOp;
		} else if (tree.hasOwnProperty("unary")){
			tree = tree.unary;
			var expression = this._eval(tree.expression);
			var unaryOp = new this._UnaryOperators[tree.operator]();
			this._nodes.push(unaryOp);
			expression.connect(unaryOp);
			return unaryOp;
		} else if (tree.hasOwnProperty("func")){
			tree = tree.func;
			var func = this._Functions[tree.name](tree.args, this._eval.bind(this));
			this._nodes.push(func);
			return func;
		} else if (tree.hasOwnProperty("expression")){
			tree = tree.expression;
			return this._eval(tree);
		} else if (tree.hasOwnProperty("type")){
			var node;
			if (tree.type === "number"){
				node = new Tone.Signal(tree.value);
			} else if (tree.type === "input"){
				var inputNum = parseInt(tree.value.substr(1));
				node = this.input[inputNum];
			}
			this._nodes.push(node);
			return node;
		} else {
			console.log(tree);
		}
	};

	/**
	 *  dispose all the nodes
	 *  @private
	 */
	Tone.Expr.prototype._disposeNodes = function(){
		for (var i = 0; i < this._nodes.length; i++){
			this._nodes[i].dispose();
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

	// BEGIN TOKEN HELPER /////////////////////////////////////////////////////

	/**
	 *  Token helper class
	 *  @param {string} expr the string to tokenize
	 *  @private
	 */
	var Token = function(expr){
		this.position = -1;
		this.tokens = [];
		while(expr.length > 0){
			expr = expr.trim();
			var token =  this._getNextToken(expr);
			this.tokens.push(token);
			expr = expr.substr(token.value.length);
		}
		
	};

	/**
	 *  @return {string} the next token
	 *  increments the position
	 */
	Token.prototype.next = function(){
		return this.tokens[++this.position];
	};

	/**
	 *  @return {string} the next token
	 *  does not increment the position
	 */
	Token.prototype.peek = function(){
		return this.tokens[this.position + 1];
	};

	/**
	 *  the RegExps by which the tokens are created
	 *  @type {Object}
	 */
	Token.prototype._components = Tone.Expr.prototype._operators;

	/**
	 *  match the next token
	 *  @param   {string} expr 
	 *  @return  {[type]}      [description]
	 *  @private
	 */
	Token.prototype._getNextToken = function(expr){
		for (var comp in this._components){
			var reg = this._components[comp];
			var match = expr.match(reg);
			if (match !== null){
				return {
					type : comp,
					value : match[0]
				};
			}
		} 
		throw new SyntaxError("Unexpected token "+expr);
	};

	// END TOKEN HELPER ///////////////////////////////////////////////////////

	return Tone.Expr;
});