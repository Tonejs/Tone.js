import Tone from "../core/Tone";

/**
 *  Makes sure that connect returns the dst node
 *  @private
 */
if (Tone.supported){
	var testContext = new OfflineAudioContext(2, 1, 44100);
	var testSrcNode = testContext.createGain();
	var testDstNode = testContext.createGain();
	if (testSrcNode.connect(testDstNode) !== testDstNode){
		var nativeConnect = AudioNode.prototype.connect;
		AudioNode.prototype.connect = function(){
			nativeConnect.apply(this, arguments);
			return arguments[0];
		};
	}
}

