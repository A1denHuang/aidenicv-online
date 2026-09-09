import { h } from "preact"

export const BackToTop = () => {
  const Component = () =>
    h(
      "a",
      {
        class: "back-to-top",
        href: "#quartz-body",
        "aria-label": "返回顶部",
      },
      h("span", { "aria-hidden": "true" }, "↑"),
      h("span", null, "返回顶部"),
    )

  Component.displayName = "BackToTop"
  return Component
}
