define(["Tone/core/Tone", "Tone/component/Filter"], function(Tone){

    "use strict";

    /**
     *  @class  6BandEQ object which uses 6 Filters
     *
     *  @extends {Tone}
     *  @constructor
     *  @param {Array} Array of options objects for each bands filter setting. The amount of items in the array
     *  denotes how many EQ bands there will be
     */
    Tone.MultibandEQ = function(options){


        //TODO: get all of the defaults
        //options = Tone.MultibandEQ.defaults;


        this._bands = [];

        /**
         *  the number of EQ bands.
         *  @type {number}
         */
        this.numberOfBands = options.length;


        for (var i = 0; i < this.numberOfBands; i++) {
            var filter = new Tone.Filter({
                "type" : options[i].type,
                "frequency" : options[i].frequency,
                "rolloff" : options[i].rolloff,
                "Q" : options[i].Q,
                "gain" : options[i].gain
            });
            this._bands.push(filter);
        }

        this.input = this._bands[0];
        this.output = this._bands[this.numberOfBands-1];

        //Connect all the filters
        var currentUnit = this._bands[0];
        for (var i = 1; i < this._bands.length; i++) {
            var toUnit = this._bands[i];
            currentUnit.connect(toUnit);
            currentUnit = toUnit;
        }
    };

    Tone.extend(Tone.MultibandEQ);

    /**
     *  the default parameters
     *
     *  @static
     *  @type {Object}
     */
    Tone.MultibandEQ.defaults = [
        {
            "type" : "lowshelf",
            "frequency" : 80,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 0
        },
        {
            "type" : "peaking",
            "frequency" : 160,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 0
        },
        {
            "type" : "peaking",
            "frequency" : 480,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 0
        },
        {
            "type" : "peaking",
            "frequency" : 1200,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 0
        },
        {
            "type" : "peaking",
            "frequency" : 3000,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 5
        },
        {
            "type" : "highshelf",
            "frequency" : 12000,
            "rolloff" : -12,
            "Q" : 1,
            "gain" : 10
        }
    ];

    /**
     *  set the parameters at once
     *  @param {Object} params
     */
    Tone.MultibandEQ.prototype.set = function(params){
        for (var i = 0; i < params.length; i++){
            params[i] = this.defaultArg(arguments, Tone.MultibandEQ.defaults);
        }
        console.log(params);
        //params = this.defaultArg(arguments, Tone.MultibandEQ.defaults);
    };

    /**
     *  set the type
     *  @param {string} type the filter type
     *  @param {number} the EQ band
     */
    Tone.MultibandEQ.prototype.setType = function(type, band){
        for (var i = 0; i < this.numberOfBands; i++){
            if (i == band-1) {
                this._bands[i].type = type;
            }
        }
    };

    /**
     *  get the type
     *  @param {number} the EQ band
     *  @return {string} the type of the filter
     */
    Tone.MultibandEQ.prototype.getType = function(band){
        for (var i = 0; i < this.numberOfBands; i++){
            if (i == band-1) {
                return this._bands[i]._type;
            }
        }
    };

    /**
     *  set the frequency
     *  @param {number} freq the frequency value
     *  @param {number} the EQ band
     */
    Tone.MultibandEQ.prototype.setFrequency = function(freq, band){
        for (var i = 0; i < this.numberOfBands; i++) {
            if (i == band-1) {
                this._bands[i].frequency.setValue(freq);
            }
        }
    };

    /**
     *  get the frequency
     *  @param {number} the EQ band
     *  @return {number} the frequency of the EQ
     */
    Tone.MultibandEQ.prototype.getFrequency = function(band){
        for (var i = 0; i < this.numberOfBands; i++) {
            if (i == band-1) {
                return this._bands[i].frequency.getValue();
            }
        }
    };

    /**
     *  set the quality of the filter
     *  @param {number} Q the filter's Q
     *  @param {number} the EQ band
     */
    Tone.MultibandEQ.prototype.setQ = function(Q, band){
        for (var i = 0; i < this.numberOfBands; i++) {
            if (i == band-1) {
                this._bands[i].Q.setValue(Q);
            }
        }
    };



    /**
     *  clean up
     */
    Tone.MultibandEQ.prototype.dispose = function(){
        Tone.prototype.dispose.call(this);
        for (var i = 0; i < this._bands.length; i++) {
            this._bands[i].dispose();
        }
        this.numberOfBands = null;
        this._bands = null;
    };

    return Tone.SixBandEQ;
});