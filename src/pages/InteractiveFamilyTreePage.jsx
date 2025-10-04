import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import InteractiveFamilyTree from '../components/InteractiveFamilyTree';
import FamilyMemberForm from '../components/FamilyMemberForm';

export default function InteractiveFamilyTreePage() {
  const [treeData, setTreeData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFamilyTree();
  }, []);

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      const response = await api.get('/family-tree');
      
      // Ensure proper React Flow format with handlers
      const formattedNodes = response.data.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onEdit: () => handleAddMember(node),
          onDelete: () => handleDeleteNode(node)
        }
      }));
      
      setTreeData({
        nodes: formattedNodes,
        edges: response.data.edges || []
      });
      
      console.log(`✅ Loaded ${formattedNodes.length} family members and ${response.data.edges?.length || 0} connections`);
    } catch (err) {
      setError('Failed to load family tree');
      console.error('Fetch family tree error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTree = useCallback(async (treeState) => {
    try {
      setSaving(true);
      await api.put('/family-tree/save', treeState);
      setTreeData(treeState);
    } catch (err) {
      console.error('Save tree error:', err);
      alert('Failed to save family tree');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleAddMember = useCallback((memberToEdit = null) => {
    setEditingMember(memberToEdit);
    setShowForm(true);
  }, []);

  const handleNuclearDelete = useCallback(async () => {
    const confirmMessage = `🔥 NUCLEAR DELETE - WIPE EVERYTHING?\n\n` +
                          `This will FORCE DELETE:\n` +
                          `• Dora, Bujji, and ALL family members\n` +
                          `• ALL connections and relationships\n` +
                          `• EVERYTHING from database permanently\n\n` +
                          `🚨 GUARANTEED PERMANENT DELETION 🚨\n\n` +
                          `Type "NUCLEAR DELETE" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    if (userInput !== "NUCLEAR DELETE") return;
    
    try {
      setSaving(true);
      console.log('🔥 Starting nuclear delete...');
      
      const response = await api.post('/family-tree/nuclear-delete');
      console.log('🔥 Nuclear delete response:', response.data);
      
      // Clear canvas immediately
      setTreeData({ nodes: [], edges: [] });
      
      alert(`🔥 NUCLEAR DELETE COMPLETE!\n\nDeleted: ${response.data.deletedNodes} nodes, ${response.data.deletedConnections} connections\n\nDora and Bujji are GONE FOREVER!`);
      
      // Force refresh to confirm empty state
      setTimeout(() => {
        fetchFamilyTree();
      }, 1000);
      
    } catch (err) {
      console.error('Nuclear delete error:', err);
      alert('❌ Nuclear delete failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    const confirmMessage = `🗑️ DELETE ALL FAMILY TREE DATA?\n\n` +
                          `This will permanently remove:\n` +
                          `• ALL family members from database\n` +
                          `• ALL connections and relationships\n` +
                          `• Start completely fresh\n\n` +
                          `⚠️ THIS CANNOT BE UNDONE! ⚠️\n\n` +
                          `Type "DELETE ALL" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    if (userInput !== "DELETE ALL") return;
    
    try {
      setSaving(true);
      await api.delete('/family-tree/clear-all');
      
      // Clear canvas immediately
      setTreeData({ nodes: [], edges: [] });
      
      console.log('✅ All family tree data cleared successfully');
      alert('✅ All family tree data has been permanently deleted!');
    } catch (err) {
      console.error('Clear all error:', err);
      alert('❌ Failed to clear family tree data. Please try again.');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDeleteNode = useCallback(async (nodeToDelete) => {
    if (!nodeToDelete || !nodeToDelete.data?.name) return;
    
    const confirmMessage = `🗑️ Delete ${nodeToDelete.data.name}?\n\n` +
                          `This will permanently remove:\n` +
                          `• Family member from database\n` +
                          `• All connections to this member\n` +
                          `• Uploaded photo from cloud storage\n\n` +
                          `This action cannot be undone!`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setSaving(true);
      
      console.log(`🗑️ Attempting to delete node:`, {
        id: nodeToDelete.id,
        name: nodeToDelete.data.name,
        nodeData: nodeToDelete
      });
      
      // Call backend to completely delete member and all associated data
      const deleteResponse = await api.delete(`/family-tree/node/${nodeToDelete.id}`);
      console.log(`✅ Backend delete response:`, deleteResponse.data);
      
      // Remove node and all its connections from canvas immediately
      const updatedNodes = treeData.nodes.filter(node => node.id !== nodeToDelete.id);
      const updatedEdges = treeData.edges.filter(edge => 
        edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id
      );
      
      setTreeData({
        nodes: updatedNodes,
        edges: updatedEdges
      });
      
      console.log(`✅ Successfully deleted ${nodeToDelete.data.name}. Remaining: ${updatedNodes.length} nodes, ${updatedEdges.length} connections`);
      
      // Force refresh from database to ensure sync
      setTimeout(() => {
        console.log('🔄 Refreshing from database to verify deletion...');
        fetchFamilyTree();
      }, 1000);
    } catch (err) {
      console.error('Delete node error:', err);
      alert(`❌ Failed to delete ${nodeToDelete.data.name}. Please try again.`);
    } finally {
      setSaving(false);
    }
  }, [handleSaveTree, treeData]);

  const handleSubmitMember = async (memberData) => {
    let tempNode = null; // Declare at function scope
    
    try {
      setSaving(true);
      
      // Calculate position for new member (top row, side by side)
      const existingNodes = treeData.nodes;
      const newPosition = memberData.isEditing 
        ? undefined // Keep existing position for edits
        : {
            x: existingNodes.length * 250 + 100, // Space them 250px apart
            y: 50 // Always at top (50px from top)
          };

      // For new members, add to canvas immediately (optimistic update)
      if (!memberData.isEditing) {
        tempNode = {
          id: memberData.nodeId,
          type: 'familyMember',
          position: newPosition,
          data: {
            name: memberData.name,
            dateOfBirth: memberData.dateOfBirth,
            dateOfDeath: memberData.dateOfDeath,
            gender: memberData.gender,
            photo: memberData.photo ? { url: URL.createObjectURL(memberData.photo) } : null,
            occupation: memberData.occupation,
            location: memberData.location,
            notes: memberData.notes,
            onEdit: () => handleAddMember(tempNode),
            onDelete: () => handleDeleteNode(tempNode)
          }
        };
        
        // Add node immediately to canvas for instant feedback
        setTreeData(prev => {
          const newNodes = [...prev.nodes, tempNode];
          console.log(`🎯 Added ${memberData.name} to canvas. Total nodes: ${newNodes.length}`);
          return {
            ...prev,
            nodes: newNodes
          };
        });
      }
      
      // Create FormData for photo upload
      const formData = new FormData();
      Object.keys(memberData).forEach(key => {
        if (key === 'photo' && memberData[key]) {
          formData.append('photo', memberData[key]);
        } else if (memberData[key] !== null && memberData[key] !== '') {
          formData.append(key, memberData[key]);
        }
      });

      // Add position data for new members
      if (newPosition) {
        formData.append('positionX', newPosition.x);
        formData.append('positionY', newPosition.y);
      }

      const response = await api.post('/family-tree/node', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update tree data with immediate visibility
      if (memberData.isEditing) {
        // Update existing node
        setTreeData(prev => ({
          ...prev,
          nodes: prev.nodes.map(node => 
            node.id === memberData.nodeId ? {
              ...response.data,
              type: 'familyMember',
              data: {
                ...response.data.data,
                onEdit: () => handleAddMember(node),
                onDelete: () => handleDeleteNode(node)
              }
            } : node
          )
        }));
      } else {
        // Update the temporary node with server response (replace photo URL and ensure proper format)
        setTreeData(prev => {
          const updatedNodes = prev.nodes.map(node => 
            node.id === memberData.nodeId ? {
              ...node,
              data: {
                ...node.data,
                photo: response.data.data?.photo || node.data.photo
              }
            } : node
          );
          console.log(`✅ Updated ${memberData.name} with server response. Total nodes: ${updatedNodes.length}`);
          return {
            ...prev,
            nodes: updatedNodes
          };
        });
      }

      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error('Submit member error:', err);
      
      // If adding new member failed, remove the temporary node
      if (!memberData.isEditing && tempNode) {
        setTreeData(prev => ({
          ...prev,
          nodes: prev.nodes.filter(node => node.id !== tempNode.id)
        }));
        console.log(`❌ Removed temporary node ${memberData.name} due to server error`);
      }
      
      alert(`❌ Failed to save ${memberData.name}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={fetchFamilyTree}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            Try Again
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent">
          Interactive Family Tree Builder
        </h1>
        {saving && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Saving...
          </div>
        )}
      </div>

      {treeData.nodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Building Your Interactive Family Tree</h3>
          <p className="text-gray-500 mb-6">Add family members and connect them visually by drawing lines between nodes</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleAddMember()}
              className="bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] text-white px-6 py-3 rounded-xl hover:shadow-lg transition transform hover:scale-105"
            >
              Add First Family Member
            </button>
            <button
              onClick={handleNuclearDelete}
              className="bg-red-800 text-white px-6 py-3 rounded-xl hover:bg-red-900 transition font-bold"
            >
              🔥 NUCLEAR DELETE
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <InteractiveFamilyTree
            initialNodes={treeData.nodes}
            initialEdges={treeData.edges}
            onSave={handleSaveTree}
            onAddMember={handleAddMember}
          />
        </div>
      )}

      {/* Family Member Form Modal */}
      <FamilyMemberForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMember(null);
        }}
        onSubmit={handleSubmitMember}
        editingMember={editingMember}
        isLoading={saving}
      />
    </div>
  );
}
