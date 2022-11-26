/**
 * Represents an undecoded, non-validated JSON value.
 * 
 * @alias JSON
 */
export type Value
    = string
    | number
    | boolean
    | null
    | Value[]
    | { [k: string]: Value }

/**
 * @alias Value
 */
export type JSON = Value