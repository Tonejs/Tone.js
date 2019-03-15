import Offline from "helper/Offline";
import Buffer from "Tone/core/Buffer";
import audioBufferToWav from "audiobuffer-to-wav";
import FFT from "fft-js";
import Tone from "Tone/core/Tone";

export default function(callback, url, threshold, RENDER_NEW){
	if (!RENDER_NEW){
		threshold = Tone.defaultArg(threshold, 0.001);
		var baseUrl = "./audio/compare/";
		return Buffer.fromUrl(baseUrl+url).then(function(buffer){
			return Offline(callback, buffer.duration, buffer.numberOfChannels).then(function(renderedBuffer){
				return {
					rendered : renderedBuffer,
					target : buffer
				};
			});
		}).then(function(buffers){
			//go through and compare everything
			var renderedValues = buffers.rendered.toArray();
			var targetValues = buffers.target.toArray();
			var difference = 0;
			var samples = 0;
			targetValues.forEach(function(channel, channelNumber){
				var fftSize = 4096;
				var renderedChannel = renderedValues[channelNumber];
				for (var i = 0; i < channel.length; i+=fftSize){
					if (i + fftSize <= channel.length){
						var renderedPhasors = FFT.fft(renderedChannel.slice(i, i+fftSize));
						var targetPhasors = FFT.fft(channel.slice(i, i+fftSize));
						var renderedMagnitudes = FFT.util.fftMag(renderedPhasors);
						var targetMagnitudes = FFT.util.fftMag(targetPhasors);
						targetMagnitudes.forEach(function(value, index){
							difference += Math.abs(renderedMagnitudes[index] - value);
							samples++;
						});
					}
				}
			});
			expect(difference/samples).to.be.lt(threshold);
		});

	} else {
		var duration = threshold || 1;
		return Offline(callback, duration, 2).then(function(buffer){
			var wave = audioBufferToWav(buffer.get());
			var blob = new Blob([wave], { type : "audio/wav" });
			var blobUrl = window.URL.createObjectURL(blob);
			var a = document.createElement("a");
			a.href = blobUrl;
			a.download = url;
			a.click();
			window.URL.revokeObjectURL(blobUrl);
		});
	}
}

