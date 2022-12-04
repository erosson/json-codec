/**
 * Turn JSON values into typed, validated Typescript values.
 * 
 * Based on Elm's `Json.Decode` library. Documentation text is almost entirely stolen from there.
 * 
 * Definitely check out the Elm to JSON decoders to get a feel for how this library works!
 * https://guide.elm-lang.org/effects/json.html
 */
import { Value } from './json'
import * as R from './result'

type FieldError = { decodeError: 'field', path: (string | number)[], field: string, error: DecodeError }
type IndexError = { decodeError: 'index', path: (string | number)[], index: number, error: DecodeError }
type OneOfError = { decodeError: 'oneOf', path: (string | number)[], errors: DecodeError[] }
type FailureError = { decodeError: 'failure', path: (string | number)[], message: string, value: Value }
type DecodeError
    = FieldError
    | IndexError
    | OneOfError
    | FailureError

const error = {
    field(field: string, error: DecodeError): DecodeErr {
        return R.err({ decodeError: 'field', path: [], field, error })
    },
    index(index: number, error: DecodeError): DecodeErr {
        return R.err({ decodeError: 'index', path: [], index, error })
    },
    oneOf(errors: DecodeError[]): DecodeErr {
        return R.err({ decodeError: 'oneOf', path: [], errors })
    },
    failure(message: string, value: Value): DecodeErr {
        return R.err({ decodeError: 'failure', path: [], message, value })
    },
    expecting(type_: string, value: Value): DecodeErr {
        return R.err({ decodeError: 'failure', path: [], message: `Expecting ${type_}`, value })
    },
    missing(key: string | number, value: Value): DecodeErr {
        return R.err({ decodeError: 'failure', path: [], message: `Missing key: ${JSON.stringify(key)}`, value })
    },
}

type DecodeErr = R.Err<DecodeError>
type DecodeResult<V> = R.Result<DecodeError, V>


/**
 * A value that knows how to decode JSON values.
 * 
 * Based on Elm's JSON decoders:
 * https://package.elm-lang.org/packages/elm/json/latest/Json.Decode
 */
export class Decoder<T> {
    /**
     * @hideconstructor
     */
    constructor(private decoderFn: (v: Value) => DecodeResult<T>) { }

    /**
     * Run a `Decoder` on some JSON `Value`. If you've already run `JSON.parse`, or
     * otherwise have your JSON as an object instead of a string, use this.
     * 
     *     number.decodeValue(4) // 4
     *     number.decodeValue("four") // throws ParseError
     */
    decodeValue(value: Value): T {
        const res = this.decoderFn(value)
        if (res.success) {
            return res.value
        }
        throw new Error(JSON.stringify(res.error, null, 2))
    }

    /**
     * Parse the given string into a JSON value and then run the Decoder on it.
     * This will fail if the string is not well-formed JSON or if the Decoder
     * fails for some reason.
     * 
     *     number.decodeString("4") // 4
     *     number.decodeString("1 + 2") // throws ParseError
     */
    decodeString(value: string): T {
        return this.decodeValue(JSON.parse(value))
    }

    /**
     * Transform a decoder. Maybe you just want to know the length of a string:
     *     
     *     const stringLength: Decoder<number> = string.map((s: string): number => s.length)
     * 
     * It is often helpful to use `map` with `oneOf`.
     * 
     * One change from Elm is our removal of `map2`, `map3`, etc. Use {@link combine}
     * to merge multiple arguments before calling `map`. For example:
     * 
     *     // an example with an object/fields
     *     type Point3D = {x: number, y: number, z: number}
     *     const point3d: Decoder<Point3D> = combine({
     *       x: number.field('x'),
     *       y: number.field('y'),
     *       z: number.field('z'),
     *     })
     *     const sum: Decoder<number> = point3d.map(({x, y, z}) => x + y + z)
     * 
     *     // an example with a tuple/array
     *     type Point3D = [number, number, number]
     *     const point3d: Decoder<Point3D> = combine([
     *       number.index(0),
     *       number.index(1),
     *       number.field(2),
     *     ])
     *     const sum: Decoder<number> = point3d.map(([x, y, z]) => x + y + z)
     */
    map<V>(fn: (t: T) => V): Decoder<V> {
        const d = this
        return new Decoder((v) => {
            const resA = d.decoderFn(v)
            return resA.success
                ? R.ok(fn(resA.value))
                : resA
        })
    }

