import * as M from 'ts-morph'
import * as GT from './gen-ts'
import * as P from './parse'

export function genSource(parsed: P.Schema): { errors: () => string, source: string } {
    const project = new M.Project({ tsConfigFilePath: './tsconfig.json' })
    const out = project.createSourceFile('./tempfile.ts')

    gen(parsed, out)
    // const errors = project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics());
    function errors() {
        return project.formatDiagnosticsWithColorAndContext(project.getPreEmitDiagnostics())
    }
    const source = out.getText()
    out.removeText()
    return { errors, source }
}
export function gen(parsed: P.Schema, out: M.SourceFile): void {
    const imp = out.addImportDeclaration({ moduleSpecifier: './src/decode' })
    imp.setNamespaceImport("D")

    GT.gen(parsed, out)

    for (let def of topologicalSortRefs(parsed)) {
        genDef(def, out)
    }
}
function refs(body: P.SchemaBody): string[] {
    switch (body.type) {
        case "ref": return [P.refName(body)].filter(s => !!s) as string[]
        case "array": return refs(body.items)
        case "object": return body.properties.map(def => refs(def.body)).flat()
        default: return []
    }
}
function topologicalSortRefs(parsed: P.SchemaDefinition[]): P.SchemaDefinition[] {
    // based on https://www.tutorialspoint.com/Topological-sorting-using-Javascript-DFS , plus my undergrad
    const s: P.SchemaDefinition[] = []
    const explored = new Set<string>()
    const byName: { [s: string]: P.SchemaDefinition } = Object.fromEntries(parsed.map(p => [p.name, p]))
    function explore(def: P.SchemaDefinition): void {
        if (!explored.has(def.name)) {
            explored.add(def.name)
            for (let edge of refs(def.body)) {
                explore(byName[edge])
            }
            s.push(def)
        }
    }
    for (let def of parsed) {
        explore(def)
    }
    return s
}
function titleCase(s: string): string {
    return s ? `${s[0].toUpperCase()}${s.substring(1)}` : s
}
function writeDecoderName(name: string): string {
    return `decode${titleCase(name)}`
}
function genDef(def: P.SchemaDefinition, out: M.SourceFile): void {
    out.addVariableStatement({
        declarationKind: M.VariableDeclarationKind.Const,
        declarations: [{
            name: writeDecoderName(def.name),
            // type: `D.Decoder<${writeType(def.body) ?? 'unknown'}>`,
            type: `D.Decoder<${def.name}>`,
            initializer: writeValue(def.body) ?? 'null',
        }]
    })
}
function writeValue(body: P.SchemaBody): string | null {
    switch (body.type) {
        case 'string':
        case 'number':
        case 'boolean':
            return `D.${body.type}`
        case 'null':
            return `D.null_`
        case 'ref':
            const name = P.refName(body)
            return name ? writeDecoderName(name) : null
        case 'array':
            return `${writeValue(body.items)}.array()`
        case 'object':
            return `\
D.combine({
${body.properties.map(prop => `${prop.name}: ${writeValue(prop.body)}`).join(",\n")},
})`
    }
}