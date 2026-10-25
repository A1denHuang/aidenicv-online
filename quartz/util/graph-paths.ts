/** Match URL paths to the decoded Unicode slugs in Quartz's content index. */
export function decodeGraphPath(pathname: string): string {
  try {
    return decodeURIComponent(pathname)
  } catch {
    // An invalid escape should not prevent the graph from initializing.
    return pathname
  }
}

const patchMarker = "/* aidenicv:decoded-graph-path */"

/**
 * Compatibility fix for @quartz-community/graph 0.1.0: its browser script
 * reads location.pathname without decoding it. Apply to the component's
 * emitted script, keeping the installed package and its lockfile unchanged.
 */
export function normalizeGraphScript(script: string): string {
  if (script.includes(patchMarker)) return script

  const needle = "window.location.pathname"
  const occurrences = script.split(needle).length - 1
  if (occurrences !== 1) {
    throw new Error(
      "Graph path compatibility fix needs review: expected one location.pathname lookup",
    )
  }

  return script.replace(
    needle,
    `${patchMarker}(${decodeGraphPath.toString()})(window.location.pathname)`,
  )
}