    /**
     * Create decoders that depend on previous results. If you are creating versioned data, you might do something like this:
     *     
     *     const info: Decoder<Info> = field("version", number).andThen(infoHelp)
     *     
     *     function infoHelp(version: number): Decoder<Info> {
     *       switch(version) {
     *         case 4: return infoDecoder4
     *         case 3: return infoDecoder3
     *         default: return fail(`Trying to decode info, but version ${version} is not supported.`)
     *       }
     *     }
     *     
     *     // const infoDecoder4: Decoder<Info>
     *     // const infoDecoder3: Decoder<Info>
     * 
     * @param fn The function to run on the previous decoder's results. Returns another decoder, to run on the same JSON.
     */
    andThen<V>(fn: (t: T) => Decoder<V>): Decoder<V> {
        const d = this
        return new Decoder((v) => {
            const resA = d.decoderFn(v)
            return resA.success
                ? fn(resA.value).decoderFn(v)
                : resA
        })
    }

    /**
     * Merge two decoders as a union type.
     * 
     *     string.union(boolean).decodeString("true") // true: string | boolean
     *     string.union(boolean).decodeString("42") // throws ParseError
     *     string.union(boolean).decodeString("3.14") // throws ParseError
     *     string.union(boolean).decodeString("\"hello\"") // "hello": string | boolean
     *     string.union(boolean).decodeString("{ \"hello\": 42}") // throws ParseError
     *     string.union(boolean).decodeString("null") // throws ParseError
     */
    union<V>(b: Decoder<V>): Decoder<T | V> {
        const a = this
        return new Decoder(function union(v): DecodeResult<T | V> {
            const ar = a.decoderFn(v)
            if (ar.success) {
                return ar
            }
            const br = b.decoderFn(v)
            if (br.success) {
                return br
            }
            return error.oneOf([ar.error, br.error])
        })
    }

    /**
     * A decoder whose type can also include null.
     * 
     * `d.nullable()` is equivalent to `union(null_)`.
     * 
     *     string.nullable().decodeString("true") // throws ParseError
     *     string.nullable().decodeString("42") // throws ParseError
     *     string.nullable().decodeString("3.14") // throws ParseError
     *     string.nullable().decodeString("\"hello\"") // "hello": string | null
     *     string.nullable().decodeString("{ \"hello\": 42}") // throws ParseError
     *     string.nullable().decodeString("null") // null: string | null
     * 
     * See also the {@link nullable} function (this is the `nullable` method)
     */
    nullable(): Decoder<T | null> {
        return this.union(null_)
    }

    /**
     * Helpful for dealing with optional fields. Here are a few slightly different examples:
     * 
     *     number.maybe().decodeString(42) // 42
     *     number.maybe().decodeString("oof") // null
     * 
     *     json = """{ "name": "tom", "age": 42 }"""
     *     
     *     number.field("age").maybe().decodeString(json) // 42
     *     number.field("name").maybe().decodeString(json) // null
     *     number.field("height").maybe().decodeString(json) // null
     *     
     *     number.maybe().field("age").decodeString(json) // 42
     *     number.maybe().field("name").decodeString(json) // null
     *     number.maybe().field("height").decodeString(json) // throws ParseError
     * 
     * Notice the last example! It is saying we must have a field named height and the content may be a float. There is no height field, so the decoder fails.
     * 
     * Point is, maybe will make exactly what it contains conditional. For optional fields, this means you probably want it outside a use of field or at.
     * 
     * By default, `maybe` returns null instead of errors. You can also have it return some other value:
     * 
     *     number.maybe(-1).decodeString(42) // 42
     *     number.maybe(-1).decodeString("oof") // -1
     */
    maybe(): Decoder<T | null>
    maybe<D>(default_: D): Decoder<T | D>
    maybe(default_?: any): Decoder<T | any> {
        return default_ === undefined ? maybe(this) : maybe(this, default_)
    }

