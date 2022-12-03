import * as S from 'json-schema'
import { string } from '../decode'
import * as R from '../result'

export type SchemaDefinition = { name: string, body: SchemaBody }
export type SchemaBody = SchemaSimpleType | SchemaObject | SchemaArray | SchemaRef
export type SchemaSimpleType = { type: 'string' } | { type: 'number' } | { type: 'boolean' } | { type: 'null' }
export type SchemaObject = { type: 'object', properties: SchemaProp[] }
export type SchemaProp = SchemaDefinition
export type SchemaArray = { type: 'array', items: SchemaBody }
export type SchemaRef = { type: 'ref', path: string }
export type Schema = SchemaDefinition[]

export type ParseError = { src: string, message: string, json: any }
export type ParseResult<V> = R.Result<ParseError, V>

function err(src: string, message: string, json: any): R.Err<ParseError> {
    return R.err({ src, message, json })
}

export function refName(ref: SchemaRef): string | null {
    if (ref.path.startsWith('#/definitions/')) {
        return ref.path.replace('#/definitions/', '')
    }
    return null
}
export function parse(schema: S.JSONSchema7): Schema {
    return [parseDefinition(schema)]
        .concat(Object.entries(schema.definitions ?? {}).map(([name, def]) => parseDefinition(def, name)))
        .map(r => r.success ? r.value : null)
        .filter(d => !!d) as SchemaDefinition[]
}
function parseDefinition(json: S.JSONSchema7Definition, name?: string): ParseResult<SchemaDefinition> {
    if (typeof json !== 'boolean') {
        name = name ?? json.title
        if (name) {
            const body = parseBody(json)
            // TODO partial success?
            return body.success ? R.ok({ name, body: body.value }) : body
        }
        else {
            return err('parseDefinition', 'name not found', json)
        }
    }
    return err('parseDefinition', 'expected definition', json)
}

function parseBody(def: S.JSONSchema7): ParseResult<SchemaBody> {
    if (def.$ref) {
        return R.ok({ type: 'ref', path: def.$ref })
    }
    switch (def.type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
            return R.ok({ type: def.type })
        case 'integer':
            return R.ok({ type: 'number' })
        case 'object':
            return R.ok(parseObject(def))
        case 'array':
            return parseArray(def)
        case undefined:
        // TODO union types
        default:
            return err('parseBody', 'unknown type', def)
    }
}

function parseArray(def: S.JSONSchema7): ParseResult<SchemaArray> {
    if (def.items && typeof def.items === 'object' && !Array.isArray(def.items)) {
        const body = parseBody(def.items)
        return body.success ? R.ok({ type: 'array', items: body.value }) : body
    }
    return err('parseArray', 'not an array', def)
}
function parseObject(def: S.JSONSchema7): SchemaObject {
    return {
        type: 'object',
        properties: Object.entries(def.properties ?? {}).map(([key, body]) =>
            parseProp(body, key)
        )
            .map(p => p.success ? p.value : null)
            .filter(p => !!p) as SchemaProp[]
    }
}
function parseProp(def: S.JSONSchema7Definition, name: string): ParseResult<SchemaProp> {
    return parseDefinition(def, name)
}