import * as P from './parse'
import * as G from './gen-ts'
import schema from '../FreeCBT.schema.json'

test('gen DistortionID', () => {
    const { DistortionID } = schema.definitions
    const parsed = P.parse({ ...DistortionID, title: 'DistortionID' } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})

test('gen Distortion', () => {
    const { DistortionID, Distortion } = schema.definitions
    const parsed = P.parse({ definitions: { DistortionID, Distortion } } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})

test('gen ThoughtID', () => {
    const { ThoughtID } = schema.definitions
    const parsed = P.parse({ ...ThoughtID, title: 'ThoughtID' } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})

test('gen Thought', () => {
    const { ThoughtID, Thought, DistortionID, Distortion } = schema.definitions
    const parsed = P.parse({ definitions: { DistortionID, Distortion, ThoughtID, Thought } } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})