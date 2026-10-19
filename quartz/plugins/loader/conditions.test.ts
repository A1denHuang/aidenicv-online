import assert from "node:assert/strict"
import test from "node:test"
import type { QuartzComponentProps } from "../../components/types"
import { getCondition } from "./conditions"

const notIndex = getCondition("not-index")!
const propsFor = (slug: string) => ({ fileData: { slug } }) as QuartzComponentProps

test("not-index matches ordinary content but not index pages", () => {
  assert.equal(notIndex(propsFor("学习笔记/SystemVerilog/数据类型")), true)
  assert.equal(notIndex(propsFor("index")), false)
  assert.equal(notIndex(propsFor("学习笔记/index")), false)
})
