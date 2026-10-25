import assert from "node:assert/strict"
import test from "node:test"
import vm from "node:vm"
import { Graph } from "@quartz-community/graph"
import { slugifyFilePath, type FilePath } from "@quartz-community/utils"
import { decodeGraphPath, normalizeGraphScript } from "./graph-paths.js"

const upstream = Graph().afterDOMLoaded as string
const getterName = upstream.match(
  /function\s+(\w+)\(\)\{(?:let|var)\s+\w+=window\.location\.pathname/,
)?.[1]

// Run the actual upstream path getter, with rendering disabled in the VM.
function graphPageSlug(script: string, pathname: string): string {
  assert.ok(getterName, "upstream path getter should remain recognizable")
  const sandbox = {
    window: { location: { pathname } },
    document: { querySelector: () => ({}), querySelectorAll: () => [] },
    console: { error() {} },
  }
  return vm.runInNewContext(`${script}; ${getterName}()`, sandbox)
}

test("encoded Chinese card URLs resolve to the indexed slug and its neighbors", () => {
  const indexedSlug = slugifyFilePath("知识卡片/UVM/02_object与component.md" as FilePath)
  const pathname = "/" + indexedSlug.split("/").map(encodeURIComponent).join("/")
  const index = new Map<string, { links: string[] }>([
    [indexedSlug, { links: ["知识卡片/uvm/03_组件树与实例路径"] }],
  ])
  assert.equal(index.get(graphPageSlug(upstream, pathname)), undefined)
  const page = index.get(graphPageSlug(normalizeGraphScript(upstream), pathname))
  assert.deepEqual(page?.links, ["知识卡片/uvm/03_组件树与实例路径"])
})

test("ASCII, decoded Chinese, root and trailing-slash paths keep their identity", () => {
  const script = normalizeGraphScript(upstream)
  for (const [pathname, expected] of [
    ["/notes/sequence", "notes/sequence"],
    ["/知识卡片/uvm/02_object与component", "知识卡片/uvm/02_object与component"],
    ["/", ""],
    ["/notes/", "notes"],
  ]) {
    assert.equal(graphPageSlug(script, pathname), expected)
  }
})

test("literal percent signs and malformed escapes do not break initialization", () => {
  assert.equal(decodeGraphPath("/notes/100%25"), "/notes/100%")
  assert.equal(decodeGraphPath("/notes/100%"), "/notes/100%")
  assert.equal(graphPageSlug(normalizeGraphScript(upstream), "/notes/%ZZ"), "notes/%ZZ")
})

test("patching is idempotent and upstream script changes require review", () => {
  const script = normalizeGraphScript(upstream)
  assert.equal(normalizeGraphScript(script), script)
  assert.throws(() => normalizeGraphScript("changed upstream script"), /needs review/)
})
