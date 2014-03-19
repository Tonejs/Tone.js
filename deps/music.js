/*
 *  MUSIC.js - a music creation library containing functions and data sets to generate notes, intervals, chords, scales, ...
 *  (currently for twelve-tone equal temperament tuning only)
 *
 *  developed by Greg Jopa and Piers Titus
 *
 */
var MUSIC = {
    // notes - two dimensional [octave, fifth] - relative to the 'main' note
    notes: {
        'Fb': [6, -10],
        'Cb': [5, -9],
        'Gb': [5, -8],
        'Db': [4, -7],
        'Ab': [4, -6],
        'Eb': [3, -5],
        'Bb': [3, -4],

        'F': [2, -3],
        'C': [1, -2],
        'G': [1, -1],
        'D': [0, 0],
        'A': [0, 1],
        'E': [-1, 2],
        'B': [-1, 3],

        'F#': [-2, 4],
        'C#': [-3, 5],
        'G#': [-3, 6],
        'D#': [-4, 7],
        'A#': [-4, 8],
        'E#': [-5, 9],
        'B#': [-5, 10]
    },

    baseFreq: 440,  // A4 'main' note
    baseOffset: [4, 1],  // offset of base note from D0

    // intervals - two dimensional [octave, fifth] - relative to the 'main' note
    intervals: {
        'unison':           [0, 0],
        'minor second':     [3, -5],
        'major second':     [-1, 2],
        'minor third':      [2, -3],
        'major third':      [-2, 4],
        'fourth':           [1, -1],
        'augmented fourth': [-3, 6],
        'tritone':          [-3, 6],
        'diminished fifth': [4, -6],
        'fifth':            [0, 1],
        'minor sixth':      [3, -4],
        'major sixth':      [-1, 3],
        'minor seventh':    [2, -2],
        'major seventh':    [-2, 5],
        'octave':           [1, 0]
    },

    intervals_semitones: {
        0:  [0, 0],
        1:  [3, -5],
        2:  [-1, 2],
        3:  [2, -3],
        4:  [-2, 4],
        5:  [1, -1],
        6:  [-3, 6],
        7:  [0, 1],
        8:  [3, -4],
        9:  [-1, 3],
        10: [2, -2],
        11: [-2, 5],
        12: [1, 0]
    },

    scales: {
        'major': ['major second', 'major third', 'fourth', 'fifth', 'major sixth', 'major seventh'],
        'natural minor': ['major second', 'minor third', 'fourth', 'fifth', 'minor sixth', 'minor seventh'],
        'harmonic minor': ['major second', 'minor third', 'fourth', 'fifth', 'minor sixth', 'major seventh'],
        'major pentatonic': ['major second', 'major third', 'fifth', 'major sixth'],
        'minor pentatonic': ['minor third', 'fourth', 'minor sixth', 'minor seventh']
    }
};


/**
 * Note class
 *
 * @param {Number}x2 coord
 *
 * @constructor
*/
function Note(coord) {
    this.coord = coord;
}

Note.prototype.frequency = function() {
    return MUSIC.baseFreq * Math.pow(2.0, (this.coord[0] * 1200 + this.coord[1] * 700) / 1200);
}

Note.prototype.accidental = function() {
    return Math.round((this.coord[1] + MUSIC.baseOffset[1]) / 7);
}

Note.prototype.octave = function() {
    // calculate octave of base note without accidentals
    var acc = this.accidental();
    return this.coord[0] + MUSIC.baseOffset[0] + 4 * acc + Math.floor((this.coord[1] + MUSIC.baseOffset[1] - 7 * acc) / 2);
}

Note.prototype.latin = function() {
    var noteNames = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
    var accidentals = ['bb', 'b', '', '#', 'x'];
    var acc = this.accidental();
    return noteNames[this.coord[1] + MUSIC.baseOffset[1] - acc * 7 + 3] + accidentals[acc + 2];
}

Note.fromLatin = function(name) {

    var out = [],
        j = 0,
        i, coord;

    var n = name.split(/(\d+)/);

    if (n.length > 3) {
  
        for (i = 0; i < (n.length - 1) / 2; i++) {

            coord = MUSIC.notes[n[j]];
            coord = [coord[0] + parseInt(n[j + 1]), coord[1]];

            coord[0] -= MUSIC.baseOffset[0];
            coord[1] -= MUSIC.baseOffset[1];

            out[i] = new Note(coord);
            j += 2;
        }
        return out;
    }
    else
    {
        coord = MUSIC.notes[n[0]];
        coord = [coord[0] + parseInt(n[1]), coord[1]];

        coord[0] -= MUSIC.baseOffset[0];
        coord[1] -= MUSIC.baseOffset[1];

        return new Note(coord);
    }
}

