/** @format */

import { Prompt } from '../src'

describe('Prompt', () => {
    it('constructor sets fields correctly', () => {
        const p = new Prompt('Title', 'Content')
        expect(p.title).toBe('Title')
        expect(p.content).toBe('Content')
        expect(Array.isArray(p.children)).toBe(true)
        expect(p.children.length).toBe(0)
    })

    it('add adds children and supports chaining', () => {
        const p = new Prompt('Root')
        const c1 = new Prompt('Child1')
        const c2 = new Prompt('Child2')
        p.add(c1).add(c2)
        expect(p.children).toContain(c1)
        expect(p.children).toContain(c2)
        expect(p.children.length).toBe(2)
    })

    it('getByTitle finds immediate children', () => {
        const p = new Prompt('Root')
        const c1 = new Prompt('A')
        const c2 = new Prompt('B')
        p.add(c1).add(c2)
        expect(p.getByTitle('A')).toEqual([c1])
        expect(p.getByTitle('B')).toEqual([c2])
        expect(p.getByTitle('C')).toEqual([])
    })

    it('getByTitle finds deep descendants when deep=true', () => {
        const p = new Prompt('Root')
        const c1 = new Prompt('A')
        const c2 = new Prompt('B')
        const gc = new Prompt('A')
        c2.add(gc)
        p.add(c1).add(c2)
        expect(p.getByTitle('A', true)).toEqual([c1, gc])
    })

    it('getByTitle then adds child to found node', () => {
        const p = new Prompt('Root')
        const a = new Prompt('A')
        const b = new Prompt('B')
        const a2 = new Prompt('A')
        p.add(a).add(b)
        b.add(a2)
        const found = p.getByTitle('A', true)
        expect(found.length).toBe(2)
        found[0].add(new Prompt('C'))
        const d = new Prompt('D')
        found[1].add(d)
        p.printTree()
        expect(found[0].children.length).toBe(1)
        expect(p.children.length).toBe(2)
        expect(b.children.length).toBe(1)
        expect(b.children[0].children.length).toBe(1)
        expect(b.children[0].children[0]).toBe(d)
        expect(b.children[0].children[0].children.length).toBe(0)
        expect(b.children[0].children[0].children[0]).toBe(undefined)
    })

    it('remove removes immediate children', () => {
        const p = new Prompt('Root')
        const c1 = new Prompt('A')
        const c2 = new Prompt('B')
        p.add(c1).add(c2)
        const removed = p.remove('A')
        expect(removed).toEqual([c1])
        expect(p.children).toEqual([c2])
    })

    it('remove removes deep descendants when deep=true', () => {
        const p = new Prompt('Root')
        const c1 = new Prompt('A')
        const c2 = new Prompt('B')
        const gc = new Prompt('A')
        c2.add(gc)
        p.add(c1).add(c2)
        const removed = p.remove('A', true)
        expect(removed).toEqual([c1, gc])
        expect(p.children).toEqual([c2])
        expect(c2.children).toEqual([])
    })

    it('toMarkdown outputs correct Markdown', () => {
        const p = new Prompt('Root', 'Root content')
        const c1 = new Prompt('Child', 'Child content')
        p.add(c1)
        const md = p.toMarkdown()
        expect(md).toContain('# Root')
        expect(md).toContain('Root content')
        expect(md).toContain('## Child')
        expect(md).toContain('Child content')
    })

    it('clone creates a deep copy', () => {
        const p = new Prompt('Root', 'Root content')
        const c1 = new Prompt('Child', 'Child content')
        p.add(c1)
        const clone = p.clone()
        expect(clone).not.toBe(p)
        expect(clone.title).toBe(p.title)
        expect(clone.content).toBe(p.content)
        expect(clone.children.length).toBe(1)
        expect(clone.children[0]).not.toBe(c1)
        expect(clone.children[0].title).toBe('Child')
    })

    it('toJSON and fromJSON serialize and deserialize correctly', () => {
        const p = new Prompt('Root', 'Root content')
        const c1 = new Prompt('Child', 'Child content')
        p.add(c1)
        const json = p.toJSON()
        const restored = Prompt.fromJSON(json)
        expect(restored.title).toBe('Root')
        expect(restored.children[0].title).toBe('Child')
        expect(restored.children[0].content).toBe('Child content')
    })

    it('toString matches toMarkdown', () => {
        const p = new Prompt('Root', 'Root content')
        expect(p.toString()).toBe(p.toMarkdown())
    })

    it('fromMarkdown parses Markdown into tree', () => {
        const md = `
# Root

Root content

## Child 1

Child 1 content

### Grandchild

Grandchild content

## Child 2
`
        const tree = Prompt.fromMarkdown(md)
        expect(tree.title).toBe('Root')
        expect(tree.content).toContain('Root content')
        expect(tree.children.length).toBe(2)
        expect(tree.children[0].title).toBe('Child 1')
        expect(tree.children[0].children[0].title).toBe('Grandchild')
        expect(tree.children[1].title).toBe('Child 2')
    })

    it('getAST returns correct AST structure', () => {
        const p = new Prompt('Root', 'Root content')
        const ast = p.getAST()
        expect(ast.type).toBe('heading')
        if (ast.children) {
            expect(ast.children[0].type).toBe('text')
            expect(ast.children[0].value).toBe('Root')
            expect(ast.children[1].type).toBe('paragraph')
            if (ast.children[1].children) expect(ast.children[1].children[0].type).toBe('text')
        }
    })

    it('printTree prints tree structure', () => {
        const p = new Prompt('Root', 'Root content')
        const c1 = new Prompt('Child', 'Child content')
        p.add(c1)
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        p.printTree()
        expect(logSpy).toHaveBeenCalled()
        logSpy.mockRestore()
    })
})
