import { Offline as PlotOffline } from "@tonejs/plot";
import { getContext, setContext } from "../../Tone/core/Global";

export async function Offline(
	callback: (context: BaseAudioContext) => Promise<void> | void,
	duration = 0.1, channels = 1,
) {
	const buffer = await PlotOffline(async context => {
		const originalContext = getContext();
		setContext(context);
		await callback(context);
		setContext(originalContext);
	}, duration, channels);
	return buffer;
}
