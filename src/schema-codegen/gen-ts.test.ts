import * as P from './parse'
import * as G from './gen-ts'
import schema from '../FreeCBT.schema.json'

test('gen DistortionID', () => {
    const parsed = P.parse({ ...schema.definitions.DistortionID, title: 'DistortionID' } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})

test.only('gen Distortion', () => {
    const parsed = P.parse({ ...schema.definitions.Distortion, title: 'Distortion' } as any)
    const { errors, source } = G.genSource(parsed)
    expect(errors).toBeFalsy()
    expect(source).toMatchSnapshot()
})