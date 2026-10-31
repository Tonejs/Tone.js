/**
 * Resolves after the given number of milliseconds
 */
export function wait(ms: number): Promise<void> {
	return new Promise((done) => setTimeout(done, ms));
}
