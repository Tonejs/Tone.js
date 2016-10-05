define(["Test", "Tone/type/Type", "Tone/core/Transport", "Tone/type/Time", "Tone/type/Frequency"], 
function (Test, Type, Transport, Time, Frequency) {

	//modified from http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
	function generatePermutations(args) {
	    var results = [], max = args.length-1;
	    function helper(arr, i) {
	        for (var j = 0; j < args[i].length; j++) {
	            var a = arr.slice(0); // clone arr
	            a.push(args[i][j]);
	            if (i===max)
	                results.push(a);
	            else
	                helper(a, i+1);
	        }
	    }
	    helper([], 0);
	    return results;
	}

	function getVariations(param){
		if (typeof param === "string" && param.indexOf("=") !== -1){
			return [undefined].concat(getVariations(param.replace("=", "")));
		} else if (param === "Time"){
			return ["2n", 1, Time("4n")];
		} else if (param === "Number"){
			return [20, 0, -0.5];
		} else if (param === "NormalRange"){
			return [0, 0.5, 1];
		} else if (param === "Frequency"){
			return ["C#4", 220, Frequency("A4")];
		} else if (param === "Function"){
			return [function(){}];
		} else {
			return param;
		}
	}


	function generateArgs(args){
		// turn the object into an array
		var keys = [];
		if (!Array.isArray(args)){
			keys = Object.keys(args);
			var tmp = [];
			for (var p in args){
				tmp.push(args[p]);
			}
			args = tmp;
		}
		for (var i = 0; i < args.length; i++){
			args[i] = getVariations(args[i]);
		}
		//generate all the permutations
		if (keys.length){
			var permutations = generatePermutations(args);
			permutations.map(function(permutation, index){
				var obj = {};
				permutation.map(function(val, index){
					obj[keys[index]] = val;
				});
				permutations[index] = [obj];
			});
			return permutations;
		} else {
			return generatePermutations(args);
		}
	}

	return {
		method : function(constructor, fn, args, consArgs){

			it (fn+" ("+args.join(", ") + ")", function(){
				var permutations = generateArgs(args);
				for (var i = 0; i < permutations.length; i++){
					var instance = new constructor(consArgs);
					instance[fn].apply(instance, permutations[i]);
					instance.dispose();
				}
			});
		},
		member : function(constructor, member, param, consArgs){
			it (member+" = "+param, function(){
				var permutations = generateArgs([param]);
				for (var i = 0; i < permutations.length; i++){
					var instance = new constructor(consArgs);
					instance[member] = permutations[i];
					instance.dispose();
				}
			});
		},
		constructor : function(constructor, args){

			var argString;
			if (Array.isArray(args)){
				argString = args.join(", ");
			} else {
				argString = JSON.stringify(args);
			}

			it ("constructor ( "+ argString + " )", function(){
				var permutations = generateArgs(args);
				for (var i = 0; i < permutations.length; i++){
					var Temp = function(){}; // temporary constructor
					Temp.prototype = constructor.prototype;
					var tmpInst = new Temp();
					constructor.apply(tmpInst, permutations[i]);
					tmpInst.dispose();
				}
			});
		},
	};
});