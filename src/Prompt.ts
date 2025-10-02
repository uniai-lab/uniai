/** @format */

import { IAST } from '../interface/IPrompt'

/** @format
 * Represents a node in a recursive Markdown tree structure,
 * containing a title, content, and any number of sub-sections (children).
 */
export default class Prompt {
    // The heading/title of this prompt node, corresponding to a Markdown heading.
    title: string

    // The main content/body text of this prompt node. Does not include content under sub-headings.
    content: string

    // The immediate child prompt nodes (sub-sections).
    children: Prompt[]

    /**
     * Constructs a new Prompt instance.
     * @param title - The heading/title of the node.
     * @param content - The content/body text of the node. Defaults to an empty string.
     * @param children - An array of Prompt children. Defaults to an empty array.
     */
    constructor(title: string, content: string = '', children: Prompt[] = []) {
        this.title = title
        this.content = content
        this.children = children
    }

    /**
     * Recursively finds all descendant nodes (including direct children) whose title matches the given string.
     * @param title - The title to search for.
     * @param deep - Whether to search recursively in all descendants. Defaults to false (only immediate children).
     * @returns An array of all matching Prompt nodes.
     */
    getByTitle(title: string, deep: boolean = false): Prompt[] {
        let result: Prompt[] = []
        for (const child of this.children) {
            if (child.title === title) result.push(child)
            if (deep) result = result.concat(child.getByTitle(title, true))
        }
        return result
    }

    /**
     * Adds a child prompt node to the children of this node.
     * Supports chainable calls.
     * @param child - The Prompt instance to add.
     * @returns This Prompt instance (for chaining).
     */
    add(child: Prompt): this {
        this.children.push(child)
        return this
    }

    /**
     * Recursively removes all nodes (including direct and indirect children) whose title matches the given string.
     * @param title - The title of the nodes to remove.
     * @param deep - Whether to remove matching nodes at any depth. Defaults to false (only immediate children).
     * @returns An array of all removed Prompt nodes.
     */
    remove(title: string, deep: boolean = false): Prompt[] {
        // Remove from immediate children
        const removed: Prompt[] = []
        for (let i = this.children.length - 1; i >= 0; i--)
            if (this.children[i].title === title) removed.push(...this.children.splice(i, 1))

        // Recursively remove from descendants
        if (deep) for (const child of this.children) removed.push(...child.remove(title, true))
        return removed
    }

    /**
     * Recursively exports the structure as Markdown text.
     * @param level - The Markdown heading level (used internally for recursion).
     * @returns The generated Markdown string.
     */
    toMarkdown(level: number = 1): string {
        let md = ''
        if (this.title) md += `${'#'.repeat(level)} ${this.title}\n\n`
        if (this.content) md += this.content.trim() + '\n\n'

        for (const child of this.children) md += child.toMarkdown(level + 1)
        return md
    }

    /**
     * Creates a deep copy (clone) of this Prompt node, including all descendants.
     * @returns A new Prompt instance that is a deep copy of this node.
     */
    clone(): Prompt {
        return new Prompt(
            this.title,
            this.content,
            this.children.map(child => child.clone())
        )
    }

    /**
     * Serializes this node and all descendants into a plain JSON object structure.
     * Only the title, content, and children structure are preserved.
     * @returns The JSON representation of this Prompt tree.
     */
    toJSON(): object {
        return {
            title: this.title,
            content: this.content,
            children: this.children.map(child => child.toJSON())
        }
    }

    /**
     * Converts this Prompt node and all descendants into a Markdown string.
     * @returns The Markdown representation of this Prompt tree.
     */
    toString(): string {
        return this.toMarkdown()
    }

    /**
     * Deserializes a JSON object (or string) into a Prompt tree.
     * @param jsonObj - The structured data (from toJSON) or a compatible JSON string.
     * @returns The root Prompt instance.
     */
    static fromJSON(jsonObj: any): Prompt {
        if (typeof jsonObj === 'string') jsonObj = JSON.parse(jsonObj)

        return new Prompt(
            jsonObj.title,
            jsonObj.content,
            (jsonObj.children || []).map((child: any) => Prompt.fromJSON(child))
        )
    }

    /**
     * Parses a Markdown source string and constructs a Prompt tree representing its structure.
     * Only basic heading recognition (# ... ######) is implemented.
     * @param markdown - The Markdown source string.
     * @returns The root Prompt node parsed from the document.
     */
    static fromMarkdown(markdown: string): Prompt {
        // Split lines in a cross-platform way (supports both LF and CRLF)
        const lines = markdown.split(/\r?\n/)
        const root = new Prompt('', '', [])
        const stack: { prompt: Prompt; level: number }[] = [{ prompt: root, level: 0 }]

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
            if (headingMatch) {
                const level = headingMatch[1].length
                const title = headingMatch[2].trim()
                const newNode = new Prompt(title, '')
                while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
                stack[stack.length - 1].prompt.add(newNode)
                stack.push({ prompt: newNode, level })
            } else if (line.trim() !== '') {
                if (stack.length > 0) {
                    const current = stack[stack.length - 1].prompt
                    if (current.content) current.content += '\n'
                    current.content += line.trim()
                }
            }
        }
        if (root.children.length === 1) return root.children[0]
        return new Prompt('Document', '', root.children)
    }

    /**
     * Generates an Abstract Syntax Tree (AST) representing this node and all descendants,
     * compatible with mdast structure.
     * @returns The generated AST object.
     */
    getAST(): IAST {
        const astNode: IAST = {
            type: this.title ? 'heading' : 'root',
            depth: this.title ? 1 : undefined,
            children: []
        }
        if (this.title) astNode.children!.push({ type: 'text', value: this.title })
        if (this.content)
            astNode.children!.push({
                type: 'paragraph',
                children: [{ type: 'text', value: this.content }]
            })
        for (const child of this.children) astNode.children!.push(child.getAST())
        return astNode
    }

    /**
     * Prints the tree structure of this Prompt node and all descendants to the console,
     * with clear indentation and branch markers for visualization.
     * @param indent - The indentation prefix for current level (for internal recursion use).
     * @param isLast - Whether this is the last child node (for internal recursion use).
     */
    printTree(indent: string = '', isLast: boolean = true): void {
        const icon = indent ? (isLast ? '└─' : '├─') : ''
        if (this.title || this.content)
            // Only print non-empty nodes
            console.log(
                `${indent}${icon}${this.title ? `「${this.title}」` : ''}${this.content ? `: ${this.content.split('\n')[0]}${this.content.length > 40 ? '...' : ''}` : ''}`
            )
        const nextIndent = indent + (isLast ? '  ' : '│ ')
        this.children.forEach((child, i) => child.printTree(nextIndent, i === this.children.length - 1))
    }
}
