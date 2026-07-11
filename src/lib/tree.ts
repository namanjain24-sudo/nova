import type { Node } from '../core/schema'

/** Return the node with the given id (searches the whole tree). */
export function findNode(root: Node, id: string): Node | null {
  if (root.id === id) return root
  if (!root.children) return null
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

/** Return the parent of the node with `id`, or null if root/not found. */
export function findParent(root: Node, id: string): Node | null {
  if (!root.children) return null
  for (const child of root.children) {
    if (child.id === id) return root
    const found = findParent(child, id)
    if (found) return found
  }
  return null
}

/** Return the array of ancestor ids from root down to (excluding) the node. */
export function pathTo(root: Node, id: string, acc: string[] = []): string[] | null {
  if (root.id === id) return acc
  if (!root.children) return null
  for (const child of root.children) {
    const p = pathTo(child, id, [...acc, root.id])
    if (p) return p
  }
  return null
}

/** Immutably update a single node found by id. */
export function updateNode(root: Node, id: string, updater: (n: Node) => Node): Node {
  if (root.id === id) return updater(root)
  if (!root.children) return root
  return { ...root, children: root.children.map((c) => updateNode(c, id, updater)) }
}

/** Immutably remove a node by id. */
export function removeNode(root: Node, id: string): Node {
  if (!root.children) return root
  return {
    ...root,
    children: root.children
      .filter((c) => c.id !== id)
      .map((c) => removeNode(c, id)),
  }
}

/** Insert `node` into parent at index. If index omitted, append. */
export function insertNode(
  root: Node,
  parentId: string,
  node: Node,
  index?: number,
): Node {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])]
    if (index === undefined || index >= children.length) children.push(node)
    else children.splice(Math.max(0, index), 0, node)
    return { ...root, children }
  }
  if (!root.children) return root
  return {
    ...root,
    children: root.children.map((c) => insertNode(c, parentId, node, index)),
  }
}

/** Move an existing node to a new parent/index (remove then insert). */
export function moveNode(
  root: Node,
  id: string,
  parentId: string,
  index: number,
): Node {
  const node = findNode(root, id)
  if (!node) return root
  // Prevent dropping a node into its own descendant.
  if (id === parentId || findNode(node, parentId)) return root
  const without = removeNode(root, id)
  return insertNode(without, parentId, node, index)
}

/** Count total nodes (for stats). */
export function countNodes(root: Node): number {
  return 1 + (root.children?.reduce((n, c) => n + countNodes(c), 0) ?? 0)
}