Note.prototype.scale = function(name) {

    var out = [],
        i;  
    
    var scale = MUSIC.scales[name];

    out.push(this.add('unison'));
    
    for (i = 0; i < scale.length; i++) {
        out[i + 1] = this.add(Interval.fromName(scale[i]));
    }

    out.push(this.add('octave'));

    return out;
}

Note.prototype.add = function(interval) {
  
    var out = [],
        i;
  
    // if input is string try to parse it as interval
    if (typeof(interval) == 'string') {
        interval = Interval.fromName(interval);
    }

    // if input is an array return an array
    if (interval.length) {

        for (i = 0; i < interval.length; i++) {
            out[i] = this.add(interval[i]);
        }
        add_addsubtract_func(out);

        return out;
    } 
    else {
        return new Note([this.coord[0] + interval.coord[0], this.coord[1] + interval.coord[1]]);
    }
}

Note.prototype.subtract = function(interval) {
  
    var out = [],
        i, coord;
      
    // if input is string try to parse it as interval 
    if (typeof(interval) == 'string') {
        interval = Interval.fromName(interval);
    }
    
    // if input is an array return an array
    if (interval.length) {

        for (i = 0; i < interval.length; i++) {
            out[i] = this.subtract(interval[i]);
        }

        add_addsubtract_func(out);

        return out;

    } 
    else {
        coord = [this.coord[0] - interval.coord[0], this.coord[1] - interval.coord[1]];
        if (typeof(interval.frequency) == 'function') {
            // if input is another note return the difference as interval
            return new Interval(coord);
        } else {
            return new Note(coord);
        }
    }
}

/**
 * Interval class
 *
 * @param {Number}x2 coord
 *
 * @constructor
 */
function Interval(coord) {
    this.coord = coord;
}

Interval.fromName = function(name) {
    return new Interval(MUSIC.intervals[name]);
}

Interval.fromSemitones = function(num) {
    return new Interval(MUSIC.intervals_semitones[num]);
}

Interval.fromTonesSemitones = function(tone_semitone) {
    // multiply [tones, semitones] vector with [-1 2;3 -5] to get coordinate from tones and semitones
    return new Interval([tone_semitone[0] * -1 + tone_semitone[1] * 3, tone_semitone[0] * 2 + tone_semitone[1] * -5]);
}

Interval.prototype.tone_semitone = function() {
    // multiply coord vector with [5 2;3 1] to get coordinate in tones and semitones
    // [5 2;3 1] is the inverse of [-1 2;3 -5], which is the coordinates of [tone; semitone]
    return [this.coord[0] * 5 + this.coord[1] * 3, this.coord[0] * 2 + this.coord[1] * 1];
}

Interval.prototype.semitone = function() {
    // number of semitones of interval = tones * 2 + semitones
    var tone_semitone = this.tone_semitone();
    return tone_semitone[0] * 2 + tone_semitone[1];
}

Interval.prototype.add = function(interval) {
    if (typeof(interval) == 'string') {
        interval = Interval.fromName(interval);
    }
    return new Interval([this.coord[0] + interval.coord[0], this.coord[1] + interval.coord[1]]);
}

Interval.prototype.subtract = function(interval) {
    if (typeof(interval) == 'string') {
        interval = Interval.fromName(interval);
    }
    return new Note([this.coord[0] - interval.coord[0], this.coord[1] - interval.coord[1]]);
}


/**
 * function to add the .add and .subtract functions to an array. Those functions now are executed for each element in an array.
 */
function add_addsubtract_func(array) {
    array.add = function(that) {
        var out = [],
            x;
          
        for (x in this) {
            if (typeof(this[x]) == 'object') {
                out[x] = this[x].add(that);
            }
        }
        add_addsubtract_func(out);
        return out;
    };
    array.subtract = function(that) {
        var out = [],
            x;
          
        for (x in this) {
            if (typeof(this[x]) == 'object') {
                out[x] = this[x].subtract(that);
            }
        }

        add_addsubtract_func(out);

        return out;
    };
    return array;
}
