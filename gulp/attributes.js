var child_process = require("child_process");
var fs = require("fs");

var outputFile = "/out.json";

module.exports = function(files, outfolder, onend){
	child_process.exec("jsdoc -X "+files.join(" ") + " > "+outfolder+outputFile, function(){
		var file = fs.readFileSync(outfolder+outputFile);
		var json = JSON.parse(file);
		getClassList(json, outfolder);
		getClassHierarchy(json, outfolder);
		getClassDescription(json, outfolder);
		onend();
	});
};

/**
 *  CLASS LIST
 */
function getClassList(json, outfolder){
	console.log("making class list");

	var classList = {};

	for (var i = 0; i < json.length; i++){
		var item = json[i];
		if (item.kind === "class" && item.access !== "private"){
			var parent = item.meta.path.split("/");
			var level = parent[parent.length - 1];
			if (!classList[level]){
				classList[level] = [];
			}
			classList[level].push(item.name);
		}
	}
	fs.writeFileSync(outfolder+"/classList.json", JSON.stringify(classList, undefined, "\t"));
}

/**
 *  CLASS HEIRARCHY
 */
function getClassHierarchy(json, outfolder){

	console.log("making class heirarchy");

	var classHierarchy = {};
	var parents = {};

	for (var i = 0; i < json.length; i++){
		var item = json[i];
		if (item.kind === "class" && item.access !== "private" && item.augments){
			var parent = item.augments[0];
			var dotSplit = parent.split(".");
			parent = dotSplit[dotSplit.length - 1];
			if (!parents[parent]){
				parents[parent] = [];
			}
			parents[parent].push(item.name);
		}
	}
	//starting from the top
	getChildren("Tone", parents, classHierarchy);
	fs.writeFileSync(outfolder+"/classHierarchy.json", JSON.stringify(classHierarchy, undefined, "\t"));
}

function getChildren(parent, parentList, heirarchy){
	var children = parentList[parent];
	if (children){
		heirarchy[parent] = {};
		for (var i = 0; i < children.length; i++){
			var child = children[i];
			getChildren(child, parentList, heirarchy[parent]);
		}
	} else {
		heirarchy[parent] = "";
	}
}


/**
 *  CLASS DESCRIPTIONS
 */
function getClassDescription(json, outfolder){

	console.log("parsing descriptions");

	//the constructors
	var constructors = {};
	var i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === "class" && item.access !== "private"){
			constructors[item.name] = {
				description : item.classdesc,
				params : item.params,
				examples : item.examples
			};
			if (item.augments){
				constructors[item.name].extends = item.augments[0];
			}
		}
	}
	fs.writeFileSync(outfolder+"/constructors.json", JSON.stringify(constructors, undefined, "\t"));

	//functions
	var functions = {};
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === "function" && item.access !== "private" && item.memberof){
			//ignore things that are inherited from Tone
			if (item.inherited && item.inherits.indexOf("Tone#") !== -1){
				continue;
			}
			classSplit = item.memberof.split(".");
			cls = classSplit[classSplit.length - 1];
			if (cls === "defaults"){
				continue;
			}
			if (!functions[cls]){
				functions[cls] = {};
			} 
			functions[cls][item.name] = {
				description : item.description,
				params : item.params,
				examples : item.examples,
				returns : item.returns,
				scope : item.scope
			};
		}
	}
	fs.writeFileSync(outfolder+"/methods.json", JSON.stringify(functions, undefined, "\t"));

	//members
	var members = {};
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === "member" && item.access !== "private" && item.memberof && item.scope === "instance"){
			//ignore things that are inherited from Tone
			if (item.inherited && item.inherits.indexOf("Tone#") !== -1){
				continue;
			}
			classSplit = item.memberof.split(".");
			cls = classSplit[classSplit.length - 1];
			if (!item.type){
				continue;
			}
			if (!members[cls]){
				members[cls] = {};
			}
			var memberDesc = {
				description : item.description,
				type : item.type.names
			};
			//options
			if (item.tags){
				var option = item.tags.filter(function(attr){
					return attr.title === "options";
				})[0];
				if (option){
					memberDesc.options = JSON.parse(option.value);
				}
			}
			members[cls][item.name] = memberDesc;
		}
	}
	fs.writeFileSync(outfolder+"/members.json", JSON.stringify(members, undefined, "\t"));

	//typedef
	var typedefs = {};
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === "typedef" && item.access !== "private"){
			typedefs[item.name] = {
				description : item.description,
				name : item.type.names[0],
				value : item.defaultvalue
			};
		}
	}
	fs.writeFileSync(outfolder+"/types.json", JSON.stringify(typedefs, undefined, "\t"));

	//defaults
	var defaults = {};
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.access !== "private" && item.memberof){
			classSplit = item.memberof.split(".");
			cls = classSplit[classSplit.length - 1];
			if (cls === "defaults"){
				cls = classSplit[classSplit.length - 2];
				if (!defaults[cls]){
					defaults[cls] = {};
				}
				defaults[cls][item.name] = {
					type : item.type,
					value : item.meta.code.value
				};
			}
		}
	}
	fs.writeFileSync(outfolder+"/defaults.json", JSON.stringify(defaults, undefined, "\t"));
}