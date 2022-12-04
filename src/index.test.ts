import * as D from './index'

test("decode string", () => {
    expect(D.string.decodeValue("foo")).toBe("foo")
    expect(() => D.string.decodeValue(3)).toThrow("Expecting a STRING")
})
test("decode number", () => {
    expect(D.number.decodeValue(3)).toBe(3)
    expect(D.number.decodeValue(0)).toBe(0)
    expect(D.number.decodeValue(NaN)).toBe(NaN)
    expect(() => D.number.decodeValue("foo")).toThrow("Expecting a NUMBER")
})
test("decode boolean", () => {
    expect(D.boolean.decodeValue(true)).toBe(true)
    expect(D.boolean.decodeValue(false)).toBe(false)
    expect(() => D.boolean.decodeValue(null)).toThrow("Expecting a BOOLEAN")
})
test("decode null", () => {
    expect(D.null_.decodeValue(null)).toBe(null)
    expect(() => D.null_.decodeValue(false)).toThrow("Expecting a NULL")
})
test("decode nullable", () => {
    expect(D.number.nullable().decodeValue(null)).toBe(null)
    expect(D.number.nullable().decodeValue(3)).toBe(3)
    expect(() => D.number.nullable().decodeValue("three")).toThrow("Expecting a NULL")
})
test("decode array", () => {
    expect(D.number.array().decodeValue([])).toEqual([])
    expect(D.number.array().decodeValue([3])).toEqual([3])
    expect(D.number.array().decodeValue([3, 4, 5])).toEqual([3, 4, 5])
    expect(() => D.number.array().decodeValue("three")).toThrow("Expecting an ARRAY")
    expect(() => D.number.array().decodeValue(["three"])).toThrow("Expecting a NUMBER")
    expect(() => D.number.array().decodeValue([3, 4, "five"])).toThrow("Expecting a NUMBER")

    expect(D.number.nullable().array().decodeValue([3, 4, 5, null])).toEqual([3, 4, 5, null])
    expect(() => D.number.array().nullable().decodeValue([3, 4, 5, null])).toThrow()
    expect(() => D.number.nullable().array().decodeValue(null)).toThrow()
    expect(D.number.array().nullable().decodeValue(null)).toEqual(null)
})
test("decode dict", () => {
    expect(D.number.dict().decodeValue({})).toEqual({})
    expect(D.number.dict().decodeValue({ three: 3 })).toEqual({ three: 3 })
    expect(D.number.dict().decodeValue({ three: 3, four: 4 })).toEqual({ three: 3, four: 4 })
    expect(() => D.number.dict().decodeValue("three")).toThrow("Expecting an OBJECT")
    expect(() => D.number.dict().decodeValue({ three: "three" })).toThrow("Expecting a NUMBER")
    expect(() => D.number.dict().decodeValue({ three: 3, four: "four" })).toThrow("Expecting a NUMBER")


    expect(D.number.nullable().dict().decodeValue({ a: 3, b: null })).toEqual({ a: 3, b: null })
    expect(() => D.number.dict().nullable().decodeValue({ a: 3, b: null })).toThrow()
    expect(() => D.number.nullable().dict().decodeValue(null)).toThrow()
    expect(D.number.dict().nullable().decodeValue(null)).toEqual(null)
})
test("decode field", () => {
    expect(() => D.number.field("key").decodeValue(99)).toThrow("Expecting an OBJECT")
    expect(() => D.number.field("key").decodeValue([99])).toThrow("Expecting an OBJECT")
    expect(() => D.number.field("key").decodeValue({ key: "oof" })).toThrow("Expecting a NUMBER")
    expect(() => D.number.field("key").decodeValue({})).toThrow("Missing key")
    expect(D.number.field("key")['decoderFn']({ key: "oof" })).toMatchObject({ error: { path: ["key"] } })
    expect(D.number.field("two").field("key")['decoderFn']({ key: { two: "oof" } })).toMatchObject({ error: { path: ["key", "two"] } })
})
test("decode index", () => {
    expect(D.number.index(0).decodeValue([10, 11, 12])).toBe(10)
    expect(D.number.index(0).decodeValue([10, 11, 12])).toBe(10)
    expect(D.number.index(1).decodeValue([10, 11, 12])).toBe(11)
    expect(() => D.number.index(0).decodeValue(10)).toThrow("Expecting an ARRAY")
    expect(() => D.number.index(0).decodeValue({ key: 10 })).toThrow("Expecting an ARRAY")
    expect(() => D.number.index(0).decodeValue(["oof"])).toThrow("Expecting a NUMBER")
    expect(() => D.number.index(0).decodeValue([])).toThrow("Missing key")
    expect(D.number.index(0)['decoderFn'](["oof"])).toMatchObject({ error: { path: [0] } })
    expect(D.number.index(1).index(0)['decoderFn']([["oof", "oof"]])).toMatchObject({ error: { path: [0, 1] } })
})
test("decode get", () => {
    expect(D.number.get(0).decodeValue([10, 11, 12])).toBe(10)
    expect(D.number.get("key").decodeValue({ key: 99 })).toBe(99)
    expect(() => D.number.get(0).decodeValue({ key: 99 })).toThrow("Expecting an ARRAY")
    expect(() => D.number.get("key").decodeValue([10, 11, 12])).toThrow("Expecting an OBJECT")
    expect(D.number.get(0)['decoderFn'](["oof"])).toMatchObject({ error: { path: [0] } })
})
test("decode at", () => {
    expect(D.number.at([]).decodeValue(10)).toBe(10)
    expect(D.number.at([0]).decodeValue([10])).toBe(10)
    expect(D.number.at([0, 0]).decodeValue([[10]])).toBe(10)
    expect(D.number.at([1, 0]).decodeValue([11, [10]])).toBe(10)
    expect(D.number.at([1, 1]).decodeValue([11, [12, 10]])).toBe(10)
    expect(D.number.at([0, "key"]).decodeValue([{ key: 10 }])).toBe(10)
    expect(D.number.at(["key", 0]).decodeValue({ key: [10] })).toBe(10)
    expect(() => D.number.at([]).decodeValue("ten")).toThrow("Expecting a NUMBER")
    expect(() => D.number.at([0]).decodeValue([])).toThrow("Missing key")
    expect(() => D.number.at([0]).decodeValue({ key: "oof" })).toThrow("Expecting an ARRAY")
    expect(() => D.number.at(["key"]).decodeValue([10])).toThrow("Expecting an OBJECT")
    expect(D.number.at([0])['decoderFn'](["oof"])).toMatchObject({ error: { path: [0] } })
    expect(D.number.at(["key", 0])['decoderFn']({ key: ["oof"] })).toMatchObject({ error: { path: ["key", 0] } })
    expect(D.number.at([0, "key"])['decoderFn']([{ key: "oof" }])).toMatchObject({ error: { path: [0, "key"] } })
    expect(D.number.at([0, "key", "oof"])['decoderFn']([{ key: 10 }])).toMatchObject({ error: { path: [0, "key"] } })
})
test("decode succeed", () => {
    expect(D.succeed(42).decodeValue(0)).toBe(42)
    expect(D.succeed(42).decodeValue(null)).toBe(42)
    expect(D.succeed(42).decodeValue("yay")).toBe(42)
    expect(() => D.succeed(42).decodeString("oof")).toThrow(/Unexpected token o in JSON/)
})
test("decode fail", () => {
    expect(() => D.fail("oops").decodeValue(0)).toThrow("oops")
    expect(() => D.fail("oops").decodeValue(null)).toThrow("oops")
    expect(() => D.fail("oops").decodeValue("yay")).toThrow("oops")
    expect(() => D.succeed(42).decodeString("oof")).toThrow(/Unexpected token o in JSON/)
})
test("decode map", () => {
    expect(D.string.map(s => s.length).decodeValue("yay")).toBe(3)
    expect(D.string.map(s => s.length).decodeValue("yayay")).toBe(5)
})
test("decode andThen", () => {
    function isThree(n: number): D.Decoder<string> {
        return n === 3
            ? D.succeed("n is exactly three")
            : D.fail(`${n} is not three`)
    }
    expect(D.number.andThen(isThree).decodeValue(3)).toBe("n is exactly three")
    expect(() => D.number.andThen(isThree).decodeValue(null)).toThrow("Expecting a NUMBER")
    expect(() => D.number.andThen(isThree).decodeValue(true)).toThrow("Expecting a NUMBER")
    expect(() => D.number.andThen(isThree).decodeValue("three")).toThrow("Expecting a NUMBER")
    expect(() => D.number.andThen(isThree).decodeValue(6)).toThrow("6 is not three")
})
test("decode oneOf", () => {
    expect(D.oneOf(D.number, D.succeed(-1)).decodeValue(3)).toBe(3)
    expect(D.oneOf(D.number, D.succeed(-1)).decodeValue(9)).toBe(9)
    expect(D.oneOf(D.number, D.succeed(-1)).decodeValue("three")).toBe(-1)
    expect(D.oneOf(D.number, D.succeed(-1)).decodeValue(null)).toBe(-1)
    expect(() => D.oneOf(D.number).decodeValue(null)).toThrow("Expecting a NUMBER")
    // types prevent no-args oneOf
    // expect(() => D.oneOf()).toThrow("oneOf needs at least one decoder")
})
test("decode maybe", () => {
    const json = { name: "tom", age: 42 }
    expect(D.number.field("age").maybe().decodeValue(json)).toBe(42)
    expect(D.number.field("name").maybe().decodeValue(json)).toBe(null)
    expect(D.number.field("height").maybe().decodeValue(json)).toBe(null)
    expect(D.number.maybe().field("age").decodeValue(json)).toBe(42)
    expect(D.number.maybe().field("name").decodeValue(json)).toBe(null)
    expect(() => D.number.maybe().field("height").decodeValue(json)).toThrow("Missing key")
    // default values
    expect(D.number.field("age").maybe(3).decodeValue(json)).toBe(42)
    expect(D.number.field("name").maybe(3).decodeValue(json)).toBe(3)
    expect(D.number.field("height").maybe(3).decodeValue(json)).toBe(3)
})
test("decode nullAs", () => {
    expect(D.nullAs(42).decodeValue(null)).toBe(42)
    expect(() => D.nullAs(42).decodeValue("four")).toThrow("Expecting a NULL")
})
test("decode date", () => {
    const now = new Date()
    expect(D.date.decodeValue(now.getTime())).toStrictEqual(now)
    expect(D.date.decodeValue(D.Encode.date(now))).toStrictEqual(now)
    expect(D.date.decodeValue(1234)).toStrictEqual(new Date(1234))
})