    /**
     * Decode a JSON array into a Typescript array.
     * 
     *     number.array().decodeString("[1,2,3]") // [1,2,3]
     *     boolean.array().decodeString("[true,false])" // [true, false]
     * 
     * @param d The decoder used to decode each array element
     */
    array(): Decoder<T[]> {
        const this_ = this
        return new Decoder(function array(v) {
            if (Array.isArray(v)) {
                const items: DecodeResult<T>[] = v.map(this_.decoderFn)
                const [errs, oks] = items.reduce(([errs, oks]: [[number, DecodeError][], T[]], res: DecodeResult<T>, index: number): [[number, DecodeError][], T[]] => {
                    if (res.success) {
                        oks.push(res.value)
                    }
                    else {
                        errs.push([index, res.error])
                    }
                    return [errs, oks]
                }, [[], []])
                if (errs.length) {
                    const [index, e] = errs[0]
                    return error.index(index, e)
                }
                return R.ok(oks)
            }
            else {
                return error.expecting('an ARRAY', v)
            }
        })
    }

    /**
     * Decode a JSON object into a Typescript list of pairs.
     * 
     *     number.keyValuePairs().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // [["alice", 42], ["bob", 99]]
     */
    keyValuePairs(): Decoder<[string, T][]> {
        const d = this
        return new Decoder(function keyValuePairs(v) {
            if (typeof v === 'object' && v !== null) {
                const items: [string, DecodeResult<T>][] = Object.entries(v).map(([k, c]) => [k, d.decoderFn(c)])
                const [errs, oks] = items.reduce(([errs, oks]: [[string, DecodeError][], [string, T][]], [key, res]: [string, DecodeResult<T>]): [[string, DecodeError][], [string, T][]] => {
                    if (res.success) {
                        oks.push([key, res.value])
                    }
                    else {
                        errs.push([key, res.error])
                    }
                    return [errs, oks]
                }, [[], []])
                if (errs.length) {
                    const [key, e] = errs[0]
                    return error.field(key, e)
                }
                return R.ok(oks)
            }
            return error.expecting('an OBJECT', v)
        })
    }

    /**
     * Decode a JSON object into a Typescript dictionary.
     * 
     *     number.dict().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // {"alice": 42, "bob": 99}
     * 
     * @param d The decoder used to decode each object value
     * 
     * See also the {@link dict} function (this is the `dict` method)
     */
    dict(): Decoder<{ [k: string]: T }> {
        const d = this
        return new Decoder(function dict(v) {
            const entries = d.keyValuePairs().decoderFn(v)
            return entries.success ? R.ok(Object.fromEntries(entries.value)) : entries
        })
    }

