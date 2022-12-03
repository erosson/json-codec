import * as M from 'ts-morph'
import * as P from './parse'


export function genSource(parsed: P.Schema): { errors: string, source: string } {
    const project = new M.Project()
    const out = project.createSourceFile('./tempfile.ts')
    gen(parsed, out)
    const errors = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics());
    const source = out.getText()
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
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
            out.addTypeAlias({ name: def.name, type: def.body.type })
            return
        case 'object':
            out.addInterface({ name: def.name, properties: def.body.properties.map(p => ({ name: p.name, type: writeBody(p.body) ?? 'unknown' })) })
            return
    }
}

//const iface = src.addInterface({
//    isExported: true,
//    name: "TestIface",
//    docs: ["howdy howdy howdy"],
//    properties: [
//        { name: "prop", type: 'string' },
//        { name: "prop2", type: 'string' },
//    ],
//})
//const prop = iface.addProperty({ name: "prop3", type: "string" })
//const t = src.addTypeAlias({
//    isExported: true,
//    name: "TestTypeAlias",
//    docs: ["howdy howdy howdy"],
//    type: writer => {
//        writer.block(() => {
//            writer.writeLine("prop: number")
//        })
//    }
//})
//// t.remove()
//console.log(src.getText())
//
//const diagnostics = project.getPreEmitDiagnostics();
//console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));