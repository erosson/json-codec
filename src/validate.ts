import * as R from './result'
import { Value } from './json'

// https://stackoverflow.com/questions/49910889/typescript-array-with-minimum-length
export type AtLeast1<T> = [T, ...T[]]

export type CodecErr = ExpectedType | OneOf | AllOf | NoSuchKey
export type ExpectedType = { codecErr: 'expectedType', expected: string }
export type OneOf = { codecErr: 'oneOf', errors: AtLeast1<CodecError> }
export type AllOf = { codecErr: 'allOf', errors: AtLeast1<CodecError> }
export type NoSuchKey = { codecErr: 'noSuchKey', key: string | number }

export type CodecTrace<E> = { value: Value, path: (string | number)[], error: E }
export type CodecError = CodecTrace<CodecErr>
export type CodecResult<V> = R.Result<CodecError, V>
// TODO validation should return a list of errors

export class Validator {
    constructor(public validate: (value: Value) => CodecError | null) { }

    result(value: Value): CodecResult<Value> {
        const error = this.validate(value)
        return error ? R.err(error) : R.ok(value)
    }

    nullable(): Validator {
        return oneOf([this, null_])
    }

    array(): Validator {
        const this_ = this
        return new Validator(value => {
            if (Array.isArray(value)) {
                const errors: [number, CodecError][] = value
                    .map((v, k) => {
                        let err = this_.validate(v)
                        return err ? [k, err] : null
                    })
                    .filter(pair => !!pair) as [number, CodecError][]
                if (errors.length) {
                    const [index, error] = errors[0]
                    console.error({ ...error, path: [index, ...error.path] })
                    return { ...error, path: [index, ...error.path] }
                }
                return null
            }
            else {
                return err({ codecErr: 'expectedType', expected: 'array' }, value)
            }
        })
    }

    field(key: string): Validator {
        const this_ = this
        return new Validator((value: Value) => {
            if (value && typeof value === 'object' && !Array.isArray(value) && key in value) {
                const err = this_.validate(value[key])
                return err ? { ...err, path: [...err.path, key] } : null
            }
            else {
                return err({ codecErr: 'noSuchKey', key }, value)
            }
        })
    }

    index(key: number): Validator {
        const this_ = this
        return new Validator((value: Value) => {
            if (Array.isArray(value) && key in value) {
                const err = this_.validate(value[key])
                return err ? { ...err, path: [...err.path, key] } : null
            }
            else {
                return err({ codecErr: 'noSuchKey', key }, value)
            }
        })
    }

    get(key: number | string): Validator {
        if (typeof key === "number") {
            return this.index(key)
        }
        return this.field(key)
    }

    at(keys: (number | string)[]): Validator {
        const this_ = this
        return new Validator((v) => {
            // validate and follow the path.
            // uglier than `for i of keys`, but having an index lets us easily build `error.path`
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                const error = always.get(key).validate(v)
                if (error) {
                    error.path = [...keys.slice(0, i), ...error.path]
                    return error
                }
                else {
                    // validator guarantees this is possible
                    v = (v as any)[key]
                }
            }
            const error = this_.validate(v)
            if (error) {
                error.path = [...Array.from(keys), ...error.path]
            }
            return error
        })
    }

}

function err(error: CodecErr, value: Value): CodecError {
    return { value, error, path: [] }
}

function isTypeof(expected: string): Validator {
    return new Validator((value: Value) => {
        return typeof value === expected ? null : err({ codecErr: 'expectedType', expected }, value)
    })
}

export const string = isTypeof('string')
export const number = isTypeof('number')
export const boolean = isTypeof('boolean')
export const null_ = failUnless(value => value === null, { codecErr: 'expectedType', expected: 'null' })
export const always = new Validator(() => null)

export function oneOf(validators: AtLeast1<Validator>): Validator {
    return new Validator((value: Value) => {
        const errors = []
        for (let validator of validators) {
            const error = validator.validate(value)
            if (!error) {
                return null
            }
            errors.push(error)
        }
        return err({ codecErr: 'oneOf', errors: errors as AtLeast1<CodecError> }, value)
    })
}

export function allOf(validators: AtLeast1<Validator>): Validator {
    return new Validator((value: Value) => {
        const errors = validators
            .map(validator => validator.validate(value))
            .filter(err => !err) as CodecError[]
        return err({ codecErr: 'allOf', errors: errors as AtLeast1<CodecError> }, value)
    })
}

export function failUnless(pred: (value: Value) => boolean, error: CodecErr) {
    return new Validator((value: Value) => {
        if (pred(value)) {
            return null
        }
        else {
            return err(error, value)
        }
    })
}

export function combine(fields: { [s: string]: Validator }, auto?: boolean): Validator
export function combine(tuple: Validator[]): Validator
export function combine(validators: any, auto: boolean = false): Validator {
    if (Array.isArray(validators)) {
        return combineTuple(validators)
    }
    return combineFields(validators, auto)
}

function combineTuple(validators: Validator[]): Validator {
    return new Validator((value) => {
        const results = validators.map(validator => validator.validate(value))
        const errors = results.filter(err => !!err) as CodecError[]
        if (errors.length > 0) {
            return err({ codecErr: 'oneOf', errors: errors as AtLeast1<CodecError> }, value)
        }
        return null
    })
}

function combineFields(fields: { [s: string]: Validator }, auto: boolean = false): Validator {
    const rawPairs = Object.entries(fields)
    const pairs = auto
        ? rawPairs.map(([k, v]): [string, Validator] => [k, v.field(k)])
        : rawPairs
    return new Validator((value) => {
        const results = pairs.map(([k, validator]) => validator.validate(value))
        const errors = results.filter(err => !!err) as CodecError[]
        if (errors.length > 0) {
            return err({ codecErr: 'oneOf', errors: errors as AtLeast1<CodecError> }, value)
        }
        return null
    })
}