    /**
     * Decode a JSON object, requiring a particular field.
     * 
     *     number.field("x").decodeString("{ \"x\": 3 }") // 3
     *     number.field("x").decodeString("{ \"x\": 3, \"y\": 4 }") // 3
     *     number.field("x").decodeString("{ \"x\": true }") // throws ParseError
     *     number.field("x").decodeString("{ \"y\": 4 }") // throws ParseError
     *     
     *     string.field("name").decodeString("{ \"name\": \"tom\" }") // "tom"
     * 
     * The object can have other fields. Lots of them! The only thing this decoder cares about is if `x` is present and that the value there is a `number`.
     * 
     * Check out `map` to see how to decode multiple fields!
     * 
     * @param key The field to be looked up
     */
    field(key: string): Decoder<T> {
        const d = this
        return new Decoder(function field(v) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                if (key in v) {
                    const res = d.decoderFn(v[key])
                    if (!res.success) {
                        res.error.path = [key, ...res.error.path]
                    }
                    return res
                }
                return error.missing(key, v)
            }
            return error.expecting('an OBJECT', v)
        })
    }

    /**
     * Decode a JSON array, requiring a particular array index.
     *     
     *     const json = `[ "alice", "bob", "chuck" ]`
     *     
     *     string.index(0).decodeString(json) // "alice"
     *     string.index(1).decodeString(json) // "bob"
     *     string.index(2).decodeString(json) // "chuck"
     *     string.index(3).decodeString(json) // throws ParseError
     * 
     * @param key The array index to be looked up
     */
    index(i: number): Decoder<T> {
        const d = this
        return new Decoder(function index(v) {
            if (Array.isArray(v)) {
                if (i in v) {
                    const res = d.decoderFn(v[i])
                    if (!res.success) {
                        res.error.path = [i, ...res.error.path]
                    }
                    return res
                }
                return error.missing(i, v)
            }
            return error.expecting('an ARRAY', v)
        })
    }

    /**
     * Decode a JSON object, requiring a particular field or array index.
     * 
     * Combines `field()` and `index()`.
     * 
     * @param key The object key or array index to be looked up
     */
    get(key: number | string): Decoder<T> {
        if (typeof key === "number") {
            return this.index(key)
        }
        return this.field(key)
    }

    /**
     * Decode a nested JSON object, requiring certain fields.
     *     
     *     const json = `{ "person": { "name": "tom", "age": 42 } }`
     *     
     *     string.at(["person", "name"]).decodeString(json) // "tom"
     *     number.at(["person", "age"]).decodeString(json) // 42
     * 
     * This is really just a shorthand for saying things like:
     *     
     *     string.field("name").field("person") // string.at(["person","name"])
     *     
     * @param key The array of object keys or array indexes to be looked up
     * @param d The decoder to use on each value
     * 
     * See also the {@link at} function (this is the `at` method)
     */
    at(keys: (number | string)[]): Decoder<T> {
        const d = this
        return new Decoder(function at(v) {
            // uglier than `for i of keys`, but having an index lets us easily build `error.path`
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                const res = value.get(key).decoderFn(v)
                if (res.success) {
                    v = res.value
                }
                else {
                    res.error.path = [...keys.slice(0, i), ...res.error.path]
                    return res
                }
            }
            const res = d.decoderFn(v)
            if (!res.success) {
                res.error.path = [...Array.from(keys), ...res.error.path]
            }
            return res
        })
    }
}

/**
 * Decode a JSON string into a Typescript string.
 * 
 *     string.decodeString("true") // throws ParseError
 *     string.decodeString("42") // throws ParseError
 *     string.decodeString("3.14") // throws ParseError
 *     string.decodeString("\"hello\"") // "hello": string
 *     string.decodeString("{ \"hello\": 42}") // throws ParseError
 *     string.decodeString("null") // throws ParseError
 */
export const string = new Decoder<string>(
    function string(v) {
        if (typeof v === "string") {
            return R.ok(v)
        }
        return error.expecting('a STRING', v)
    })

/**
 * Decode a JSON number into a Typescript number.
 * 
 *     number.decodeString("true") // throws ParseError
 *     number.decodeString("42") // 42: number
 *     number.decodeString("3.14") // 3.14: number
 *     number.decodeString("\"hello\"") // throws ParseError
 *     number.decodeString("{ \"hello\": 42}") // throws ParseError
 *     number.decodeString("null") // throws ParseError
 */
export const number = new Decoder<number>(
    function number(v) {
        if (typeof v === "number") {
            return R.ok(v)
        }
        return error.expecting('a NUMBER', v)
    })

