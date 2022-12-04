import * as P from './parse'
import * as G from './gen-codec'
import freecbt from '../FreeCBT.schema.json'

function parseSource(schema: any): { errors: () => string, source: string } {
    const parsed = P.parse(schema)
    return G.genSource(parsed)
}
function parseValidSource(schema: any): string {
    const { errors, source } = parseSource(schema)
    // expect(errors()).toBeFalsy()
    return source
}

xtest('gen DistortionID', () => {
    const { DistortionID } = freecbt.definitions
    const schema = { ...DistortionID, title: 'DistortionID' }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

xtest('gen Distortion', () => {
    const { DistortionID, Distortion } = freecbt.definitions
    const schema = { definitions: { DistortionID, Distortion } }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

xtest('gen ThoughtID', () => {
    const { ThoughtID } = freecbt.definitions
    const schema = { ...ThoughtID, title: 'ThoughtID' }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

xtest('gen Thought', () => {
    const { ThoughtID, Thought, DistortionID, Distortion } = freecbt.definitions
    const schema = { definitions: { DistortionID, Distortion, ThoughtID, Thought } }
    expect(parseValidSource(schema)).toMatchSnapshot()
})

test('gen simple string', () => {
    const schema = { title: 'a', type: 'string' }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = string;

const decodeA: D.Decoder<a> = D.string;
`)
})

test('gen simple number', () => {
    const schema = { title: 'a', type: 'number' }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = number;

const decodeA: D.Decoder<a> = D.number;
`)
})

test('gen simple integer', () => {
    // TODO gen integer decoder
    const schema = { title: 'a', type: 'integer' }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = number;

const decodeA: D.Decoder<a> = D.number;
`)
})

test('gen simple null', () => {
    const schema = { title: 'a', type: 'null' }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = null;

const decodeA: D.Decoder<a> = D.null_;
`)
})

test('gen simple array', () => {
    const schema = { title: 'a', type: 'array', items: { type: 'string' } }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = Array<string>;

const decodeA: D.Decoder<a> = D.string.array();
`)
})

test('gen simple object', () => {
    const schema = { title: 'a', type: 'object', properties: { b: { type: 'string' } } }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

interface a {
    b: string;
}

const decodeA: D.Decoder<a> = D.combine({
    b: D.string,
    });
`)
})

test('gen simple ref', () => {
    // decoders must be topologically sorted, careful
    const schema = { title: 'a', $ref: '#/definitions/b', definitions: { b: { type: 'string' } } }
    expect(parseValidSource(schema)).toEqual(`\
import * as D from "./src/decode";

type a = b;
type b = string;

const decodeB: D.Decoder<b> = D.string;
const decodeA: D.Decoder<a> = decodeB;
`)
})