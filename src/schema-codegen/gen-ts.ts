import * as M from 'ts-morph'
import * as P from './parse'

export function genSource(parsed: P.Schema): { errors: () => string, source: string } {
    const project = new M.Project()
    const out = project.createSourceFile('./tempfile.ts')
    gen(parsed, out)
    // const errors = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics());
    function errors() {
        return project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics())
    }
    const diags = project.getPreEmitDiagnostics()
    const source = out.getText()
    out.removeText()
    return { errors, source }
}
export function gen(parsed: P.Schema, out: M.SourceFile): void {
    for (let def of parsed) {
        genDef(def, out)
    }
}
function writeBody(body: P.SchemaBody): string | null {
    switch (body.type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
            return body.type
        case 'ref':
            return P.refName(body) ?? null
        case 'array':
            return `Array<${writeBody(body.items)}>`
        case 'object':
            // TODO
            return null
    }
}
function genDef(def: P.SchemaDefinition, out: M.SourceFile): void {
    switch (def.body.type) {
        case 'object':
            out.addInterface({ name: def.name, properties: def.body.properties.map(p => ({ name: p.name, type: writeBody(p.body) ?? 'unknown' })) })
            return
        default:
            out.addTypeAlias({ name: def.name, type: writeBody(def.body) ?? 'unknown' })
            return
    }
}