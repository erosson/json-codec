/**
 * Turn JSON values into typed, validated Typescript values.
 * 
 * Based on Elm's `Json.Decode` library. Documentation text is almost entirely stolen from there.
 * 
 * Definitely check out the Elm to JSON decoders to get a feel for how this library works!
 * https://guide.elm-lang.org/effects/json.html
 */
import { Value } from './json'
export { Value, JSON } from './json'

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
        return err({ decodeError: 'field', path: [], field, error })
    },
    index(index: number, error: DecodeError): DecodeErr {
        return err({ decodeError: 'index', path: [], index, error })
    },
    oneOf(errors: DecodeError[]): DecodeErr {
        return err({ decodeError: 'oneOf', path: [], errors })
    },
    failure(message: string, value: Value): DecodeErr {
        return err({ decodeError: 'failure', path: [], message, value })
    },
    expecting(type_: string, value: Value): DecodeErr {
        return err({ decodeError: 'failure', path: [], message: `Expecting ${type_}`, value })
    },
    missing(key: string | number, value: Value): DecodeErr {
        return err({ decodeError: 'failure', path: [], message: `Missing key: ${JSON.stringify(key)}`, value })
    },
}

type Err<E> = { success: false, error: E }
type Ok<V> = { success: true, value: V }
type Result<E, V> = Err<E> | Ok<V>

type DecodeErr = Err<DecodeError>
type DecodeResult<V> = Result<DecodeError, V>

function ok<V>(value: V): Ok<V> {
    return { success: true, value }
}
function err(error: DecodeError): DecodeErr {
    return { success: false, error }
}

/**
 * A value that knows how to decode JSON values.
 * 
 * Based on Elm's JSON decoders:
 * https://package.elm-lang.org/packages/elm/json/latest/Json.Decode
 */
export class Decoder<T> {
    constructor(public decoderFn: (v: Value) => DecodeResult<T>) { }

    /**
     * Run a `Decoder` on some JSON `Value`. If you've already run `JSON.parse`, or
     * otherwise have your JSON as an object instead of a string, use this.
     * 
     *     decodeValue(number, 4) // 4
     *     decodeValue(number, "four") // throws ParseError
     * 
     * See also the {@link decodeValue} function (this is the `decodeValue` method)
     */
    decodeValue(value: Value): T {
        return decodeValue(this, value)
    }

    /**
     * Parse the given string into a JSON value and then run the Decoder on it.
     * This will fail if the string is not well-formed JSON or if the Decoder
     * fails for some reason.
     * 
     *     decodeString(number, "4") // 4
     *     decodeString(number, "1 + 2") // throws ParseError
     */
    decodeString(value: string): T {
        return decodeString(this, value)
    }

    /**
     * Transform a decoder. Maybe you just want to know the length of a string:
     *     
     *     const stringLength: Decoder<number> = string.map((s: string): number => s.length)
     * 
     * See also the {@link map} function (this is the `map` method)
     */
    map<V>(fn: (t: T) => V): Decoder<V> {
        return map(fn, this)
    }

    /**
     * Create decoders that depend on previous results.
     * 
     * See also the {@link andThen} function (this is the `andThen` method)
     */
    andThen<V>(fn: (t: T) => Decoder<V>): Decoder<V> {
        return andThen(fn, this)
    }

    /**
     * Merge two decoders as a union type.
     * 
     *     decodeString(string.union(boolean), "true") // true: string | boolean
     *     decodeString(string.union(boolean), "42") // throws ParseError
     *     decodeString(string.union(boolean), "3.14") // throws ParseError
     *     decodeString(string.union(boolean), "\"hello\"") // "hello": string | boolean
     *     decodeString(string.union(boolean), "{ \"hello\": 42}") // throws ParseError
     *     decodeString(string.union(boolean), "null") // throws ParseError
     * 
     * See also the {@link union} function (this is the `union` method)
     */
    union<V>(that: Decoder<V>): Decoder<T | V> {
        return union(this, that)
    }