/**
 * Decode a JSON number into a Typescript number, and tests for integer-ness.
 * 
 *     number.decodeString("true") // throws ParseError
 *     number.decodeString("42") // 42: number
 *     number.decodeString("3.14") // throws ParseError
 *     number.decodeString("\"hello\"") // throws ParseError
 *     number.decodeString("{ \"hello\": 42}") // throws ParseError
 *     number.decodeString("null") // throws ParseError
 */
export const integer = number.andThen((v: number) => {
    if (Number.isInteger(v)) {
        return succeed(v)
    }
    return fail(`expecting an INTEGER: ${v}`)
})

/**
 * Decode a JSON boolean into a Typescript boolean.
 * 
 *     boolean.decodeString("true") // true: boolean
 *     boolean.decodeString("42") // throws ParseError
 *     boolean.decodeString("3.14") // throws ParseError
 *     boolean.decodeString("\"hello\"") // throws ParseError
 *     boolean.decodeString("{ \"hello\": 42}") // throws ParseError
 *     boolean.decodeString("null") // throws ParseError
 */
export const boolean = new Decoder<boolean>(
    function boolean(v) {
        if (typeof v === "boolean") {
            return R.ok(v)
        }
        return error.expecting('a BOOLEAN', v)
    })

/**
 * Decode a JSON null into a Typescript null.
 * 
 *     null_.decodeString("true") // throws ParseError
 *     null_.decodeString("42") // throws ParseError
 *     null_.decodeString("3.14") // throws ParseError
 *     null_.decodeString("\"hello\"") // throws ParseError
 *     null_.decodeString("{ \"hello\": 42}") // throws ParseError
 *     null_.decodeString("null") // null
 */
export const null_ = new Decoder<null>(
    function null_(v) {
        if (v === null) {
            return R.ok(v)
        }
        return error.expecting('a NULL', v)
    })

/**
 * Decode a JSON null into a Typescript constant value.
 * 
 *     nullAs(42).decodeString("true") // throws ParseError
 *     nullAs(42).decodeString("null") // 42
 */
export function nullAs<T>(default_: T): Decoder<T> {
    return null_.map(() => default_)
}

/**
 * Do not do anything with a JSON value, just bring it into Typescript as a
 * Value. This can be useful if you have particularly complex data that you
 * would like to deal with later, or if you do not care about its structure.
 */
export const value = new Decoder<Value>(R.ok)

/**
 * Try a bunch of different decoders.
 * 
 * This can be useful if the JSON may come in a couple different formats.
 * For example, say you want to read an array of numbers, but some of them are
 * null.
 *     
 *     const badInt: Decoder<number> = oneOf(number, nullAs(0))
 *     
 *     array(badInt).decodeString("[1,2,null,4]") // [1,2,0,4]
 * 
 * Why would someone generate JSON like this? Questions like this are not good
 * for your health. The point is that you can use oneOf to handle situations
 * like this!
 *     
 * You could also use oneOf to help version your data. Try the latest format,
 * then a few older ones that you still support. You could use {@link andThen}
 * to be even more particular if you wanted.
 */
export function oneOf<T>(head: Decoder<T>, ...tail: Decoder<T>[]): Decoder<T> {
    return new Decoder(function oneOf(v) {
        const errors = []
        for (let decoder of [head, ...tail]) {
            const res = decoder['decoderFn'](v)
            if (res.success) {
                return res
            }
            errors.push(res.error)
        }
        return error.oneOf(errors)
    })
}

function maybe<T>(decoder: Decoder<T>): Decoder<T | null>
function maybe<T, D>(decoder: Decoder<T>, default_: D): Decoder<T | D>
function maybe<T>(decoder: Decoder<T>, default_?: any): Decoder<T | any> {
    return oneOf(decoder, succeed(default_ ?? null))
}

/**
 * Ignore the JSON and produce a certain Elm value.
 * 
 *     succeed(42).decodeString("true") // 42
 *     succeed(42).decodeString("[1,2,3]") // 42
 *     succeed(42).decodeString("hello") // throws ParseError - this is not a valid JSON string
 * 
 * This is handy when used with oneOf or andThen.
 */
