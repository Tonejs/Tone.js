define(["Tone/core/Tone"], function (Tone) {

	/**
	 *  @class Tone.TimeBase is a flexible encoding of time
	 *         which can be evaluated to and from a string.
	 *         Parsing code modified from https://code.google.com/p/tapdigit/
	 *         Copyright 2011 2012 Ariya Hidayat, New BSD License
	 *  @extends {Tone}
	 *  @param  {Time}  val    The time value as a number or string
	 *  @param  {String=}  units  Unit values
	 *  @example
	 * Tone.TimeBase(4, "n")
	 * Tone.TimeBase(2, "t")
	 * Tone.TimeBase("2t").add("1m")
	 * Tone.TimeBase("2t + 1m");
	 */
	Tone.TimeBase = function(val, units){

		//allows it to be constructed with or without 'new'
		if (this instanceof Tone.TimeBase) {

			/**
			 *  Any expressions parsed from the Time
			 *  @type  {Array}
			 *  @private
			 */
			this._expr = this._noOp;

			if (val instanceof Tone.TimeBase){
				this.copy(val);
			} else if (!this.isUndef(units) || this.isNumber(val)){
				//default units
				units = this.defaultArg(units, this._defaultUnits);
				var method = this._primaryExpressions[units].method;
				this._expr = method.bind(this, val);
			} else if (this.isString(val)){
				this.set(val);
			} else if (this.isUndef(val)){
				//default expression
				this._expr = this._defaultExpr();
			}
		} else {

			return new Tone.TimeBase(val, units);
		}
	};

	Tone.extend(Tone.TimeBase);

	/**
	 *  Repalce the current time value with the value
	 *  given by the expression string.
	 *  @param  {String}  exprString
	 *  @return {Tone.TimeBase} this
	 */
	Tone.TimeBase.prototype.set = function(exprString){
		this._expr = this._parseExprString(exprString);
		return this;
	};

	/**
	 *  Return a clone of the TimeBase object.
	 *  @return  {Tone.TimeBase} The new cloned Tone.TimeBase
	 */
	Tone.TimeBase.prototype.clone = function(){
		var instance = new this.constructor();
		instance.copy(this);
		return instance;
	};

	/**
	 *  Copies the value of time to this Time
	 *  @param {Tone.TimeBase} time
	 *  @return  {TimeBase}
	 */
	Tone.TimeBase.prototype.copy = function(time){
		var val = time._expr();
		return this.set(val);
	};

	///////////////////////////////////////////////////////////////////////////
	//	ABSTRACT SYNTAX TREE PARSER
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  All the primary expressions.
	 *  @private
	 *  @type  {Object}
	 */
	Tone.TimeBase.prototype._primaryExpressions = {
		"n" : {
			regexp : /^(\d+)n/i,
			method : function(value){
				value = parseInt(value);
				if (value === 1){
					return this._beatsToUnits(this._timeSignature());
				} else {
					return this._beatsToUnits(4 / value);
				}
			}
		},
		"t" : {
			regexp : /^(\d+)t/i,
			method : function(value){
				value = parseInt(value);
				return this._beatsToUnits(8 / (parseInt(value) * 3));
			}
		},
		"m" : {
			regexp : /^(\d+)m/i,
			method : function(value){
				return this._beatsToUnits(parseInt(value) * this._timeSignature());
			}
		},
		"i" : {
			regexp : /^(\d+)i/i,
			method : function(value){
				return this._ticksToUnits(parseInt(value));
			}
		},
		"hz" : {
			regexp : /^(\d+(?:\.\d+)?)hz/i,
			method : function(value){
				return this._frequencyToUnits(parseFloat(value));
			}
		},
		"tr" : {
			regexp : /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
			method : function(m, q, s){
				var total = 0;
				if (m && m !== "0"){
					total += this._beatsToUnits(this._timeSignature() * parseFloat(m));
				}
				if (q && q !== "0"){
					total += this._beatsToUnits(parseFloat(q));
				}
				if (s && s !== "0"){
					total += this._beatsToUnits(parseFloat(s) / 4);
				}
				return total;
			}
		},
		"s" : {
			regexp : /^(\d+(?:\.\d+)?s)/,
			method : function(value){
				return this._secondsToUnits(parseFloat(value));
			}
		},
		"samples" : {
			regexp : /^(\d+)samples/,
			method : function(value){
				return parseInt(value) / this.context.sampleRate;
			}
		},
		"default" : {
			regexp : /^(\d+(?:\.\d+)?)/,
			method : function(value){
				return this._primaryExpressions[this._defaultUnits].method.call(this, value);
			}
		}
	};

	/**
	 *  All the binary expressions that TimeBase can accept.
	 *  @private
	 *  @type  {Object}
	 */
	Tone.TimeBase.prototype._binaryExpressions = {
		"+" : {
			regexp : /^\+/,
			precedence : 2,
			method : function(lh, rh){
				return lh() + rh();
			}
		},
		"-" : {
			regexp : /^\-/,
			precedence : 2,
			method : function(lh, rh){
				return lh() - rh();
			}
		},
		"*" : {
			regexp : /^\*/,
			precedence : 1,
			method : function(lh, rh){
				return lh() * rh();
			}
		},
		"/" : {
			regexp : /^\//,
			precedence : 1,
			method : function(lh, rh){
				return lh() / rh();
			}
		}
	};

	/**
	 *  All the unary expressions.
	 *  @private
	 *  @type  {Object}
	 */
	Tone.TimeBase.prototype._unaryExpressions = {
		"neg" : {
			regexp : /^\-/,
			method : function(lh){
				return -lh();
			}
		}
	};

	/**
	 *  Syntactic glue which holds expressions together
	 *  @private
	 *  @type  {Object}
	 */
	Tone.TimeBase.prototype._syntaxGlue = {
		"(" : {
			regexp : /^\(/
		},
		")" : {
			regexp : /^\)/
		}
	};

	/**
	 *  tokenize the expression based on the Expressions object
	 *  @param   {string} expr 
	 *  @return  {Object}      returns two methods on the tokenized list, next and peek
	 *  @private
	 */
	Tone.TimeBase.prototype._tokenize = function(expr){
		var position = -1;
		var tokens = [];

		while(expr.length > 0){
			expr = expr.trim();
			var token = getNextToken(expr, this);
			tokens.push(token);
			expr = expr.substr(token.value.length);
		}

		function getNextToken(expr, context){
			var expressions = ["_binaryExpressions", "_unaryExpressions", "_primaryExpressions", "_syntaxGlue"];
			for (var i = 0; i < expressions.length; i++){
				var group = context[expressions[i]];
				for (var opName in group){
					var op = group[opName];
					var reg = op.regexp;
					var match = expr.match(reg);
					if (match !== null){
						return {
							method : op.method,
							precedence : op.precedence,
							regexp : op.regexp,
							value : match[0],
						};
					}
				}
			}
			throw new SyntaxError("Tone.TimeBase: Unexpected token "+expr);
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
	 *  Given a token, find the value within the groupName
	 *  @param {Object} token
	 *  @param {String} groupName
	 *  @param {Number} precedence
	 *  @private
	 */
	Tone.TimeBase.prototype._matchGroup = function(token, group, prec) {
		var ret = false;
		if (!this.isUndef(token)){
			for (var opName in group){
				var op = group[opName];
				if (op.regexp.test(token.value)){
					if (!this.isUndef(prec)){
						if(op.precedence === prec){	
							return op;
						}
					} else {
						return op;
					}
				}
			}
		}
		return ret;
	};

	/**
	 *  Match a binary expression given the token and the precedence
	 *  @param {Lexer} lexer
	 *  @param {Number} precedence
	 *  @private
	 */
	Tone.TimeBase.prototype._parseBinary = function(lexer, precedence){
		if (this.isUndef(precedence)){
			precedence = 2;
		}
		var expr;
		if (precedence < 0){
			expr = this._parseUnary(lexer);
		} else {
			expr = this._parseBinary(lexer, precedence - 1);
		}
		var token = lexer.peek();
		while (token && this._matchGroup(token, this._binaryExpressions, precedence)){
			token = lexer.next();
			expr = token.method.bind(this, expr, this._parseBinary(lexer, precedence - 1));
			token = lexer.peek();
		}
		return expr;
	};

	/**
	 *  Match a unary expression.
	 *  @param {Lexer} lexer
	 *  @private
	 */
	Tone.TimeBase.prototype._parseUnary = function(lexer){
		var token, expr;
		token = lexer.peek();
		var op = this._matchGroup(token, this._unaryExpressions);
		if (op) {
			token = lexer.next();
			expr = this._parseUnary(lexer);
			return op.method.bind(this, expr);
		}
		return this._parsePrimary(lexer);
	};

	/**
	 *  Match a primary expression (a value).
	 *  @param {Lexer} lexer
	 *  @private
	 */
	Tone.TimeBase.prototype._parsePrimary = function(lexer){
		var token, expr;
		token = lexer.peek();
		if (this.isUndef(token)) {
			throw new SyntaxError("Tone.TimeBase: Unexpected end of expression");
		}
		if (this._matchGroup(token, this._primaryExpressions)) {
			token = lexer.next();
			var matching = token.value.match(token.regexp);
			return token.method.bind(this, matching[1], matching[2], matching[3]);
		}
		if (token && token.value === "("){
			lexer.next();
			expr = this._parseBinary(lexer);
			token = lexer.next();
			if (!(token && token.value === ")")) {
				throw new SyntaxError("Expected )");
			}
			return expr;
		}
		throw new SyntaxError("Tone.TimeBase: Cannot process token " + token.value);
	};

	/**
	 *  Recursively parse the string expression into a syntax tree.
	 *  @param   {string} expr 
	 *  @return  {Function} the bound method to be evaluated later
	 *  @private
	 */
	Tone.TimeBase.prototype._parseExprString = function(exprString){
		if (!this.isString(exprString)){
			exprString = exprString.toString();
		}
		var lexer = this._tokenize(exprString);
		var tree = this._parseBinary(lexer);
		return tree;
	};

	///////////////////////////////////////////////////////////////////////////
	//	DEFAULTS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  The initial expression value
	 *  @return  {Number}  The initial value 0
	 *  @private
	 */
	Tone.TimeBase.prototype._noOp = function(){
		return 0;
	};

	/**
	 *  The default expression value if no arguments are given
	 *  @private
	 */
	Tone.TimeBase.prototype._defaultExpr = function(){
		return this._noOp;
	};

	/**
	 *  The default units if none are given.
	 *  @private
	 */
	Tone.TimeBase.prototype._defaultUnits = "s";

	///////////////////////////////////////////////////////////////////////////
	//	UNIT CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value of a frequency in the current units
	 *  @param {Frequency} freq
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._frequencyToUnits = function(freq){
		return 1/freq;
	};

	/**
	 *  Return the value of the beats in the current units
	 *  @param {Number} beats
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._beatsToUnits = function(beats){
		return (60 / Tone.Transport.bpm.value) * beats;
	};

	/**
	 *  Returns the value of a second in the current units
	 *  @param {Seconds} seconds
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._secondsToUnits = function(seconds){
		return seconds;
	};

	/**
	 *  Returns the value of a tick in the current time units
	 *  @param {Ticks} ticks
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._ticksToUnits = function(ticks){
		return ticks * (this._beatsToUnits(1) / Tone.Transport.PPQ);
	};

	/**
	 *  Return the time signature.
	 *  @return  {Number}
	 *  @private
	 */
	Tone.TimeBase.prototype._timeSignature = function(){
		return Tone.Transport.timeSignature;
	};

	///////////////////////////////////////////////////////////////////////////
	//	EXPRESSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Push an expression onto the expression list
	 *  @param  {Time}  val
	 *  @param  {String}  type
	 *  @param  {String}  units
	 *  @return  {Tone.TimeBase} 
	 *  @private
	 */
	Tone.TimeBase.prototype._pushExpr = function(val, name, units){
		//create the expression
		if (!(val instanceof Tone.TimeBase)){
			val = new this.constructor(val, units);
		}
		this._expr = this._binaryExpressions[name].method.bind(this, this._expr, val._expr);
		return this;
	};

	/**
	 *  Add to the current value.
	 *  @param  {Time}  val    The value to add
	 *  @param  {String=}  units  Optional units to use with the value.
	 *  @return  {Tone.TimeBase}  this
	 *  @example
	 * Tone.TimeBase("2m").add("1m"); //"3m"
	 */
	Tone.TimeBase.prototype.add = function(val, units){
		return this._pushExpr(val, "+", units);
	};

	/**
	 *  Subtract the value from the current time.
	 *  @param  {Time}  val    The value to subtract
	 *  @param  {String=}  units  Optional units to use with the value.
	 *  @return  {Tone.TimeBase}  this
	 *  @example
	 * Tone.TimeBase("2m").sub("1m"); //"1m"
	 */
	Tone.TimeBase.prototype.sub = function(val, units){
		return this._pushExpr(val, "-", units);
	};

	/**
	 *  Multiply the current value by the given time.
	 *  @param  {Time}  val    The value to multiply
	 *  @param  {String=}  units  Optional units to use with the value.
	 *  @return  {Tone.TimeBase}  this
	 *  @example
	 * Tone.TimeBase("2m").mult("2"); //"4m"
	 */
	Tone.TimeBase.prototype.mult = function(val, units){
		return this._pushExpr(val, "*", units);
	};

	/**
	 *  Divide the current value by the given time.
	 *  @param  {Time}  val    The value to divide by
	 *  @param  {String=}  units  Optional units to use with the value.
	 *  @return  {Tone.TimeBase}  this
	 *  @example
	 * Tone.TimeBase("2m").div(2); //"1m"
	 */
	Tone.TimeBase.prototype.div = function(val, units){
		return this._pushExpr(val, "/", units);
	};

	/**
	 *  Evaluate the time value. Returns the time
	 *  in seconds.
	 *  @return  {Seconds} 
	 */
	Tone.TimeBase.prototype.eval = function(){
		return this._expr();
	};

	/**
	 *  Clean up
	 *  @return {Tone.TimeBase} this
	 */
	Tone.TimeBase.prototype.dispose = function(){
		this._expr = null;
	};

	return Tone.TimeBase;
});