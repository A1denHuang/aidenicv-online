import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const outputRoot = path.join(projectRoot, "public")
const katexSource = path.join(projectRoot, "node_modules", "katex", "dist")
const katexTarget = path.join(outputRoot, "static", "katex")

await mkdir(katexTarget, { recursive: true })
await cp(path.join(katexSource, "fonts"), path.join(katexTarget, "fonts"), {
  recursive: true,
})
await cp(path.join(katexSource, "katex.min.css"), path.join(katexTarget, "katex.min.css"))
await cp(
  path.join(katexSource, "contrib", "copy-tex.min.js"),
  path.join(katexTarget, "copy-tex.min.js"),
)

const htmlFiles = []
async function collectHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await collectHtml(fullPath)
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath)
    }
  }
}

await collectHtml(outputRoot)

for (const htmlPath of htmlFiles) {
  const relativeCss = path
    .relative(path.dirname(htmlPath), path.join(katexTarget, "katex.min.css"))
    .replaceAll(path.sep, "/")
  const relativeScript = path
    .relative(path.dirname(htmlPath), path.join(katexTarget, "copy-tex.min.js"))
    .replaceAll(path.sep, "/")

  const source = await readFile(htmlPath, "utf8")
  const localized = source
    .replace("https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css", relativeCss)
    .replace(
      "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js",
      relativeScript,
    )
  await writeFile(htmlPath, localized)
}

console.log(`Vendored KaTeX assets and rewrote ${htmlFiles.length} HTML files.`)