    /**
     * A decoder whose type can also include null.
     * 
     * `d.nullable()` is equivalent to `union(null_)`.
     * 
     *     decodeString(string.nullable(), "true") // throws ParseError
     *     decodeString(string.nullable(), "42") // throws ParseError
     *     decodeString(string.nullable(), "3.14") // throws ParseError
     *     decodeString(string.nullable(), "\"hello\"") // "hello": string | null
     *     decodeString(string.nullable(), "{ \"hello\": 42}") // throws ParseError
     *     decodeString(string.nullable(), "null") // null: string | null
     * 
     * See also the {@link nullable} function (this is the `nullable` method)
     */
    nullable(): Decoder<T | null> {
        return nullable(this)
    }

    /**
     * Helpful for dealing with optional fields. Here are a few slightly different examples:
     * 
     *     decodeString(number.maybe(), 42) // 42
     *     decodeString(number.maybe(), "oof") // null
     * 
     *     json = """{ "name": "tom", "age": 42 }"""
     *     
     *     decodeString(number.field("age").maybe(), json) // 42
     *     decodeString(number.field("name").maybe(), json) // null
     *     decodeString(number.field("height").maybe(), json) // null
     *     
     *     decodeString(number.maybe().field("age"), json) // 42
     *     decodeString(number.maybe().field("name"), json) // null
     *     decodeString(number.maybe().field("height"), json) // throws ParseError
     * 
     * Notice the last example! It is saying we must have a field named height and the content may be a float. There is no height field, so the decoder fails.
     * 
     * Point is, maybe will make exactly what it contains conditional. For optional fields, this means you probably want it outside a use of field or at.
     * 
     * By default, `maybe` returns null instead of errors. You can also have it return some other value:
     * 
     *     decodeString(number.maybe(-1), 42) // 42
     *     decodeString(number.maybe(-1), "oof") // -1
     * 
     * See also the {@link maybe} function (this is the `maybe` method)
     */
    maybe(): Decoder<T | null>
    maybe<D>(default_: D): Decoder<T | D>
    maybe(default_?: any): Decoder<T | any> {
        return default_ === undefined ? maybe(this) : maybe(this, default_)
    }

    /**
     * Decode a JSON array into a Typescript array.
     * 
     *     decodeString(number.array(), "[1,2,3]") // [1,2,3]
     *     decodeString(boolean.array(), "[true,false])" // [true, false]
     * 
     * @param d The decoder used to decode each array element
     * 
     * See also the {@link array} function (this is the `array` method)
     */
    array(): Decoder<T[]> {
        return array(this)
    }

    /**
     * Decode a JSON object into a Typescript list of pairs.
     * 
     *     decodeString(number.keyValuePairs(), "{ \"alice\": 42, \"bob\": 99 }")
     *     // [["alice", 42], ["bob", 99]]
     * 
     * @param d The decoder used to decode each object value
     * 
     * See also the {@link keyValuePairs} function (this is the `keyValuePairs` method)
     */
    keyValuePairs(): Decoder<[string, T][]> {
        return keyValuePairs(this)
    }

    /**
     * Decode a JSON object into a Typescript dictionary.
     * 
     *     decodeString(number.dict(), "{ \"alice\": 42, \"bob\": 99 }")
     *     // {"alice": 42, "bob": 99}
     * 
     * @param d The decoder used to decode each object value
     * 
     * See also the {@link dict} function (this is the `dict` method)
     */
    dict(): Decoder<{ [k: string]: T }> {
        return dict(this)
    }

    /**
     * Decode a JSON object, requiring a particular field.
     * 
     *     decodeString(number.field("x"), "{ \"x\": 3 }") // 3
     *     decodeString(number.field("x"), "{ \"x\": 3, \"y\": 4 }") // 3
     *     decodeString(number.field("x"), "{ \"x\": true }") // throws ParseError
     *     decodeString(number.field("x"), "{ \"y\": 4 }") // throws ParseError
     *     
     *     decodeString(string.field("name"), "{ \"name\": \"tom\" }") // "tom"
     * 
     * The object can have other fields. Lots of them! The only thing this decoder cares about is if `x` is present and that the value there is a `number`.
     * 
     * Check out `map` to see how to decode multiple fields!
     * 
     * @param key The field to be looked up
     * @param d The decoder to use on the value
     * 
     * See also the {@link field} function (this is the `field` method)
     */
    field(key: string): Decoder<T> {
        return field(key, this)
    }

