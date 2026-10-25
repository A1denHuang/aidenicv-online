import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { siteConfig } from "./site.config"
import { normalizeGraphScript } from "./quartz/util/graph-paths"

componentRegistry.setOptionOverrides("footer", {
  links: siteConfig.socialLinks,
})

const config = await loadQuartzConfig({
  pageTitle: siteConfig.name,
  pageTitleSuffix: ` · ${siteConfig.name}`,
  baseUrl: siteConfig.baseUrl,
  locale: "zh-CN",
  analytics: null,
})

// Layouts already hold these cached component instances. Normalize the graph's
// emitted script before resources are collected, including local/global views.
for (const component of componentRegistry.getAllComponents()) {
  if (
    typeof component.afterDOMLoaded === "string" &&
    component.afterDOMLoaded.includes("[Graph]")
  ) {
    component.afterDOMLoaded = normalizeGraphScript(component.afterDOMLoaded)
  }
}

export default config
export const layout = await loadQuartzLayout()
