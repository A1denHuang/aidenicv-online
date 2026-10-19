document.addEventListener("nav", () => {
  const root = document.querySelector<HTMLElement>("[data-practice]")
  if (!root) return
  const links = [...document.querySelectorAll<HTMLAnchorElement>("article table a")]
  const key = "dv-practice-v1"
  let progress: Record<string, string> = {}
  try {
    progress = JSON.parse(localStorage.getItem(key) || "{}") || {}
  } catch {}
  const make = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "") => {
    const el = document.createElement(tag)
    el.textContent = text
    return el
  }
  const chapter = make("select")
  chapter.setAttribute("aria-label", "章节")
  chapter.add(new Option("全部章节", "all"))
  links.forEach((a, i) => chapter.add(new Option(a.textContent || "", String(i))))
  const mode = make("select")
  mode.setAttribute("aria-label", "练习模式")
  for (const [label, value] of [
    ["顺序 / 继续练习", "normal"],
    ["随机练习", "random"],
    ["错题重练", "wrong"],
  ])
    mode.add(new Option(label, value))
  const start = make("button", "开始刷题")
  const status = make("p", "先独立作答，再核对解析并自评。进度仅保存在当前浏览器。")
  status.setAttribute("role", "status")
  const panel = make("div")
  root.replaceChildren(chapter, mode, start, status, panel)
  type Question = { id: string; title: string; body: HTMLElement; answer: HTMLElement; url: string }
  let items: Question[] = [],
    index = 0
  function show() {
    panel.replaceChildren()
    if (index >= items.length) {
      status.textContent = items.length ? "本轮完成，可切换章节或重练错题。" : "当前范围没有错题。"
      return
    }
    const q = items[index]
    status.textContent = `第 ${index + 1} / ${items.length} 题 · 本组已掌握 ${items.filter((item) => progress[item.id] === "ok").length} 题（自评）`
    const title = make("h3", q.title)
    title.tabIndex = -1
    const draft = make("textarea")
    draft.setAttribute("aria-label", "我的答案（草稿不保存）")
    draft.placeholder = "写下你的思路（草稿不保存）"
    const answer = q.answer.cloneNode(true) as HTMLElement
    answer.hidden = true
    const reveal = make("button", "查看解析"),
      ok = make("button", "已掌握"),
      wrong = make("button", "未掌握，加入错题")
    ok.disabled = wrong.disabled = true
    reveal.onclick = () => {
      answer.hidden = false
      reveal.hidden = true
      ok.disabled = wrong.disabled = false
    }
    const rate = (value: string) => {
      progress[q.id] = value
      let saved = true
      try {
        localStorage.setItem(key, JSON.stringify(progress))
      } catch {
        saved = false
      }
      index++
      show()
      if (!saved) status.append(" · 浏览器无法保存进度，本次仍可练习。")
    }
    ok.onclick = () => rate("ok")
    wrong.onclick = () => rate("wrong")
    const prev = make("button", "上一题")
    prev.disabled = index === 0
    prev.onclick = () => {
      index--
      show()
    }
    const skip = make("button", "跳过")
    skip.onclick = () => {
      index++
      show()
    }
    const source = make("a", "阅读原题与配套笔记")
    source.href = q.url
    panel.append(
      title,
      q.body.cloneNode(true),
      draft,
      reveal,
      answer,
      ok,
      wrong,
      prev,
      skip,
      source,
    )
    title.focus({ preventScroll: true })
  }
  start.onclick = async () => {
    start.disabled = true
    status.textContent = "正在加载题目…"
    panel.replaceChildren()
    try {
      const selected = chapter.value === "all" ? links : [links[Number(chapter.value)]]
      const batches = await Promise.all(
        selected.map(async (a) => {
          const response = await fetch(a.href)
          if (!response.ok) throw new Error("load failed")
          const doc = new DOMParser().parseFromString(await response.text(), "text/html")
          doc.querySelectorAll("[href], [src]").forEach((el) => {
            for (const attr of ["href", "src"]) {
              const value = el.getAttribute(attr)
              if (value) el.setAttribute(attr, new URL(value, response.url).href)
            }
          })
          return [...doc.querySelectorAll<HTMLElement>("article h2")].flatMap((h) => {
            const title = h.textContent?.trim() || "",
              id = title.match(/^([QE]\d+)\s*·/)?.[1]
            if (!id) return []
            const body = make("div")
            let next = h.nextElementSibling
            while (next && !["H2", "HR"].includes(next.tagName)) {
              body.append(next.cloneNode(true))
              next = next.nextElementSibling
            }
            const details = body.querySelector("details")
            if (!details) throw new Error("missing answer")
            const answer = make("div")
            for (const node of [...details.childNodes])
              if (node.nodeName !== "SUMMARY") answer.append(node.cloneNode(true))
            details.remove()
            body.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"))
            const url = new URL(a.href)
            url.hash = h.id
            return [{ id, title, body, answer, url: url.href }]
          })
        }),
      )
      if (!root.isConnected) return
      items = batches.flat()
      index = 0
      if (!items.length) throw new Error("empty bank")
      if (mode.value === "wrong") items = items.filter((q) => progress[q.id] === "wrong")
      if (mode.value === "random")
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[items[i], items[j]] = [items[j], items[i]]
        }
      if (mode.value === "normal") {
        const first = items.findIndex((q) => !progress[q.id])
        index = first < 0 ? 0 : first
      }
      show()
    } catch {
      status.textContent = "加载失败，请重试；也可使用下方章节链接自测。"
    } finally {
      start.disabled = false
    }
  }
})
