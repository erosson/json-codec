/**
 * Turn Typescript values into JSON values.
 * 
 * `JSON.stringify` does most of this for us in Typescript, so this module is
 * much smaller than the Elm equivalent.
 */
import { Value } from './json'

/**
 * Decode a date as milliseconds since the unix epoch.
 * 
 *     import * as Encode from './encode'
 * 
 *     const now = new Date()
 *     const encoded = Encode.date(now)
 *     date.decodeValue(encoded) === now
 */
export function date(value: Date): Value {
    return value.getTime()
}