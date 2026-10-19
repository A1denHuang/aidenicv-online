import assert from "node:assert/strict"
import test from "node:test"
import render from "preact-render-to-string"
import { FeedbackIntro } from "./components.js"

const renderIntro = (comments) => {
  const Component = FeedbackIntro()
  return render(Component({ fileData: { frontmatter: { comments } } }))
}

test("renders the feedback heading and guidance by default", () => {
  const html = renderIntro(undefined)

  assert.match(html, /留言 \/ 勘误/)
  assert.match(html, /登录 GitHub 后即可留言/)
})

test("hides the feedback intro when comments are disabled", () => {
  assert.equal(renderIntro(false), "")
  assert.equal(renderIntro("false"), "")
})
