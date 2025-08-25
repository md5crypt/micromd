import { readFileSync, existsSync, writeFileSync } from "fs"
import { resolve } from "path"

if (!existsSync(resolve(import.meta.dirname, "../dist/package.json"))) {
	writeFileSync(resolve(import.meta.dirname, "../dist/package.json"), '{"type": "module"}')
}

const importPath = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, "../dist/htmlRenderer.js")
import(importPath).then(module => run(module.mdRenderHtml))

function run(mdRenderHtml) {
	const data = readFileSync(resolve(import.meta.dirname, "testData.txt"), "utf8")

	const reStart = /%TESTCASE% ([^\n\r]+)\r?\n/g
	const reExpects = /\r?\n%EXPECTS%\r?\n/g
	const reEnd = /\r?\n%END%\r?\n/g

	let success = 0
	let failed = 0

	while (true) {
		const startMatch = reStart.exec(data)
		if (!startMatch) {
			break
		}
		reExpects.lastIndex = reStart.lastIndex
		const expectsMatch = reExpects.exec(data)
		if (!expectsMatch) {
			throw new Error("%EXPECTS% missing")
		}
		reEnd.lastIndex = reExpects.lastIndex
		const endMatch = reEnd.exec(data)
		if (!endMatch) {
			throw new Error("%END% missing")
		}
		const name = startMatch[1]
		const input = data.slice(reStart.lastIndex, expectsMatch.index)
		const expects = data.slice(reExpects.lastIndex, endMatch.index)
		let output
		try {
			output = mdRenderHtml(input)
		} catch (e) {
			output = e.toString()
		}
		console.log((expects == output ? "[pass]" : "[fail]") + ": " + name)
		if (expects != output) {
			failed += 1
			console.log("--- EXPECTED ---\n", expects, "\n---  ACTUAL  ---\n", output)
		} else {
			success += 1
		}
		reStart.lastIndex = reEnd.lastIndex	
	}

	console.log(`run: ${failed + success}, failed: ${failed}`)
	process.exit(failed ? 1 : 0)
}
