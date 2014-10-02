
(function(root, undef) {
	//leave no trace
	//undefine 'define'
	if (root.ToneDefinedDefine){
		root.define = undef;
		root.ToneDefinedDefine = undef;
	}
}(this, undefined));