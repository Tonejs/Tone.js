#!/usr/bin/env node

/**
 * Generates CHANGELOG.md from git commits between the two most recent semver
 * release tags, plus unreleased commits since the latest tag.
 *
 * Uses conventional-commits-parser to parse commit messages and semver to
 * identify and sort release tags.
 *
 * Usage: node scripts/changelog.mjs
 */

import { CommitParser } from "conventional-commits-parser";
import { writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, resolve } from "path";
import { rcompare as semverRcompare, valid as semverValid } from "semver";
import simpleGit from "simple-git";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { version } = require("../package.json");
const git = simpleGit(resolve(__dirname, ".."));

// Types to include, in display order
const TYPE_ORDER = [
	"feat",
	"fix",
	"perf",
	"refactor",
	"revert",
	"docs",
	"build",
	"chore",
];
const TYPE_LABELS = {
	feat: "Features",
	fix: "Bug Fixes",
	perf: "Performance",
	refactor: "Refactoring",
	revert: "Reverts",
	docs: "Documentation",
	build: "Build",
	chore: "Chores",
};

/** Returns semver tags sorted newest-first. Requires exact semver (no v-prefix). */
async function getSemverTags() {
	const { all } = await git.tags();
	return all
		.filter((t) => semverValid(t) === t)
		.sort((a, b) => semverRcompare(a, b));
}

/** Returns commits between two refs as [{hash, subject}] */
async function getCommits(from, to) {
	const log = await git.log({ from: to, to: from });
	return log.all.map((c) => ({
		hash: c.hash.slice(0, 7),
		subject: c.message,
	}));
}

/** Parses and groups commits by conventional type */
function groupCommits(commits, parser) {
	const groups = {};

	for (const { hash, subject } of commits) {
		const parsed = parser.parse(subject);
		const type = parsed.type ? parsed.type.toLowerCase() : null;

		if (!type || !TYPE_LABELS[type]) {
			continue;
		}

		// Skip dependency bump chores (too noisy)
		if (/^bump .+ from .+ to /i.test(parsed.subject || "")) {
			continue;
		}

		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push({
			hash,
			scope: parsed.scope || null,
			subject: parsed.subject || subject,
			breaking: !!(
				parsed.notes &&
				parsed.notes.some((n) => n.title === "BREAKING CHANGE")
			),
		});
	}

	return groups;
}

function linkifyPRs(text) {
	return text.replace(/#(\d+)/g, (_, n) => `[#${n}](${REPO_URL}/pull/${n})`);
}

function formatSection(groups) {
	const lines = [];
	for (const type of TYPE_ORDER) {
		if (!groups[type] || groups[type].length === 0) {
			continue;
		}
		lines.push(`### ${TYPE_LABELS[type]}`);
		lines.push("");
		for (const { scope, subject, hash, breaking } of groups[type]) {
			const scopePart = scope ? `**${scope}:** ` : "";
			const breakingMark = breaking ? " ⚠️ **BREAKING**" : "";
			const linkedSubject = linkifyPRs(subject);
			lines.push(
				`- ${scopePart}${linkedSubject}${breakingMark} (\`${hash}\`)`
			);
		}
		lines.push("");
	}
	return lines.join("\n");
}

async function getTagDate(tag) {
	const log = await git.log({ from: `${tag}^`, to: tag, maxCount: 1 });
	return log.latest ? log.latest.date.slice(0, 10) : "";
}

const REPO_URL = "https://github.com/Tonejs/Tone.js";
const parser = new CommitParser();

const tags = await getSemverTags();
if (tags.length < 2) {
	console.error("Need at least two semver tags to generate a changelog.");
	process.exit(1);
}

// Unreleased + the two most recent releases
const releases = [
	["HEAD", tags[0], version],
	[tags[0], tags[1], tags[0]],
];

const sections = [];

for (const [current, previous, displayName] of releases) {
	const commits = await getCommits(current, previous);
	const groups = groupCommits(commits, parser);
	const hasChanges = TYPE_ORDER.some(
		(t) => groups[t] && groups[t].length > 0
	);
	const compareUrl = `${REPO_URL}/compare/${previous}...${current}`;

	const date = current === "HEAD" ? null : await getTagDate(current);
	const heading = date
		? `## [${displayName}](${compareUrl}) — ${date}`
		: `## [${displayName}](${compareUrl})`;

	sections.push(heading);
	sections.push("");
	sections.push(
		hasChanges
			? formatSection(groups).trimEnd()
			: "_No significant changes._"
	);
	sections.push("");
}

const content = ["# Changelog", "", ...sections].join("\n");
const outPath = resolve(__dirname, "../CHANGELOG.md");
writeFileSync(outPath, content, "utf-8");
console.log(`Written to ${outPath}`);
