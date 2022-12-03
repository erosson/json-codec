import * as S from 'json-schema'

export type SchemaDefinition = { name: string, body: SchemaBody }
export type SchemaBody = SchemaSimpleType | SchemaObject | SchemaArray | SchemaRef
export type SchemaSimpleType = { type: 'string' } | { type: 'number' } | { type: 'boolean' } | { type: 'null' }
export type SchemaObject = { type: 'object', properties: SchemaProp[] }
export type SchemaProp = SchemaDefinition
export type SchemaArray = { type: 'array', items: SchemaBody }
export type SchemaRef = { type: 'ref', path: string }
export type Schema = SchemaDefinition[]

function refName(ref: SchemaRef): string | null {
    if (ref.path.startsWith('#/definitions/')) {
        return ref.path.replace('#/definitions/', '')
    }
    return null
}
export function parse(schema: S.JSONSchema7): Schema {
    return [parseDefinition(schema)]
        .concat(Object.entries(schema.definitions ?? {}).map(([name, def]) => parseDefinition(def, name)))
        .filter(d => !!d) as SchemaDefinition[]
}
function parseDefinition(def: S.JSONSchema7Definition, name?: string): SchemaDefinition | null {
    if (typeof def !== 'boolean') {
        name = name ?? def.title
        if (name) {
            const body = parseBody(def)
            if (body) {
                return { name, body }
            }
        }
    }
    return null
}

function parseBody(def: S.JSONSchema7): SchemaBody | null {
    if (def.$ref) {
        return { type: 'ref', path: def.$ref }
    }
    switch (def.type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
            return { type: def.type }
        case 'integer':
            return { type: 'number' }
        case 'object':
            return parseObject(def)
        case 'array':
            return parseArray(def)
        case undefined:
        default:
            return null
    }
}

function parseArray(def: S.JSONSchema7): SchemaArray | null {
    if (def.items && typeof def.items === 'object' && !Array.isArray(def.items)) {
        const body = parseBody(def.items)
        if (body) {
            return { type: 'array', items: body }
        }
    }
    return null
}
function parseObject(def: S.JSONSchema7): SchemaObject {
    return {
        type: 'object',
        properties: Object.entries(def.properties ?? {}).map(([key, body]) => {
            return parseProp(body, key)
        })
            .filter(p => !!p) as SchemaProp[]
    }
}
function parseProp(def: S.JSONSchema7Definition, name: string): SchemaProp | null {
    return parseDefinition(def, name)
}