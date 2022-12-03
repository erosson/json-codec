export type Err<E> = { success: false, error: E }
export type Ok<V> = { success: true, value: V }
export type Result<E, V> = Err<E> | Ok<V>

export function ok<V>(value: V): Ok<V> {
    return { success: true, value }
}
export function err<E>(error: E): Err<E> {
    return { success: false, error }
}