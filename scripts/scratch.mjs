import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

import { workletInlinePlugin } from "./esbuild-worklet-plugin.mjs";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const buildDir = path.join(rootDir, "build");
const entryPoint = path.join(rootDir, "examples/scratch.ts");
const customHtmlPath = path.join(rootDir, "examples/scratch.html");

if (!fs.existsSync(entryPoint)) {
	throw new Error(
		"Create examples/scratch.ts first to test things out locally"
	);
}

fs.mkdirSync(buildDir, { recursive: true });

const ctx = await esbuild.context({
	entryPoints: [entryPoint],
	bundle: true,
	outfile: path.join(buildDir, "scratch.js"),
	format: "iife",
	platform: "browser",
	sourcemap: true,
	tsconfig: path.join(rootDir, "tsconfig.json"),
	plugins: [workletInlinePlugin()],
});

await ctx.watch();

const esbuildServer = await ctx.serve({
	servedir: rootDir,
});

const defaultHtml = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Tone.js Scratch</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body>
		<script src="/build/scratch.js"></script>
	</body>
</html>
`;

const server = http.createServer((req, res) => {
	const urlPath = (req.url || "").split("?")[0];

	if (
		urlPath === "/" ||
		urlPath === "/index.html" ||
		urlPath === "/examples/scratch.html"
	) {
		if (fs.existsSync(customHtmlPath)) {
			res.writeHead(200, { "Content-Type": "text/html" });
			fs.createReadStream(customHtmlPath).pipe(res);
			return;
		}
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(defaultHtml);
		return;
	}

	let forwardPath = req.url;
	if (urlPath === "/scratch.js" || urlPath === "/examples/scratch.js") {
		forwardPath = "/build/scratch.js";
	}

	const proxyReq = http.request(
		{
			hostname: esbuildServer.hosts[0],
			port: esbuildServer.port,
			path: forwardPath,
			method: req.method,
			headers: req.headers,
		},
		(proxyRes) => {
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.pipe(res, { end: true });
		}
	);

	proxyReq.on("error", (err) => {
		res.writeHead(502, { "Content-Type": "text/plain" });
		res.end(`Proxy error: ${err.message}`);
	});

	req.pipe(proxyReq, { end: true });
});

const PORT = Number(process.env.PORT) || 9000;
server.listen(PORT, () => {
	console.log(`Scratch server running at http://localhost:${PORT}`);
});
