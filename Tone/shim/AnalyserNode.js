import Tone from "../core/Tone";
import "../shim/AudioContext";

/**
 *  AnalyserNode.getFloatTimeDomainData polyfill
 *  @private
 */
if (Tone.supported){
	if (!AnalyserNode.prototype.getFloatTimeDomainData){
		//referenced https://github.com/mohayonao/get-float-time-domain-data
		AnalyserNode.prototype.getFloatTimeDomainData = function(array){
			var uint8 = new Uint8Array(array.length);
			this.getByteTimeDomainData(uint8);
			for (var i = 0; i < uint8.length; i++){
				array[i] = (uint8[i] - 128) / 128;
			}
		};
	}
}

