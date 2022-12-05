import * as D from './decode'
import * as E from './encode'
import * as R from './result'
import { Value } from './json'

export class Codec<T> {
    constructor(public decoder: D.Decoder<T>, public encoder: E.Encoder<T>) { }

    decodeValue(value: Value): T {
        return this.decoder.decodeValue(value)
    }
    decodeString(value: string): T {
        return this.decoder.decodeString(value)
    }
    decodeResultValue(value: Value): D.DecodeResult<T> {
        return this.decoder.decodeResultValue(value)
    }
    decodeResultString(value: string): D.DecodeResult<T> {
        return this.decoder.decodeResultString(value)
    }

    encodeUnsafeValue(value: T): Value {
        return this.encoder(value)
    }
    encodeValue(value: T): Value {
        const json = this.encodeUnsafeValue(value)
        // if we can successfully decode the thing we encoded - that is, if it
        // throws no errors - it's valid
        this.decodeValue(json)
        // TODO equality check?
        return json
    }
    encodeString(value: T): string {
        return JSON.stringify(this.encodeValue(value))
    }
    encodeResultValue(value: T): D.DecodeResult<Value> {
        const json = this.encodeUnsafeValue(value)
        // if we can successfully decode the thing we encoded - that is, if it
        // returns no errors - it's valid
        const res = this.decodeResultValue(json)
        // TODO equality check?
        return res.map(_ => json)
    }
    encodeResultString(value: T): D.DecodeResult<string> {
        return this.encodeResultValue(value).map(JSON.stringify)
    }

    union<T2>(that: Codec<T2>): Codec<T | T2> {
        return oneOf(this as Codec<T | T2>, that as Codec<T | T2>)
    }
    nullable(): Codec<T | null> {
        return this.union(null_)
    }
}

// simple types
const identity = <T>(v: T) => v
export const string = new Codec(D.string, identity)
export const boolean = new Codec(D.boolean, identity)
export const number = new Codec(D.number, identity)
export const null_ = new Codec(D.null_, identity)
export const value = new Codec(D.value, identity)
export const dateEpoch = new Codec(D.dateEpoch, E.dateEpoch)
export const dateISOString = new Codec(D.dateISOString, E.dateISOString)

export function exactly<T extends Value>(expected: T): Codec<T> {
    return new Codec(D.value.failUnless(v => v === expected, `Expected exactly ${expected}`) as D.Decoder<T>, identity)
}

export function oneOf<T>(head: Codec<T>, ...tail: Codec<T>[]): Codec<T> {
    return new Codec(
        D.oneOf(head.decoder, ...tail.map(c => c.decoder)),
        (value: T) => {
            const errors = []
            for (let codec of [head, ...tail]) {
                const res = codec.encodeResultValue(value)
                if (res.ok) {
                    return res.value
                }
                errors.push(res.error)
            }
            // TODO
            throw errors[0]
        }
    )
}