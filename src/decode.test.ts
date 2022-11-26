import * as D from './decode'
import * as E from './encode'

test("decode string", () => {
    expect(D.decodeValue(D.string, "foo")).toBe("foo")
    expect(() => D.decodeValue(D.string, 3)).toThrow("Expecting a STRING")
})
test("decode number", () => {
    expect(D.decodeValue(D.number, 3)).toBe(3)
    expect(D.decodeValue(D.number, 0)).toBe(0)
    expect(D.decodeValue(D.number, NaN)).toBe(NaN)
    expect(() => D.decodeValue(D.number, "foo")).toThrow("Expecting a NUMBER")
})
test("decode boolean", () => {
    expect(D.decodeValue(D.boolean, true)).toBe(true)
    expect(D.decodeValue(D.boolean, false)).toBe(false)
    expect(() => D.decodeValue(D.boolean, null)).toThrow("Expecting a BOOLEAN")
})
test("decode null", () => {
    expect(D.decodeValue(D.null_, null)).toBe(null)
    expect(() => D.decodeValue(D.null_, false)).toThrow("Expecting a NULL")
})
test("decode nullable", () => {
    expect(D.decodeValue(D.nullable(D.number), null)).toBe(null)
    expect(D.decodeValue(D.nullable(D.number), 3)).toBe(3)
    expect(() => D.decodeValue(D.nullable(D.number), "three")).toThrow("Expecting a NULL")
})
test("decode array", () => {
    expect(D.decodeValue(D.array(D.number), [])).toEqual([])
    expect(D.decodeValue(D.array(D.number), [3])).toEqual([3])
    expect(D.decodeValue(D.array(D.number), [3, 4, 5])).toEqual([3, 4, 5])
    expect(D.decodeValue(D.array(D.nullable(D.number)), [3, 4, 5, null])).toEqual([3, 4, 5, null])
    expect(() => D.decodeValue(D.array(D.number), "three")).toThrow("Expecting an ARRAY")
    expect(() => D.decodeValue(D.array(D.number), ["three"])).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.array(D.number), [3, 4, "five"])).toThrow("Expecting a NUMBER")
})
test("decode dict", () => {
    expect(D.decodeValue(D.dict(D.number), {})).toEqual({})
    expect(D.decodeValue(D.dict(D.number), { three: 3 })).toEqual({ three: 3 })
    expect(D.decodeValue(D.dict(D.number), { three: 3, four: 4 })).toEqual({ three: 3, four: 4 })
    expect(D.decodeValue(D.dict(D.nullable(D.number)), { three: 3, four: null })).toEqual({ three: 3, four: null })
    expect(() => D.decodeValue(D.dict(D.number), "three")).toThrow("Expecting an OBJECT")
    expect(() => D.decodeValue(D.dict(D.number), { three: "three" })).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.dict(D.number), { three: 3, four: "four" })).toThrow("Expecting a NUMBER")
})
test("decode field", () => {
    expect(D.decodeValue(D.field("key", D.number), { key: 99 })).toBe(99)
    expect(() => D.decodeValue(D.field("key", D.number), 99)).toThrow("Expecting an OBJECT")
    expect(() => D.decodeValue(D.field("key", D.number), [99])).toThrow("Expecting an OBJECT")
    expect(() => D.decodeValue(D.field("key", D.number), { key: "oof" })).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.field("key", D.number), {})).toThrow("Missing key")
    expect(D.field("key", D.number).decoderFn({ key: "oof" })).toMatchObject({ error: { path: ["key"] } })
    expect(D.field("key", D.field("two", D.number)).decoderFn({ key: { two: "oof" } })).toMatchObject({ error: { path: ["key", "two"] } })
})
test("decode index", () => {
    expect(D.decodeValue(D.index(0, D.number), [10, 11, 12])).toBe(10)
    expect(D.decodeValue(D.index(1, D.number), [10, 11, 12])).toBe(11)
    expect(() => D.decodeValue(D.index(0, D.number), 10)).toThrow("Expecting an ARRAY")
    expect(() => D.decodeValue(D.index(0, D.number), { key: 10 })).toThrow("Expecting an ARRAY")
    expect(() => D.decodeValue(D.index(0, D.number), ["oof"])).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.index(0, D.number), [])).toThrow("Missing key")
    expect(D.index(0, D.number).decoderFn(["oof"])).toMatchObject({ error: { path: [0] } })
    expect(D.index(0, D.index(1, D.number)).decoderFn([["oof", "oof"]])).toMatchObject({ error: { path: [0, 1] } })
})
test("decode get", () => {
    expect(D.decodeValue(D.get(0, D.number), [10, 11, 12])).toBe(10)
    expect(D.decodeValue(D.field("key", D.number), { key: 99 })).toBe(99)
    expect(() => D.decodeValue(D.get(0, D.number), { key: 10 })).toThrow("Expecting an ARRAY")
    expect(() => D.decodeValue(D.get("key", D.number), [99])).toThrow("Expecting an OBJECT")
    expect(D.get(0, D.number).decoderFn(["oof"])).toMatchObject({ error: { path: [0] } })
})
test("decode at", () => {
    expect(D.decodeValue(D.at([], D.number), 10)).toBe(10)
    expect(D.decodeValue(D.at([0], D.number), [10])).toBe(10)
    expect(D.decodeValue(D.at([0, 0], D.number), [[10]])).toBe(10)
    expect(D.decodeValue(D.at([1, 0], D.number), [11, [10]])).toBe(10)
    expect(D.decodeValue(D.at([1, 1], D.number), [11, [12, 10]])).toBe(10)
    expect(D.decodeValue(D.at([0, "key"], D.number), [{ key: 10 }])).toBe(10)
    expect(D.decodeValue(D.at(["key", 0], D.number), { key: [10] })).toBe(10)
    expect(() => D.decodeValue(D.at([], D.number), "ten")).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.at([0], D.number), [])).toThrow("Missing key")
    expect(() => D.decodeValue(D.at([0], D.number), { key: "oof" })).toThrow("Expecting an ARRAY")
    expect(() => D.decodeValue(D.at(["key"], D.number), [10])).toThrow("Expecting an OBJECT")
    expect(D.at([0], D.number).decoderFn(["oof"])).toMatchObject({ error: { path: [0] } })
    expect(D.at(["key", 0], D.number).decoderFn({ key: ["oof"] })).toMatchObject({ error: { path: ["key", 0] } })
    expect(D.at([0, "key"], D.number).decoderFn([{ key: "oof" }])).toMatchObject({ error: { path: [0, "key"] } })
    expect(D.at([0, "key", "oof"], D.number).decoderFn([{ key: 10 }])).toMatchObject({ error: { path: [0, "key"] } })
})
test("decode succeed", () => {
    expect(D.decodeValue(D.succeed(42), 0)).toBe(42)
    expect(D.decodeValue(D.succeed(42), null)).toBe(42)
    expect(D.decodeValue(D.succeed(42), "yay")).toBe(42)
    expect(() => D.decodeString(D.succeed(42), "oof")).toThrow(/Unexpected token o in JSON/)
})
test("decode fail", () => {
    expect(() => D.decodeValue(D.fail("oops"), 0)).toThrow("oops")
    expect(() => D.decodeValue(D.fail("oops"), null)).toThrow("oops")
    expect(() => D.decodeValue(D.fail("oops"), "yay")).toThrow("oops")
    expect(() => D.decodeString(D.succeed(42), "oof")).toThrow(/Unexpected token o in JSON/)
})
test("decode map", () => {
    expect(D.decodeValue(D.map(s => s.length, D.string), "yay")).toBe(3)
    expect(D.decodeValue(D.map(s => s.length, D.string), "yayay")).toBe(5)
})
test("decode map2", () => {
    expect(D.decodeValue(D.map((a, b) => ({ a, b }), D.string, D.string), "yay")).toEqual({ a: "yay", b: "yay" })
})
test("decode andThen", () => {
    function isThree(n: number): D.Decoder<string> {
        return n === 3
            ? D.succeed("n is exactly three")
            : D.fail(`${n} is not three`)
    }
    expect(D.decodeValue(D.andThen(isThree, D.number), 3)).toBe("n is exactly three")
    expect(() => D.decodeValue(D.andThen(isThree, D.number), null)).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.andThen(isThree, D.number), true)).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.andThen(isThree, D.number), "three")).toThrow("Expecting a NUMBER")
    expect(() => D.decodeValue(D.andThen(isThree, D.number), 6)).toThrow("6 is not three")
})
test("decode oneOf", () => {
    expect(D.decodeValue(D.oneOf(D.number, D.succeed(-1)), 3)).toBe(3)
    expect(D.decodeValue(D.oneOf(D.number, D.succeed(-1)), 9)).toBe(9)
    expect(D.decodeValue(D.oneOf(D.number, D.succeed(-1)), "three")).toBe(-1)
    expect(D.decodeValue(D.oneOf(D.number, D.succeed(-1)), null)).toBe(-1)
    expect(() => D.decodeValue(D.oneOf(D.number), null)).toThrow("Expecting a NUMBER")
    // types prevent no-args oneOf
    // expect(() => D.oneOf()).toThrow("oneOf needs at least one decoder")
})
test("decode maybe", () => {
    const json = { name: "tom", age: 42 }
    expect(D.decodeValue(D.maybe(D.field("age", D.number)), json)).toBe(42)
    expect(D.decodeValue(D.maybe(D.field("name", D.number)), json)).toBe(null)
    expect(D.decodeValue(D.maybe(D.field("height", D.number)), json)).toBe(null)
    expect(D.decodeValue(D.field("age", D.maybe(D.number)), json)).toBe(42)
    expect(D.decodeValue(D.field("name", D.maybe(D.number)), json)).toBe(null)
    expect(() => D.decodeValue(D.field("height", D.maybe(D.number)), json)).toThrow("Missing key")
    // default values
    expect(D.decodeValue(D.field("age", D.maybe(D.number, 3)), json)).toBe(42)
    expect(D.decodeValue(D.field("name", D.maybe(D.number, 3)), json)).toBe(3)
})
test("decode nullAs", () => {
    expect(D.decodeValue(D.nullAs(42), null)).toBe(42)
    expect(() => D.decodeValue(D.nullAs(42), "four")).toThrow("Expecting a NULL")
})
test("decode date", () => {
    const now = new Date()
    expect(D.decodeValue(D.date, now.getTime())).toStrictEqual(now)
    expect(D.decodeValue(D.date, E.date(now))).toStrictEqual(now)
    expect(D.decodeValue(D.date, 1234)).toStrictEqual(new Date(1234))
})

test("decode methods", () => {
    expect(D.string.decodeValue("foo")).toBe("foo")
    expect(() => D.string.decodeValue(3)).toThrow("Expecting a STRING")

    expect(D.number.array().decodeValue([])).toEqual([])
    expect(D.number.array().decodeValue([3])).toEqual([3])
    expect(() => D.number.array().decodeValue(3)).toThrow("Expecting an ARRAY")

    expect(D.number.field("three").decodeValue({ three: 3 })).toBe(3)
    expect(D.number.index(0).decodeValue([3])).toBe(3)
    expect(D.number.get(0).decodeValue([3])).toBe(3)
    expect(D.number.at([0]).decodeValue([3])).toBe(3)
    expect(() => D.number.index(1).decodeValue([3])).toThrow("Missing key")

    expect(D.number.map(n => n * n).decodeValue(3)).toBe(9)
    expect(D.number.andThen(n => D.succeed(n * n)).decodeValue(3)).toBe(9)
})