define(["Tone/core/Tone", "Tone/type/TimeBase", "Tone/type/Frequency"], function(Tone){

	/**
	 *  @class Tone.Time is a primitive type for encoding Time values.
	 *         Tone.Time can be constructed with or without the `new` keyword. Tone.Time can be passed
	 *         into the parameter of any method which takes time as an argument.
	 *  @constructor
	 *  @extends {Tone.TimeBase}
	 *  @param  {String|Number}  val    The time value.
	 *  @param  {String=}  units  The units of the value.
	 *  @example
	 * var t = Tone.Time("4n");//a quarter note
	 */
	Tone.Time = function(val, units){
		if (this instanceof Tone.Time){

			Tone.TimeBase.call(this, val, units);

		} else {
			return new Tone.Time(val, units);
		}
	};

	Tone.extend(Tone.Time, Tone.TimeBase);

	/**
	 * Extend the base expressions
	 */
	Tone.Time.prototype._expressions = Object.assign({}, Tone.TimeBase.prototype._expressions, {
		"quantize" : {
			regexp : /^@(.+)/,
			method : function(capture){
				if (Tone.Transport){
					var quantTo = new this.constructor(capture);
					return Tone.Transport.nextSubdivision(quantTo);
				} else {
					return 0;
				}
			}
		},
		"now" : {
			regexp : /^\+(.+)/,
			method : function(capture){
				return this._now() + (new this.constructor(capture));
			}
		}
	});

	/**
	 *  Quantize the time by the given subdivision. Optionally add a
	 *  percentage which will move the time value towards the ideal
	 *  quantized value by that percentage.
	 *  @param  {Number|Time}  val    The subdivision to quantize to
	 *  @param  {NormalRange}  [percent=1]  Move the time value
	 *                                   towards the quantized value by
	 *                                   a percentage.
	 *  @return  {Number}  this
	 *  @example
	 * Tone.Time(21).quantize(2) //returns 22
	 * Tone.Time(0.6).quantize("4n", 0.5) //returns 0.55
	 */
	Tone.Time.prototype.quantize = function(subdiv, percent){
		percent = Tone.defaultArg(percent, 1);
		var subdivision = new this.constructor(subdiv);
		var value = this.valueOf();
		var multiple = Math.round(value / subdivision);
		var ideal = multiple * subdivision;
		var diff = ideal - value;
		return value + diff * percent;
	};

	///////////////////////////////////////////////////////////////////////////
	// CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Convert a Time to Notation. The notation values are will be the
	 *  closest representation between 1m to 128th note.
	 *  @return {Notation}
	 *  @example
	 * //if the Transport is at 120bpm:
	 * Tone.Time(2).toNotation();//returns "1m"
	 */
	Tone.Time.prototype.toNotation = function(){
		var time = this.toSeconds();
		var testNotations = ["1m"];
		for (var power = 1; power < 8; power++){
			var subdiv = Math.pow(2, power);
			testNotations.push(subdiv + "n.");
			testNotations.push(subdiv + "n");
			testNotations.push(subdiv + "t");
		}
		testNotations.push("0");
		//find the closets notation representation
		var closest = testNotations[0];
		var closestSeconds = Tone.Time(testNotations[0]).toSeconds();
		testNotations.forEach(function(notation){
			var notationSeconds = Tone.Time(notation).toSeconds();
			if (Math.abs(notationSeconds - time) < Math.abs(closestSeconds - time)){
				closest = notation;
				closestSeconds = notationSeconds;
			}
		});
		return closest;
	};

	/**
	 *  Return the time encoded as Bars:Beats:Sixteenths.
	 *  @return  {BarsBeatsSixteenths}
	 */
	Tone.Time.prototype.toBarsBeatsSixteenths = function(){
		var quarterTime = this._beatsToUnits(1);
		var quarters = this.valueOf() / quarterTime;
		var measures = Math.floor(quarters / this._getTimeSignature());
		var sixteenths = (quarters % 1) * 4;
		quarters = Math.floor(quarters) % this._getTimeSignature();
		sixteenths = sixteenths.toString();
		if (sixteenths.length > 3){
			// the additional parseFloat removes insignificant trailing zeroes
			sixteenths = parseFloat(parseFloat(sixteenths).toFixed(3));
		}
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	/**
	 *  Return the time in ticks.
	 *  @return  {Ticks}
	 */
	Tone.Time.prototype.toTicks = function(){
		var quarterTime = this._beatsToUnits(1);
		var quarters = this.valueOf() / quarterTime;
		return Math.round(quarters * this._getPPQ());
	};

	/**
	 *  Return the time in seconds.
	 *  @return  {Seconds}
	 */
	Tone.Time.prototype.toSeconds = function(){
		return this.valueOf();
	};

	/**
	 *  Return the value as a midi note.
	 *  @return  {Midi}
	 */
	Tone.Time.prototype.toMidi = function(){
		return Tone.Frequency.ftom(this.toFrequency());
	};

	return Tone.Time;
});
