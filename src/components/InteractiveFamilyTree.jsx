import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import FamilyMemberNode from './FamilyMemberNode';

// Define custom node types
const nodeTypes = {
  familyMember: FamilyMemberNode,
};

// Default edge style with better curves
const defaultEdgeOptions = {
  animated: false,
  type: 'smoothstep', // Creates curved lines
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#6b7280',
  },
  style: {
    strokeWidth: 3,
    stroke: '#6b7280',
  },
};

const InteractiveFamilyTree = ({ 
  initialNodes = [], 
  initialEdges = [], 
  onSave,
  onAddMember,
  readOnly = false 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const reactFlowWrapper = useRef(null);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params) => {
      if (readOnly) return;
      
      // Enhanced relationship type selection with better styling
      const relationshipType = prompt(
        '🔗 Choose Relationship Type:\n\n' +
        '1. 💕 Spouse/Partner\n' +
        '2. 👨‍👩‍👧‍👦 Parent → Child\n' +
        '3. 👫 Siblings\n' +
        '4. 👴👵 Grandparent → Grandchild\n' +
        '5. 🤝 Other Relation\n\n' +
        'Enter number (1-5):'
      );

      const relationshipMap = {
        '1': { type: 'spouse', color: '#ef4444', style: 'solid' },
        '2': { type: 'parent-child', color: '#3b82f6', style: 'solid' },
        '3': { type: 'sibling', color: '#10b981', style: 'dashed' },
        '4': { type: 'grandparent-grandchild', color: '#8b5cf6', style: 'dotted' },
        '5': { type: 'other', color: '#6b7280', style: 'solid' }
      };

      const relationship = relationshipMap[relationshipType] || relationshipMap['5'];
      
      // Create connection with enhanced styling
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        data: { relationshipType: relationship.type },
        label: relationship.type.replace('-', ' → '),
        labelStyle: { 
          fontSize: 11, 
          fontWeight: 600, 
          color: relationship.color,
          textTransform: 'capitalize'
        },
        labelBgStyle: { 
          fill: '#ffffff', 
          fillOpacity: 0.9,
          rx: 4,
          ry: 4
        },
        style: {
          strokeWidth: 3,
          stroke: relationship.color,
          strokeDasharray: relationship.style === 'dashed' ? '8,4' : 
                          relationship.style === 'dotted' ? '2,2' : '0',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: relationship.color,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, readOnly]
  );

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Save current tree state
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        nodes: nodes.map(node => ({
          ...node,
          position: node.position
        })),
        edges: edges
      });
    }
  }, [nodes, edges, onSave]);

  // Add new family member
  const handleAddMember = useCallback(() => {
    if (onAddMember) {
      onAddMember();
    }
  }, [onAddMember]);

  // Edit selected node
  const handleEditNode = useCallback(() => {
    if (selectedNode && onAddMember) {
      onAddMember(selectedNode);
    }
  }, [selectedNode, onAddMember]);

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (selectedNode && !readOnly) {
      if (window.confirm(`Delete ${selectedNode.data.name}?`)) {
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => 
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
        ));
        setSelectedNode(null);
      }
    }
  }, [selectedNode, setNodes, setEdges, readOnly]);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden border">
      {/* Toolbar */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Family Tree Builder</h2>
          {selectedNode && (
            <span className="text-sm text-gray-600">
              Selected: {selectedNode.data.name}
            </span>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
            >
              <span>👤</span> Add Member
            </button>
            <div className="text-xs text-gray-500">
              New members appear at the top →
            </div>
            
            {selectedNode && (
              <>
                <button
                  onClick={handleEditNode}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </>
            )}
            
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
            >
              Save Tree
            </button>
          </div>
        )}
      </div>

      {/* React Flow Canvas */}
      <div className="w-full h-[600px]" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor="#374151"
            nodeColor="#f3f4f6"
            nodeBorderRadius={8}
          />
          <Background variant="dots" gap={20} size={1} />
        </ReactFlow>
      </div>

      {/* Enhanced Instructions */}
      {!readOnly && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t p-4 text-sm">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <strong className="text-blue-800">🎯 How to Draw Connections:</strong>
              <ul className="mt-1 text-blue-700 space-y-1">
                <li>• <strong>Drag nodes</strong> to reposition them anywhere</li>
                <li>• <strong>Click & drag</strong> from the small gray circles (handles) on nodes</li>
                <li>• <strong>Connect</strong> to another node's handle to create relationships</li>
                <li>• <strong>Choose</strong> relationship type when prompted</li>
              </ul>
            </div>
            <div className="flex-1">
              <strong className="text-purple-800">🎨 Connection Types:</strong>
              <ul className="mt-1 text-purple-700 space-y-1">
                <li>• <span className="text-red-500">💕 Spouse</span> - Red solid line</li>
                <li>• <span className="text-blue-500">👨‍👩‍👧‍👦 Parent→Child</span> - Blue solid line</li>
                <li>• <span className="text-green-500">👫 Siblings</span> - Green dashed line</li>
                <li>• <span className="text-purple-500">👴👵 Grandparent</span> - Purple dotted line</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveFamilyTree;
