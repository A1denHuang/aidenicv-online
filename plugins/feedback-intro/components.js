import { h } from "preact"

export const FeedbackIntro = () => {
  const Component = ({ fileData }) => {
    const commentsOverride = fileData.frontmatter?.comments
    if (commentsOverride === false || commentsOverride === "false") {
      return null
    }

    return h(
      "section",
      {
        class: "feedback-intro",
        "aria-labelledby": "feedback-heading",
      },
      h("h2", { id: "feedback-heading" }, "留言 / 勘误"),
      h("p", null, "欢迎指出错误、补充资料或提出问题。登录 GitHub 后即可留言。"),
    )
  }

  Component.displayName = "FeedbackIntro"
  return Component
}
