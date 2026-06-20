export function blueprintToGraph(blueprint) {
  const nodes = []
  const edges = []

  // Root node — the app itself
  nodes.push({
    id: 'root',
    type: 'custom',
    data: { label: blueprint.projectName, category: 'root' },
    position: { x: 0, y: 0 }
  })

  // Page nodes
  blueprint.pages?.forEach((page, i) => {
    const id = `page-${i}`
    nodes.push({
      id,
      type: 'custom',
      data: { label: page.name, description: page.description, category: 'screen' },
      position: { x: 0, y: 0 }
    })
    edges.push({ id: `e-root-${id}`, source: 'root', target: id })
  })

  // Feature nodes — connected to root
  blueprint.features?.forEach((feature, i) => {
    const id = `feature-${i}`
    nodes.push({
      id,
      type: 'custom',
      data: { label: feature.name, description: feature.description, category: 'feature', priority: feature.priority },
      position: { x: 0, y: 0 }
    })
    edges.push({ id: `e-root-${id}`, source: 'root', target: id })
  })

  // DB table nodes
  blueprint.dbTables?.forEach((table, i) => {
    const id = `db-${i}`
    nodes.push({
      id,
      type: 'custom',
      data: { label: table.name, description: `${table.fields.length} fields`, category: 'database' },
      position: { x: 0, y: 0 }
    })
    edges.push({ id: `e-root-${id}`, source: 'root', target: id })
  })

  return { nodes, edges }
}

export function graphToBlueprintUpdates(nodes) {
  // Extract any structural info from graph back to JSON if needed later
  return {
    pages: nodes.filter(n => n.data.category === 'screen').map(n => n.data.label),
    features: nodes.filter(n => n.data.category === 'feature').map(n => n.data.label),
    dbTables: nodes.filter(n => n.data.category === 'database').map(n => n.data.label)
  }
}