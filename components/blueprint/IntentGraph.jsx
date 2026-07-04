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

// ✅ Defined outside component — prevents React Flow warning #002
const nodeTypes = { custom: CustomNode }

// ✅ Defined outside component — stable reference, no re-creation on render
const miniMapNodeColor = (n) => {
  const colors = { root: '#7c3aed', screen: '#3b82f6', feature: '#22c55e', database: '#f97316' }
  return colors[n.data.category] || '#555'
}

// ✅ Toolbar button styles outside component
const toolbarBtnStyles = {
  screen:   { background: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',  padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  feature:  { background: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)',  padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  database: { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
}

function GraphInner({ blueprint, onConfirm }) {
  const initial = useMemo(() => {
    const { nodes, edges } = blueprintToGraph(blueprint)
    return getLayoutedElements(nodes, edges)
  }, [blueprint])

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const [nodeIdCounter, setNodeIdCounter] = useState(1000)
  const [confirmedFlash, setConfirmedFlash] = useState(false)

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
    setConfirmedFlash(true)
    setTimeout(() => setConfirmedFlash(false), 2000)
  }

  return (
    <NodeDeleteContext.Provider value={deleteNode}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 4px', marginBottom: '8px'
        }}>
          <button onClick={() => addNode('screen')}   style={toolbarBtnStyles.screen}>+ Screen</button>
          <button onClick={() => addNode('feature')}  style={toolbarBtnStyles.feature}>+ Feature</button>
          <button onClick={() => addNode('database')} style={toolbarBtnStyles.database}>+ Table</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            Drag nodes • Click × to remove • Drag dot-to-dot to connect
          </span>
        </div>

        {/* Graph canvas — dark */}
        <div style={{
          flex: 1, border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', overflow: 'hidden', background: '#0d0d18'
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="rgba(255,255,255,0.06)" gap={20} />
            <Controls style={{ background: '#15151f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <MiniMap
              nodeColor={miniMapNodeColor}
              style={{ background: '#15151f', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </ReactFlow>
        </div>

        {/* Confirm */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleConfirm} style={{
            background: '#7c3aed', color: '#fff', border: 'none',
            padding: '11px 28px', borderRadius: '9px',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          >
            Confirm Graph →
          </button>
          {confirmedFlash && (
            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>
              ✓ Graph saved — switch to Text View to approve
            </span>
          )}
        </div>

      </div>
    </NodeDeleteContext.Provider>
  )
}

export default function IntentGraph({ blueprint, onConfirm }) {
  return (
    <ReactFlowProvider>
      <GraphInner blueprint={blueprint} onConfirm={onConfirm} />
    </ReactFlowProvider>
  )
}