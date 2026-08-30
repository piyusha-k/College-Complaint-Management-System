import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  TriggerNode,
  ActionNode,
  AgentNode,
  IntegrationNode,
  ConditionNode,
} from './CustomNodes';

export default function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
  onDragOver,
  readOnly = false,
  activeNodeId = null,
}) {
  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      agent: AgentNode,
      integration: IntegrationNode,
      condition: ConditionNode,
    }),
    []
  );

  // Enhance nodes with active execution ring if running
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.id === activeNodeId) {
        return {
          ...node,
          className: 'animate-pulse ring-4 ring-cyan-400 rounded-2xl shadow-cyan-500/50 shadow-2xl',
        };
      }
      return node;
    });
  }, [nodes, activeNodeId]);

  return (
    <div className="w-full h-full relative bg-[#090d16]" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e293b" />
        <Controls showInteractive={!readOnly} />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger':
                return '#f59e0b';
              case 'agent':
                return '#8b5cf6';
              case 'integration':
                return '#06b6d4';
              case 'condition':
                return '#10b981';
              default:
                return '#6366f1';
            }
          }}
          maskColor="rgba(9, 13, 22, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