export function succeed<T>(value: T): Decoder<T> {
    return new Decoder(() => R.ok(value))
}

/**
 * Ignore the JSON and make the decoder fail. This is handy when used with `oneOf` or `andThen` where you want to give a custom error message in some case.
 * 
 * See {@link Decoder#andThen} for an example.
 */
export function fail<T>(message: string): Decoder<T> {
    return new Decoder((value: Value) => error.failure(message, value))
}


/**
 * Decode objects with many fields.
 * 
 * It works with fields:
 * 
 *     type Point3D = {x: number, y: number, z: number}
 *     const point3d: Decoder<Point3D> = combine({
 *       x: number.field(x),
 *       y: number.field(y),
 *       z: number.field(z),
 *     })
 *
 * or with tuples/arrays:
 * 
 *     type Point3D = [number, number, number]
 *     const point3d: Decoder<Point3D> = combine([
 *       number.index(0),
 *       number.index(1),
 *       number.index(2),
 *     ])
 * 
 * Combined fields may use a different structure than the original json:
 * 
 *     type Point3D = {x: number, y: number, z: number}
 *     const point3d: Decoder<Point3D> = combine({
 *       x: number.field(a),
 *       y: number.field(b),
 *       z: number.field(c),
 *     })
 */
export function combine<O extends { [s: string]: unknown }>(fields: DecoderFields<O>): Decoder<O>
export function combine<O extends unknown[]>(tuple: DecoderTuple<O>): Decoder<O>
// There's some very fancypants static-typing here. More info:
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
export function combine<O>(decoders: any): Decoder<any> {
    if (Array.isArray(decoders)) {
        return combineTuple(decoders)
    }
    return combineFields(decoders)
}
type DecoderTuple<T extends unknown[]> = { [P in keyof T]: Decoder<T[P]> }
type DecoderFields<T extends { [s: string]: unknown }> = { [P in keyof T]: Decoder<T[P]> }

function combineTuple<O extends unknown[]>(decoders: DecoderTuple<O>): Decoder<O> {
    return new Decoder((v) => {
        const items: DecodeResult<any>[] = decoders.map(d => d['decoderFn'](v))
        const [errs, oks] = items.reduce(([errs, oks]: [DecodeError[], any[]], res: DecodeResult<any>): [DecodeError[], any[]] => {
            if (res.success) {
                oks.push(res.value)
            }
            else {
                errs.push(res.error)
            }
            return [errs, oks]
        }, [[], []])
        if (errs.length > 0) {
            return error.oneOf(errs)
        }
        return R.ok(oks as O)
    })
}

function combineFields<O extends { [s: string]: unknown }>(fields: DecoderFields<O>): Decoder<O> {
    const pairs = Object.entries(fields)
    return new Decoder((json) => {
        const items: [string, DecodeResult<any>][] = pairs.map(([k, d]) => [k, d.decoderFn(json)])
        const [errs, oks] = items.reduce(([errs, oks]: [DecodeError[], [string, any][]], [key, res]: [string, DecodeResult<any>]): [DecodeError[], [string, any][]] => {
            if (res.success) {
                oks.push([key, res.value])
            }
            else {
                res.error.path = [key, ...res.error.path]
                errs.push(res.error)
            }
            return [errs, oks]
        }, [[], []])
        if (errs.length > 0) {
            return error.oneOf(errs)
        }
        return R.ok(Object.fromEntries(oks) as O)
    })
}

/**
 * Decode a date as milliseconds since the unix epoch.
 * 
 *     import * as Encode from './encode'
 * 
 *     const now = new Date()
 *     const encoded = Encode.date(now)
 *     date.decodeValue(encoded) === now
 */
export const date: Decoder<Date> = number.map(ms => new Date(ms))