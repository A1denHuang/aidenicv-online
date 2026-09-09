import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { siteConfig } from "./site.config"

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
export default config
export const layout = await loadQuartzLayout()
