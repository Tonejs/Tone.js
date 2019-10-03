// import {Offline} from "./Offline";
import { Compare } from "@tonejs/plot";
import { OfflineContext } from "Tone/core/context/OfflineContext";
import { getContext, setContext } from "Tone/core/Global";
import "./ToneAudioBuffer";

export async function CompareToFile(
	callback, url: string,
	threshold: number = 0.001,
	RENDER_NEW: boolean = false,
	duration: number = 0.1, channels: number = 1,
): Promise<void> {
	// @ts-ignore
	const prefix = window.__karma__ ? "/base/test/" : "../test/";
	const origContext = getContext();
	try {
		await Compare.toFile(async context => {
			const offlineContext = new OfflineContext(context);
			setContext(offlineContext);
			await callback(offlineContext);
			// @ts-ignore
			await offlineContext.workletsAreReady();
			// @ts-ignore
			await offlineContext._renderClock();
		}, prefix + "audio/compare/" + url, threshold, RENDER_NEW, duration, channels, 44100);
	} finally {
		setContext(origContext);
	}
}
