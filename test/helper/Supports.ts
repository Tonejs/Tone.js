
import { UAParser } from "ua-parser-js";

const parsed = new UAParser().getBrowser();

const name = parsed.name as string;

const version = parseInt(parsed.major as string, 10);

function is(browser, above?): boolean {
	above = above || 0;
	return name.includes(browser) && version >= above;
}

function isnt(browser, below?): boolean {
	below = below || Infinity;
	return !(name.includes(browser) && version <= below);
}

function isntVersion(browser, browserVersion?): boolean {
	return name.includes(browser) && version !== browserVersion;
}

// can disconnect from a specific node
export const NODE_DISCONNECT = is("Chrome", 50);

// offline rendering matches Chrome closely
// chrome is the platform the files were rendered on
// so it is the default for continuity testing
export const CHROME_AUDIO_RENDERING = is("Chrome");

// firefox does not correctly handle the situation where
// a linear/exponential ramp is scheduled after setTargetValueAtTime
export const SCHEDULE_RAMP_AFTER_SET_TARGET = is("Chrome");

// if the tests run in focus
export const ONLINE_TESTING = isntVersion("Chrome", 71);
// the close method resolves a promise
export const AUDIO_CONTEXT_CLOSE_RESOLVES = isnt("Firefox") && isnt("Safari", 10);
// if it supports gUM testing
export const GET_USER_MEDIA = isnt("Safari");
