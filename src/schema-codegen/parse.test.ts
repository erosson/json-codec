import * as P from './parse'
import schema from '../FreeCBT.schema.json'

test('parse DistortionID', () => {
    expect(P.parse({ ...schema.definitions.DistortionID, title: 'DistortionID' } as any)).toMatchSnapshot()
})
test('parse Distortion', () => {
    const parsed = P.parse({ ...schema.definitions.Distortion, title: 'Distortion' } as any)
    expect(parsed[0].body.type === 'object')
    expect(new Set((parsed[0].body as P.SchemaObject).properties.map(p => p.name))).toEqual(new Set(Object.keys(schema.definitions.Distortion.properties)))
    expect(parsed).toMatchSnapshot()
})
test('parse ThoughtID', () => {
    expect(P.parse({ ...schema.definitions.ThoughtID, title: 'ThoughtID' } as any)).toMatchSnapshot()
})
test('parse Thought', () => {
    const parsed = P.parse({ ...schema.definitions.Thought, title: 'Thought' } as any)
    expect(parsed[0].body.type === 'object')
    expect(new Set((parsed[0].body as P.SchemaObject).properties.map(p => p.name))).toEqual(new Set(Object.keys(schema.definitions.Thought.properties)))
    expect(parsed).toMatchSnapshot()
})