test("decode combined fields", () => {
    type AB = { a: string, b: number }
    // type can be inferred...
    expect(D.combine({ a: D.string.field('a'), b: D.number.field('b') }).decodeValue({ a: 'yay', b: 3 })).toEqual({ a: 'yay', b: 3 })
    // ...or explicit
    expect(D.combine<AB>({ a: D.string.field('a'), b: D.number.field('b') }).decodeValue({ a: 'yay', b: 3 })).toEqual({ a: 'yay', b: 3 })

    expect(() => D.combine({ a: D.string.field('a'), b: D.number.field('b') }).decodeValue({ a: 'yay', c: 3 })).toThrow('Missing key')
})

test("decode combined auto-fields", () => {
    type AB = { a: string, b: number }
    // type can be inferred...
    expect(D.combine({ a: D.string, b: D.number }, true).decodeValue({ a: 'yay', b: 3 })).toEqual({ a: 'yay', b: 3 })
    // ...or explicit
    expect(D.combine<AB>({ a: D.string, b: D.number }, true).decodeValue({ a: 'yay', b: 3 })).toEqual({ a: 'yay', b: 3 })

    expect(() => D.combine({ a: D.string, b: D.number }, true).decodeValue({ a: 'yay', c: 3 })).toThrow('oneOf')
})

test("decode combined arrays", () => {
    type AB = [string, number]
    // type can be inferred...
    expect(D.combine([D.string.field('a'), D.number.field('b')]).decodeValue({ a: 'yay', b: 3 })).toEqual(['yay', 3])
    // ...or explicit
    expect(D.combine<AB>([D.string.field('a'), D.number.field('b')]).decodeValue({ a: 'yay', b: 3 })).toEqual(['yay', 3])

    expect(() => D.combine([D.string.field('a'), D.number.field('b')]).decodeValue({ a: 'yay', c: 3 })).toThrow('Missing key')
})