var child_process = require("child_process");
var fs = require("fs");

var folders = ["../../Tone/core", "../../Tone/source", "../../Tone/instrument", "../../Tone/effect", "../../Tone/component", "../../Tone/signal"];
// var folders = ["../../Tone/core", "../../Tone/source"];
var outputFile = "./out.json";

child_process.exec("jsdoc -X "+folders.join(" ") + " > "+outputFile, function(){
	var file = fs.readFileSync(outputFile);
	var json = JSON.parse(file);
	getClassList(json);
	getClassHierarchy(json);
	getClassDescription(json);
});

/**
 *  CLASS LIST
 */
function getClassList(json){
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
	fs.writeFileSync("classList.json", JSON.stringify(classList, undefined, "\t"));
}

/**
 *  CLASS HEIRARCHY
 */
function getClassHierarchy(json){

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
	fs.writeFileSync("classHierarchy.json", JSON.stringify(classHierarchy, undefined, "\t"));
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
function getClassDescription(json){

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
	fs.writeFileSync("constructors.json", JSON.stringify(constructors, undefined, "\t"));

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
	fs.writeFileSync("methods.json", JSON.stringify(functions, undefined, "\t"));

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
	fs.writeFileSync("members.json", JSON.stringify(members, undefined, "\t"));

	//typedef
	var typedefs = {};
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === "typedef" && item.access !== "private"){
			typedefs[item.name] = {
				description : item.description,
				type : item.type,
			};
		}
	}
	fs.writeFileSync("typedefs.json", JSON.stringify(typedefs, undefined, "\t"));

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
	fs.writeFileSync("defaults.json", JSON.stringify(defaults, undefined, "\t"));
}