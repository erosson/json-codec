import * as P from './parse'
import * as G from './gen-ts'
import freecbt from '../FreeCBT.schema.json'

function parseSource(schema: any): { errors: () => string, source: string } {
    const parsed = P.parse(schema)
    return G.genSource(parsed)
}
function parseValidSource(schema: any): string {
    const { errors, source } = parseSource(schema)
    expect(errors()).toBeFalsy()
    return source
}

test('gen DistortionID', () => {
    const { DistortionID } = freecbt.definitions
    const schema = { ...DistortionID, title: 'DistortionID' }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

test('gen Distortion', () => {
    const { DistortionID, Distortion } = freecbt.definitions
    const schema = { definitions: { DistortionID, Distortion } }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

test('gen ThoughtID', () => {
    const { ThoughtID } = freecbt.definitions
    const schema = { ...ThoughtID, title: 'ThoughtID' }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

test('gen Thought', () => {
    const { ThoughtID, Thought, DistortionID, Distortion } = freecbt.definitions
    const schema = { definitions: { DistortionID, Distortion, ThoughtID, Thought } }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

test('gen simple string', () => {
    const schema = { title: 'a', type: 'string' }
    expect(parseValidSource(schema)).toEqual('type a = string;\n')
})
test('gen simple number', () => {
    const schema = { title: 'a', type: 'number' }
    expect(parseValidSource(schema)).toEqual('type a = number;\n')
})

test('gen simple integer', () => {
    const schema = { title: 'a', type: 'integer' }
    expect(parseValidSource(schema)).toEqual('type a = number;\n')
})

test('gen simple null', () => {
    const schema = { title: 'a', type: 'null' }
    expect(parseValidSource(schema)).toEqual('type a = null;\n')
})

test('gen simple array', () => {
    const schema = { title: 'a', type: 'array', items: { type: 'string' } }
    expect(parseValidSource(schema)).toEqual('type a = Array<string>;\n')
})

test('gen simple object', () => {
    const schema = { title: 'a', type: 'object', properties: { b: { type: 'string' } } }
    expect(parseValidSource(schema)).toEqual(`interface a {
    b: string;
}
`)
})

test('gen simple ref', () => {
    const schema = { title: 'a', $ref: '#/definitions/b', definitions: { b: { type: 'string' } } }
    expect(parseValidSource(schema)).toEqual(`type a = b;
type b = string;
`)
})