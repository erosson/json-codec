export type Value
    = string
    | number
    | boolean
    | null
    | Value[]
    | { [k: string]: Value }

export type JSON = Value

type FieldError = { decodeError: 'field', path: (string | number)[], field: string, error: DecodeError }
type IndexError = { decodeError: 'index', path: (string | number)[], index: number, error: DecodeError }
type OneOfError = { decodeError: 'oneOf', path: (string | number)[], errors: DecodeError[] }
type FailureError = { decodeError: 'failure', path: (string | number)[], message: string, value: Value }
export type DecodeError
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
        return err({ decodeError: 'failure', path: [], message: `Missing key: ${key}`, value })
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

export class Decoder<T> {
    constructor(public decoderFn: (v: Value) => DecodeResult<T>) { }
}

export const string = new Decoder<string>(
    function string(v) {
        if (typeof v === "string") {
            return ok(v)
        }
        return error.expecting('a STRING', v)
    })
export const number = new Decoder<number>(
    function number(v) {
        if (typeof v === "number") {
            return ok(v)
        }
        return error.expecting('a NUMBER', v)
    })
export const boolean = new Decoder<boolean>(
    function boolean(v) {
        if (typeof v === "boolean") {
            return ok(v)
        }
        return error.expecting('a BOOLEAN', v)
    })
export const null_ = new Decoder<null>(
    function null_(v) {
        if (v === null) {
            return ok(v)
        }
        return error.expecting('a NULL', v)
    })
export const value = new Decoder<Value>(
    function value(v) {
        return ok(v)
    })

function union<A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<A | B> {
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

export function nullable<T>(d: Decoder<T>): Decoder<T | null> {
    return union(d, null_)
}

type SplitIndexedResults<E, V> = { errs: [number, E][], oks: [number, V][] }
function splitIndexedResults<E, V>(rs: Result<E, V>[]): SplitIndexedResults<E, V> {
    return rs.reduce(({ errs, oks }: SplitIndexedResults<E, V>, val: Result<E, V>, index: number): SplitIndexedResults<E, V> => {
        if (val.success) {
            oks.push([index, val.value])
        }
        else {
            errs.push([index, val.error])
        }
        return { errs, oks }
    }, { errs: [], oks: [] })
}
function splitResults<E, V>(rs: Result<E, V>[]): { errs: E[], oks: V[] } {
    const indexed = splitIndexedResults(rs)
    return { errs: indexed.errs.map(([i, v]) => v), oks: indexed.oks.map(([i, v]) => v) }
}
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
export function dict<T>(d: Decoder<T>): Decoder<{ [k: string]: T }> {
    return new Decoder(function dict(v) {
        const entries = keyValuePairs(d).decoderFn(v)
        return entries.success ? ok(Object.fromEntries(entries.value)) : entries
    })
}

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
export function get<T>(key: number | string, d: Decoder<T>): Decoder<T> {
    if (typeof key === "number") {
        return index(key, d)
    }
    return field(key, d)
}
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

export function decodeValue<T>(decoder: Decoder<T>, value: Value): T {
    const res = decoder.decoderFn(value)
    if (res.success) {
        return res.value
    }
    throw new Error(JSON.stringify(res.error, null, 2))
}
export function decodeString<T>(decoder: Decoder<T>, value: string): T {
    return decodeValue(decoder, JSON.parse(value))
}

export function succeed<T>(value: T): Decoder<T> {
    return new Decoder(() => ok(value))
}
export function fail<T>(message: string): Decoder<T> {
    return new Decoder((value: Value) => error.failure(message, value))
}