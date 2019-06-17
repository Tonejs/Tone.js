// import {Offline} from "./Offline";
import { Compare } from "@tonejs/plot";
import { Context } from "Tone/core/context/Context";
import { OfflineContext } from "Tone/core/context/OfflineContext";
import "./ToneAudioBuffer";

export async function CompareToFile(
	callback, url: string,
	threshold: number = 0.001,
	RENDER_NEW: boolean = false,
	duration: number = 0.1, channels: number = 1,
): Promise<void> {
	// @ts-ignore
	const prefix = window.__karma__ ? "/base/test/" : "../test/";
	const origContext = Context.getGlobal();
	try {
		await Compare.toFile(context => {
			const offlineContext = new OfflineContext(context, duration, 11025);
			Context.setGlobal(offlineContext);
			callback(offlineContext);
		}, prefix + "audio/compare/" + url, threshold, RENDER_NEW, duration, channels, 11025);
	} finally {
		Context.setGlobal(origContext);
	}
}
