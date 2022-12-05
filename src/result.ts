interface Result_<E, V> {
    ok: boolean
    map<V2>(fn: (v: V) => V2): Result<E, V2>
    mapError<E2>(fn: (e: E) => E2): Result<E2, V>
    mapBoth<E2, V2>(mapError: (e: E) => E2, map: (v: V) => V2): Result<E2, V2>
    andThen<V2>(fn: (v: V) => Result_<E, V2>): Result<E, V2>
    failUnless(pred: (v: V) => boolean, error: E): Result<E, V>
    withDefault(v: V): V
}

export class Ok<V> implements Result_<any, V> {
    constructor(public value: V) { }

    get ok(): true {
        return true
    }
    map<V2>(fn: (v: V) => V2): Ok<V2> {
        return ok(fn(this.value))
    }
    mapError(_: (e: any) => any): Ok<V> {
        return this
    }
    mapBoth<V2>(_: (_: any) => any, fn: (v: V) => V2): Ok<V2> {
        return this.map(fn)
    }
    andThen<E, V2>(fn: (v: V) => Result<E, V2>): Result<E, V2> {
        return fn(this.value)
    }
    failUnless<E>(pred: (v: V) => boolean, error: E): Result<E, V> {
        return pred(this.value) ? this : err(error)
    }
    withDefault(_: V): V {
        return this.value
    }
}

export class Err<E> implements Result_<E, any> {
    constructor(public error: E) { }

    get ok(): false {
        return false
    }
    map(_: (v: any) => any): Err<E> {
        return this
    }
    mapError<E2>(fn: (e: E) => E2): Err<E2> {
        return err(fn(this.error))
    }
    mapBoth<E2>(fn: (e: E) => E2, _: (_: any) => any): Err<E2> {
        return this.mapError(fn)
    }
    andThen(_: (v: any) => Result<E, any>): Err<E> {
        return this
    }
    failUnless(_: (v: any) => boolean, __: E): Err<E> {
        return this
    }
    withDefault<V>(v: V): V {
        return v
    }
}

export type Result<E, V> = Err<E> | Ok<V>

export function ok<V>(value: V): Ok<V> {
    return new Ok(value)
}
export function err<E>(error: E): Err<E> {
    return new Err(error)
}