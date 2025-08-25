import { rmSync, mkdirSync, writeFileSync, copyFileSync, readdirSync} from "fs"
import { resolve, basename } from "path"

if (process.argv[2] == "verify") {
	if (basename(process.cwd()) != "dist-package") {
		console.error("--------------------------")
		console.error("use 'npm run pub' instead")
		console.error("--------------------------")
		process.exit(1)
	}
}

if (process.argv[2] == "pre-publish") {
	process.chdir(import.meta.dirname)
	rmSync("dist-package", {force: true, recursive: true})
	mkdirSync("dist-package")
	mkdirSync("dist-package/mjs")
	mkdirSync("dist-package/cjs")
	writeFileSync("dist-package/.npmignore", "publish.mjs")
	copyFileSync("publish.mjs", "dist-package/publish.mjs")
	copyFileSync("package.json", "dist-package/package.json")
	writeFileSync("dist-package/mjs/package.json", '{"type":"module"}')
	writeFileSync("dist-package/cjs/package.json", '{"type":"commonjs"}')

	const autoInclude = readdirSync(".").filter(x => /^(README|LICENSE|LICENCE)([.].+)?$/i.test(x))
	for (const item of autoInclude) {
		copyFileSync(item, resolve("dist-package", item))
	}
}

if (process.argv[2] == "post-publish") {
	process.chdir(import.meta.dirname)
	rmSync("dist-package", {force: true, recursive: true})
}
