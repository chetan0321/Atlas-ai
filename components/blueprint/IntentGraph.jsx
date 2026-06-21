'use client'

import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge, ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import CustomNode from './CustomNode'
import { NodeDeleteContext } from './nodeDeleteContext'
import { blueprintToGraph } from '@/lib/intentgraph/convert'
import { getLayoutedElements } from '@/lib/intentgraph/layout'

const nodeTypes = { custom: CustomNode }

function GraphInner({ blueprint, onConfirm }) {
  const initial = useMemo(() => {
    const { nodes, edges } = blueprintToGraph(blueprint)
    return getLayoutedElements(nodes, edges)
  }, [blueprint])

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const [nodeIdCounter, setNodeIdCounter] = useState(1000)

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const deleteNode = useCallback((id) => {
    setNodes(nds => nds.filter(n => n.id !== id))
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
  }, [setNodes, setEdges])

  function addNode(category) {
    const id = `custom-${nodeIdCounter}`
    setNodeIdCounter(c => c + 1)
    const labels = { screen: 'New Screen', feature: 'New Feature', database: 'new_table' }
    setNodes(nds => [
      ...nds,
      {
        id,
        type: 'custom',
        data: { label: labels[category], category, description: 'Click to edit' },
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
      }
    ])
  }

  function handleConfirm() {
    onConfirm({ nodes, edges })
  }

  return (
    <NodeDeleteContext.Provider value={deleteNode}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 4px', marginBottom: '8px'
        }}>
          <button onClick={() => addNode('screen')} style={toolbarBtnStyle('#1d4ed8', '#eff6ff')}>+ Screen</button>
          <button onClick={() => addNode('feature')} style={toolbarBtnStyle('#15803d', '#f0fdf4')}>+ Feature</button>
          <button onClick={() => addNode('database')} style={toolbarBtnStyle('#c2410c', '#fff7ed')}>+ Table</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '12px', color: '#888' }}>
            Drag nodes • Click × to remove • Drag dot-to-dot to connect
          </span>
        </div>

        <div style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#e5e5e5" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={n => {
                const colors = { root: '#0a0a0a', screen: '#1d4ed8', feature: '#15803d', database: '#c2410c' }
                return colors[n.data.category] || '#ccc'
              }}
              style={{ background: '#fafafa' }}
            />
          </ReactFlow>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={handleConfirm} style={{
            background: '#0a0a0a', color: '#fff', border: 'none',
            padding: '11px 28px', borderRadius: '9px',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer'
          }}>
            Confirm Graph →
          </button>
        </div>

      </div>
    </NodeDeleteContext.Provider>
  )
}

function toolbarBtnStyle(color, bg) {
  return {
    background: bg, color, border: 'none', padding: '6px 14px',
    borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  }
}

export default function IntentGraph({ blueprint, onConfirm }) {
  return (
    <ReactFlowProvider>
      <GraphInner blueprint={blueprint} onConfirm={onConfirm} />
    </ReactFlowProvider>
  )
}