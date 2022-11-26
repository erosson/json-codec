/**
 * Represents an undecoded, non-validated JSON value.
 */
export type Value
    = string
    | number
    | boolean
    | null
    | Value[]
    | { [k: string]: Value }

/**
 * @see Value
 */
export type JSON = Value