/**
 * Represents an undecoded, non-validated JSON value.
 */
export type Value = string | number | boolean | null | Value[] | {
    [k: string]: Value;
};
/**
 * @see Value
 */
export type JSON = Value;
interface Result_<E, V> {
    ok: boolean;
    map<V2>(fn: (v: V) => V2): Result<E, V2>;
    mapError<E2>(fn: (e: E) => E2): Result<E2, V>;
    mapBoth<E2, V2>(mapError: (e: E) => E2, map: (v: V) => V2): Result<E2, V2>;
    andThen<V2>(fn: (v: V) => Result_<E, V2>): Result<E, V2>;
    failUnless(pred: (v: V) => boolean, error: E): Result<E, V>;
    withDefault(v: V): V;
}
declare class Ok<V> implements Result_<any, V> {
    value: V;
    constructor(value: V);
    get ok(): true;
    map<V2>(fn: (v: V) => V2): Ok<V2>;
    mapError(_: (e: any) => any): Ok<V>;
    mapBoth<V2>(_: (_: any) => any, fn: (v: V) => V2): Ok<V2>;
    andThen<E, V2>(fn: (v: V) => Result<E, V2>): Result<E, V2>;
    failUnless<E>(pred: (v: V) => boolean, error: E): Result<E, V>;
    withDefault(_: V): V;
}
declare class Err<E> implements Result_<E, any> {
    error: E;
    constructor(error: E);
    get ok(): false;
    map(_: (v: any) => any): Err<E>;
    mapError<E2>(fn: (e: E) => E2): Err<E2>;
    mapBoth<E2>(fn: (e: E) => E2, _: (_: any) => any): Err<E2>;
    andThen(_: (v: any) => Result<E, any>): Err<E>;
    failUnless(_: (v: any) => boolean, __: E): Err<E>;
    withDefault<V>(v: V): V;
}
type Result<E, V> = Err<E> | Ok<V>;
declare function ok<V>(value: V): Ok<V>;
type FieldError = {
    decodeError: 'field';
    path: (string | number)[];
    field: string;
    error: DecodeError;
};
type IndexError = {
    decodeError: 'index';
    path: (string | number)[];
    index: number;
    error: DecodeError;
};
type OneOfError = {
    decodeError: 'oneOf';
    path: (string | number)[];
    errors: DecodeError[];
};
type FailureError = {
    decodeError: 'failure';
    path: (string | number)[];
    message: string;
    value: Value;
};
type DecodeError = FieldError | IndexError | OneOfError | FailureError;
export type DecodeErr = Err<DecodeError>;
export type DecodeResult<V> = Result<DecodeError, V>;
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
    constructor(decoderFn: (v: Value) => DecodeResult<T>);
    /**
     * Run a `Decoder` on some JSON `Value`. If you've already run `JSON.parse`, or
     * otherwise have your JSON as an object instead of a string, use this.
     *
     *     number.decodeValue(4) // 4
     *     number.decodeValue("four") // throws ParseError
     */
    decodeValue(value: Value): T;
    /**
     * Parse the given string into a JSON value and then run the Decoder on it.
     * This will fail if the string is not well-formed JSON or if the Decoder
     * fails for some reason.
     *
     *     number.decodeString("4") // 4
     *     number.decodeString("1 + 2") // throws ParseError
     */
    decodeString(value: string): T;
    decodeResultValue(value: Value): DecodeResult<T>;
    decodeResultString(value: string): DecodeResult<T>;
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
    map<V>(fn: (t: T) => V): Decoder<V>;
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
    andThen<V>(fn: (t: T) => Decoder<V>): Decoder<V>;
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
    union<V>(b: Decoder<V>): Decoder<T | V>;
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
    nullable(): Decoder<T | null>;
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
    maybe(): Decoder<T | null>;
    maybe<D>(default_: D): Decoder<T | D>;
    /**
     * Decode a JSON array into a Typescript array.
     *
     *     number.array().decodeString("[1,2,3]") // [1,2,3]
     *     boolean.array().decodeString("[true,false])" // [true, false]
     *
     * @param d The decoder used to decode each array element
     */
    array(): Decoder<T[]>;
    /**
     * Decode a JSON object into a Typescript list of pairs.
     *
     *     number.keyValuePairs().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // [["alice", 42], ["bob", 99]]
     */
    keyValuePairs(): Decoder<[string, T][]>;
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
    dict(): Decoder<{
        [k: string]: T;
    }>;
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
    field(key: string): Decoder<T>;
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
    index(i: number): Decoder<T>;
    /**
     * Decode a JSON object, requiring a particular field or array index.
     *
     * Combines `field()` and `index()`.
     *
     * @param key The object key or array index to be looked up
     */
    get(key: number | string): Decoder<T>;
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
    at(keys: (number | string)[]): Decoder<T>;
    failUnless(pred: (v: T) => boolean, message: string): Decoder<T>;
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
export const string: Decoder<string>;
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
export const number: Decoder<number>;
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
export const boolean: Decoder<boolean>;
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
export const null_: Decoder<null>;
/**
 * Decode a JSON null into a Typescript constant value.
 *
 *     nullAs(42).decodeString("true") // throws ParseError
 *     nullAs(42).decodeString("null") // 42
 */
export function nullAs<T>(default_: T): Decoder<T>;
/**
 * Do not do anything with a JSON value, just bring it into Typescript as a
 * Value. This can be useful if you have particularly complex data that you
 * would like to deal with later, or if you do not care about its structure.
 */
export const value: Decoder<Value>;
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
export function oneOf<T>(head: Decoder<T>, ...tail: Decoder<T>[]): Decoder<T>;
/**
 * Ignore the JSON and produce a certain Elm value.
 *
 *     succeed(42).decodeString("true") // 42
 *     succeed(42).decodeString("[1,2,3]") // 42
 *     succeed(42).decodeString("hello") // throws ParseError - this is not a valid JSON string
 *
 * This is handy when used with oneOf or andThen.
 */
export function succeed<T>(value: T): Decoder<T>;
/**
 * Ignore the JSON and make the decoder fail. This is handy when used with `oneOf` or `andThen` where you want to give a custom error message in some case.
 *
 * See {@link Decoder#andThen} for an example.
 */
export function fail<T>(message: string): Decoder<T>;
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
export function combine<O extends {
    [s: string]: unknown;
}>(fields: DecoderFields<O>): Decoder<O>;
export function combine<O extends unknown[]>(tuple: DecoderTuple<O>): Decoder<O>;
type DecoderTuple<T extends unknown[]> = {
    [P in keyof T]: Decoder<T[P]>;
};
type DecoderFields<T extends {
    [s: string]: unknown;
}> = {
    [P in keyof T]: Decoder<T[P]>;
};
/**
 * Decode a date as milliseconds since the unix epoch.
 *
 *     import * as Encode from './encode'
 *
 *     const now = new Date()
 *     const encoded = Encode.dateEpoch(now)
 *     dateEpoch.decodeValue(encoded) === now
 */
export const dateEpoch: Decoder<Date>;
/**
 * Decode a date as an ISO-formatted string.
 *
 *     import * as Encode from './encode'
 *
 *     const now = new Date()
 *     const encoded = Encode.dateISOString(now)
 *     dateISOString.decodeValue(encoded) === now
 */
export const dateISOString: Decoder<Date>;
export const Encode: typeof E;

//# sourceMappingURL=types.d.ts.map
