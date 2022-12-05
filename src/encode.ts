/**
 * Turn Typescript values into JSON values.
 * 
 * `JSON.stringify` does most of this for us in Typescript, so this module is
 * much smaller than the Elm equivalent.
 */
import { Value } from './json'

export type Encoder<T> = (value: T) => Value

/**
 * Encode a date as milliseconds since the unix epoch.
 * 
 *     import * as Encode from './encode'
 * 
 *     const now = new Date()
 *     const encoded = Encode.dateEpoch(now)
 *     dateEpoch.decodeValue(encoded) === now
 */
export function dateEpoch(value: Date): Value {
    return value.getTime()
}

/**
 * Encode a date as an ISO-formatted string.
 * 
 *     import * as Encode from './encode'
 * 
 *     const now = new Date()
 *     const encoded = Encode.dateISOString(now)
 *     dateISOString.decodeValue(encoded) === now
 */
export function dateISOString(value: Date): Value {
    return value.toISOString()
}