    /**
     * Decode a JSON array, requiring a particular array index.
     *     
     *     const json = `[ "alice", "bob", "chuck" ]`
     *     
     *     decodeString(string.index(0), json) // "alice"
     *     decodeString(string.index(1), json) // "bob"
     *     decodeString(string.index(2), json) // "chuck"
     *     decodeString(string.index(3), json) // throws ParseError
     * 
     * @param key The array index to be looked up
     * @param d The decoder to use on the value
     * 
     * See also the {@link index} function (this is the `index` method)
     */
    index(i: number): Decoder<T> {
        return index(i, this)
    }

    /**
     * Decode a JSON object, requiring a particular field or array index.
     * 
     * Combines `field()` and `index()`.
     * 
     * @param key The object key or array index to be looked up
     * @param d The decoder to use on the value
     * 
     * See also the {@link get} function (this is the `get` method)
     */
    get(key: number | string): Decoder<T> {
        return get(key, this)
    }

    /**
     * Decode a nested JSON object, requiring certain fields.
     *     
     *     const json = `{ "person": { "name": "tom", "age": 42 } }`
     *     
     *     decodeString(string.at(["person", "name"]), json) // "tom"
     *     decodeString(number.at(["person", "age"]), json) // 42
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
        return at(keys, this)
    }
}

/**
 * Decode a JSON string into a Typescript string.
 * 
 *     decodeString(string, "true") // throws ParseError
 *     decodeString(string, "42") // throws ParseError
 *     decodeString(string, "3.14") // throws ParseError
 *     decodeString(string, "\"hello\"") // "hello": string
 *     decodeString(string, "{ \"hello\": 42}") // throws ParseError
 *     decodeString(string, "null") // throws ParseError
 */
export const string = new Decoder<string>(
    function string(v) {
        if (typeof v === "string") {
            return ok(v)
        }
        return error.expecting('a STRING', v)
    })

/**
 * Decode a JSON number into a Typescript number.
 * 
 *     decodeString(number, "true") // throws ParseError
 *     decodeString(number, "42") // 42: number
 *     decodeString(number, "3.14") // 3.14: number
 *     decodeString(number, "\"hello\"") // throws ParseError
 *     decodeString(number, "{ \"hello\": 42}") // throws ParseError
 *     decodeString(number, "null") // throws ParseError
 */
export const number = new Decoder<number>(
    function number(v) {
        if (typeof v === "number") {
            return ok(v)
        }
        return error.expecting('a NUMBER', v)
    })

/**
 * Decode a JSON boolean into a Typescript boolean.
 * 
 *     decodeString(boolean, "true") // true: boolean
 *     decodeString(boolean, "42") // throws ParseError
 *     decodeString(boolean, "3.14") // throws ParseError
 *     decodeString(boolean, "\"hello\"") // throws ParseError
 *     decodeString(boolean, "{ \"hello\": 42}") // throws ParseError
 *     decodeString(boolean, "null") // throws ParseError
 */
export const boolean = new Decoder<boolean>(
    function boolean(v) {
        if (typeof v === "boolean") {
            return ok(v)
        }
        return error.expecting('a BOOLEAN', v)
    })

/**
 * Decode a JSON null into a Typescript null.
 * 
 *     decodeString(null_, "true") // throws ParseError
 *     decodeString(null_, "42") // throws ParseError
 *     decodeString(null_, "3.14") // throws ParseError
 *     decodeString(null_, "\"hello\"") // throws ParseError
 *     decodeString(null_, "{ \"hello\": 42}") // throws ParseError
 *     decodeString(null_, "null") // null
 */
export const null_ = new Decoder<null>(
    function null_(v) {
        if (v === null) {
            return ok(v)
        }
        return error.expecting('a NULL', v)
    })

/**
 * Decode a JSON null into a Typescript constant value.
 * 
 *     decodeString(nullAs(42), "true") // throws ParseError
 *     decodeString(nullAs(42), "null") // 42
 */
export function nullAs<T>(default_: T): Decoder<T> {
    return null_.map(() => default_)
}

/**
 * Do not do anything with a JSON value, just bring it into Typescript as a
 * Value. This can be useful if you have particularly complex data that you
 * would like to deal with later, or if you do not care about its structure.
 */
export const value = new Decoder<Value>(
    function value(v) {
        return ok(v)
    })

/**
 * Merge two decoders as a union type.
 * 
 *     decodeString(union(string, boolean), "true") // true: string | boolean
 *     decodeString(union(string, boolean), "42") // throws ParseError
 *     decodeString(union(string, boolean), "3.14") // throws ParseError
 *     decodeString(union(string, boolean), "\"hello\"") // "hello": string | boolean
 *     decodeString(union(string, boolean), "{ \"hello\": 42}") // throws ParseError
 *     decodeString(union(string, boolean), "null") // throws ParseError
 */
export function union<A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<A | B> {
    return new Decoder(function union(v): DecodeResult<A | B> {
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
 * `nullable(d)` is equivalent to `union(null_, d)`.
 * 
 *     decodeString(nullable(string), "true") // throws ParseError
 *     decodeString(nullable(string), "42") // throws ParseError
 *     decodeString(nullable(string), "3.14") // throws ParseError
 *     decodeString(nullable(string), "\"hello\"") // "hello": string | null
 *     decodeString(nullable(string), "{ \"hello\": 42}") // throws ParseError
 *     decodeString(nullable(string), "null") // null: string | null
 */
export function nullable<T>(d: Decoder<T>): Decoder<T | null> {
    return union(d, null_)
}

/**
 * Decode a JSON array into a Typescript array.
 * 
 *     decodeString(array(number), "[1,2,3]") // [1,2,3]
 *     decodeString(array(boolean), "[true,false])" // [true, false]
 * 
 * @param d The decoder used to decode each array element
 */
export function array<T>(d: Decoder<T>): Decoder<T[]> {
    return new Decoder(function array(v) {
        if (Array.isArray(v)) {
            const items: DecodeResult<T>[] = v.map(d.decoderFn)
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
            return ok(oks)
        }
        else {
            return error.expecting('an ARRAY', v)
        }
    })
}

/**
 * Decode a JSON object into a Typescript list of pairs.
 * 
 *     decodeString(keyValuePairs(number), "{ \"alice\": 42, \"bob\": 99 }")
 *     // [["alice", 42], ["bob", 99]]
 * 
 * @param d The decoder used to decode each object value
 */
export function keyValuePairs<T>(d: Decoder<T>): Decoder<[string, T][]> {
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
            return ok(oks)
        }
        return error.expecting('an OBJECT', v)
    })
}

/**
 * Decode a JSON object into a Typescript dictionary.
 * 
 *     decodeString(dict(number), "{ \"alice\": 42, \"bob\": 99 }")
 *     // {"alice": 42, "bob": 99}
 * 
 * @param d The decoder used to decode each object value
 */
export function dict<T>(d: Decoder<T>): Decoder<{ [k: string]: T }> {
    return new Decoder(function dict(v) {
        const entries = keyValuePairs(d).decoderFn(v)
        return entries.success ? ok(Object.fromEntries(entries.value)) : entries
    })
}

/**
 * Decode a JSON object, requiring a particular field.
 * 
 *     decodeString(field("x", number), "{ \"x\": 3 }") // 3
 *     decodeString(field("x", number), "{ \"x\": 3, \"y\": 4 }") // 3
 *     decodeString(field("x", number), "{ \"x\": true }") // throws ParseError
 *     decodeString(field("x", number), "{ \"y\": 4 }") // throws ParseError
 *     
 *     decodeString(field("name", string), "{ \"name\": \"tom\" }") // "tom"
 * 
 * The object can have other fields. Lots of them! The only thing this decoder cares about is if `x` is present and that the value there is a `number`.
 * 
 * Check out `map` to see how to decode multiple fields!
 * 
 * @param key The field to be looked up
 * @param d The decoder to use on the value
 */
export function field<T>(key: string, d: Decoder<T>): Decoder<T> {
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
 *     decodeString(index(0, string), json) // "alice"
 *     decodeString(index(1, string), json) // "bob"
 *     decodeString(index(2, string), json) // "chuck"
 *     decodeString(index(3, string), json) // throws ParseError
 * 
 * @param key The array index to be looked up
 * @param d The decoder to use on the value
 */
export function index<T>(i: number, d: Decoder<T>): Decoder<T> {
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
 * @param d The decoder to use on the value
 */
export function get<T>(key: number | string, d: Decoder<T>): Decoder<T> {
    if (typeof key === "number") {
        return index(key, d)
    }
    return field(key, d)
}

/**
 * Decode a nested JSON object, requiring certain fields.
 *     
 *     const json = `{ "person": { "name": "tom", "age": 42 } }`
 *     
 *     decodeString(at(["person", "name"], string), json) // "tom"
 *     decodeString(at(["person", "age"], number), json) // 42
 * 
 * This is really just a shorthand for saying things like:
 *     
 *     field("person", field("name", string)) // at(["person","name"], string)
 *     
 * @param key The array of object keys or array indexes to be looked up
 * @param d The decoder to use on each value
 */
export function at<T>(keys: (number | string)[], d: Decoder<T>): Decoder<T> {
    return new Decoder(function at(v) {
        // uglier than `for i of keys`, but having an index lets us easily build `error.path`
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const res = get(key, value).decoderFn(v)
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

/**
 * Try a bunch of different decoders.
 * 
 * This can be useful if the JSON may come in a couple different formats.
 * For example, say you want to read an array of numbers, but some of them are
 * null.
 *     
 *     const badInt: Decoder<number> = oneOf(number, nullAs(0))
 *     
 *     decodeString(array(badInt), "[1,2,null,4]") // [1,2,0,4]
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
            const res = decoder.decoderFn(v)
            if (res.success) {
                return res
            }
            errors.push(res.error)
        }
        return error.oneOf(errors)
    })
}

/**
 * Helpful for dealing with optional fields. Here are a few slightly different examples:
 * 
 *     decodeString(maybe(number), 42) // 42
 *     decodeString(maybe(number), "oof") // null
 * 
 *     json = """{ "name": "tom", "age": 42 }"""
 *     
 *     decodeString(maybe(field("age", number)), json) // 42
 *     decodeString(maybe(field("name", number)), json) // null
 *     decodeString(maybe(field("height", number)), json) // null
 *     
 *     decodeString(field("age", maybe(number)), json) // 42
 *     decodeString(field("name", maybe(number)), json) // null
 *     decodeString(field("height", maybe(number)), json) // throws ParseError
 * 
 * Notice the last example! It is saying we must have a field named height and the content may be a float. There is no height field, so the decoder fails.
 * 
 * Point is, maybe will make exactly what it contains conditional. For optional fields, this means you probably want it outside a use of field or at.
 * 
 * By default, `maybe` returns null instead of errors. You can also have it return some other value:
 * 
 *     decodeString(maybe(number, -1), 42) // 42
 *     decodeString(maybe(number, -1), "oof") // -1
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null>
export function maybe<T, D>(decoder: Decoder<T>, default_: D): Decoder<T | D>
export function maybe<T>(decoder: Decoder<T>, default_?: any): Decoder<T | any> {
    return oneOf(decoder, succeed(default_ ?? null))
}

/**
 * Run a `Decoder` on some JSON `Value`. If you've already run `JSON.parse`, or
 * otherwise have your JSON as an object instead of a string, use this.
 * 
 *     decodeValue(number, 4) // 4
 *     decodeValue(number, "four") // throws ParseError
 */
export function decodeValue<T>(decoder: Decoder<T>, value: Value): T {
    const res = decodeResultValue(decoder, value)
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
 *     decodeString(number, "4") // 4
 *     decodeString(number, "1 + 2") // throws ParseError
 */
export function decodeString<T>(decoder: Decoder<T>, value: string): T {
    return decodeValue(decoder, JSON.parse(value))
}

// TODO not yet exported. do we want to expose our internal Result types?
function decodeResultValue<T>(decoder: Decoder<T>, value: Value): DecodeResult<T> {
    return decoder.decoderFn(value)
}

// TODO not yet exported. do we want to expose our internal Result types?
function decodeResultString<T>(decoder: Decoder<T>, value: string): DecodeResult<T> {
    return decodeResultValue(decoder, JSON.parse(value))
}

/**
 * Ignore the JSON and produce a certain Elm value.
 * 
 *     decodeString(succeed(42), "true") // 42
 *     decodeString(succeed(42), "[1,2,3]") // 42
 *     decodeString(succeed(42), "hello") // throws ParseError - this is not a valid JSON string
 * 
 * This is handy when used with oneOf or andThen.
 */
export function succeed<T>(value: T): Decoder<T> {
    return new Decoder(() => ok(value))
}

/**
 * Ignore the JSON and make the decoder fail. This is handy when used with `oneOf` or `andThen` where you want to give a custom error message in some case.
 * 
 * See {@link andThen} for an example.
 */
export function fail<T>(message: string): Decoder<T> {
    return new Decoder((value: Value) => error.failure(message, value))
}

/**
 * Transform a decoder. Maybe you just want to know the length of a string:
 *     
 *     const stringLength: Decoder<number> = map((s: string): number => s.length, string)
 * 
 * It is often helpful to use `map` with `oneOf`.
 * 
 * We can use the multi-arg version to decode objects with many fields:
 * 
 *     map((x, y) => new Point2D(x, y),
 *       field("x", number),
 *       field("y", number),
 *     )
 *     map((x, y, z) => new Point3D(x, y, z),
 *       field("x", number),
 *       field("y", number),
 *       field("z", number),
 *     )
 * 
 * TODO: can we make this variadic, and go beyond 10 fields, while keeping type-safety?
 * 
 * TODO: the syntax below would be super nice, but isn't implemented yet. Possible? How to implement it?
 * 
 *     map(props: {a: Decoder<A>, b: Decoder<B>}) => Decoder<{a: A, b: B}>
 */
// export function map<O, I extends unknown[]>(fn: (...ins: I) => O, ...decoders: Decoder<I>[]): Decoder<O>
export function map<A, T>(fn: (a: A) => T, da: Decoder<A>): Decoder<T>
export function map<A, B, T>(fn: (a: A, b: B) => T, da: Decoder<A>, db: Decoder<B>): Decoder<T>
export function map<A, B, C, T>(fn: (a: A, b: B, c: C) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>): Decoder<T>
export function map<A, B, C, D, T>(fn: (a: A, b: B, c: C, d: D) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>): Decoder<T>
export function map<A, B, C, D, E, T>(fn: (a: A, b: B, c: C, d: D, e: E) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>): Decoder<T>
export function map<A, B, C, D, E, F, T>(fn: (a: A, b: B, c: C, d: D, e: E, f: F) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>, df: Decoder<F>): Decoder<T>
export function map<A, B, C, D, E, F, G, T>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>, df: Decoder<F>, dg: Decoder<G>): Decoder<T>
export function map<A, B, C, D, E, F, G, H, T>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>, df: Decoder<F>, dg: Decoder<G>, dh: Decoder<H>): Decoder<T>
export function map<A, B, C, D, E, F, G, H, I, T>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>, df: Decoder<F>, dg: Decoder<G>, dh: Decoder<H>, di: Decoder<I>): Decoder<T>
export function map<A, B, C, D, E, F, G, H, I, J, T>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => T, da: Decoder<A>, db: Decoder<B>, dc: Decoder<C>, dd: Decoder<D>, de: Decoder<E>, df: Decoder<F>, dg: Decoder<G>, dh: Decoder<H>, di: Decoder<I>, dj: Decoder<J>): Decoder<T>
export function map(fn: (...args: any[]) => any, ...decoders: Decoder<any>[]): Decoder<any> {
    return new Decoder((v) => {
        const items: DecodeResult<any>[] = decoders.map(d => d.decoderFn(v))
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
        return ok(fn(...oks))
    })
}

/**
 * Create decoders that depend on previous results. If you are creating versioned data, you might do something like this:
 *     
 *     const info: Decoder<Info> = andThen(field("version", number), infoHelp)
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
 * @param decoder The first decoder to run on the JSON.
 */
export function andThen<A, B>(fn: (a: A) => Decoder<B>, decoder: Decoder<A>): Decoder<B> {
    return new Decoder((v) => {
        const resA = decoder.decoderFn(v)
        return resA.success
            ? fn(resA.value).decoderFn(v)
            : resA
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