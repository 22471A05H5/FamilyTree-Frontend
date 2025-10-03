import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function NodeCard({ node, onSelect, onDelete }) {
  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(node)}
        className="bg-white/95 rounded-2xl shadow-md p-4 flex flex-col items-center gap-2 min-w-[130px] border border-white/50 hover:shadow-xl transition cursor-pointer relative overflow-hidden"
        title={`${node.name}${node.relation ? ' • ' + node.relation : ''}`}
        aria-label={`Open details for ${node.name}`}
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 blur-sm bg-gradient-to-r from-[#1E90FF]/20 via-[#8A2BE2]/20 to-[#00FFFF]/20" />
        <img
          src={node.photo || 'https://via.placeholder.com/80x80?text=Photo'}
          alt={node.name}
          className="w-24 h-24 rounded-full object-cover border border-white shadow-md group-hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] group-hover:ring-2 group-hover:ring-[#00FFFF]/60 transition"
        />
      </button>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node); }}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition bg-pink-500 hover:bg-pink-600 text-white text-xs px-2 py-1 rounded-full shadow"
          title="Delete member"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function TreeBranch({ node, onSelect, onDelete }) {
  // Safety checks for node data
  if (!node || !node._id) {
    console.warn('Invalid node data:', node);
    return null;
  }
  
  const children = Array.isArray(node.children) ? node.children : [];
  const spouse = node.spouse || null;
  const realChildren = children; // All children are actual children, not spouses

  return (
    <div className="flex flex-col items-center">
      {/* Couple row */}
      <div className="relative flex items-center gap-6">
        <NodeCard node={node} onSelect={onSelect} onDelete={onDelete} />
        {spouse && (
          <>
            {/* Red connecting line between spouses like in the image */}
            <div className="relative flex items-center">
              <div className="w-16 h-1 bg-red-500 shadow-md" />
              {/* Heart symbol in white circle like in the image */}
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-red-500 flex items-center justify-center">
                <span className="text-red-500 text-sm">♥</span>
              </div>
            </div>
            <NodeCard node={spouse} onSelect={onSelect} onDelete={onDelete} />
          </>
        )}
      </div>

      {/* Children positioned under the couple */}
      {realChildren.length > 0 && (
        <div className="relative mt-8">
          {/* Red connecting lines like in the family tree image */}
          <div className="absolute w-full" style={{ top: '-40px', height: '40px' }}>
            {/* Main vertical line from parents down - RED like in image */}
            <div 
              className="absolute w-1 bg-red-500 shadow-md"
              style={{
                height: '20px',
                left: '50%',
                top: '0px',
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* Horizontal distribution line for multiple children - RED */}
            {realChildren.length > 1 && (
              <div 
                className="absolute h-1 bg-red-500 shadow-md"
                style={{
                  width: `${(realChildren.length - 1) * 12}rem`,
                  left: `calc(50% - ${((realChildren.length - 1) * 12) / 2}rem)`,
                  top: '20px'
                }}
              />
            )}
          </div>
          
          {/* Individual child connections - RED lines */}
          {realChildren.map((child, index) => {
            const hasSpouse = child.spouse;
            const totalChildren = realChildren.length;
            const childPosition = index - (totalChildren - 1) / 2; // -1, 0, 1 for 3 children
            const offsetX = childPosition * 12; // 12rem gap between children
            
            return (
              <div key={`child-branch-${child._id}`} className="absolute" style={{ top: '-40px' }}>
                {/* Vertical line down to this specific child - RED */}
                <div 
                  className="absolute w-1 bg-red-500 shadow-md"
                  style={{
                    height: '20px',
                    left: `calc(50% + ${offsetX}rem)`,
                    top: totalChildren > 1 ? '20px' : '20px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            );
          })}
          
          <div className="flex items-start justify-center gap-12">
            {realChildren.map((child, index) => (
              <div key={child._id} className="relative flex flex-col items-center">
                <TreeBranch node={child} onSelect={onSelect} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyTree() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/family/${user.id}`);
      setTree(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load tree');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (node) => {
    if (!node?._id) {
      alert('Invalid member data');
      return;
    }
    if (!window.confirm(`Delete ${node.name} and their subtree?`)) return;
    try {
      setLoading(true);
      await api.delete(`/family/${node._id}`);
      await load();
      setSelected(null); // Close modal after deletion
    } catch (e) {
      console.error('Delete error:', e);
      alert(e?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent">Family Tree</h1>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-auto">
          <div className="min-w-[900px] flex flex-col items-center gap-12">
            {tree.length === 0 ? (
              <div className="text-gray-500">No members yet. Add your first member in Family Form.</div>
            ) : (
              tree.map((root) => (
                <TreeBranch key={root._id} node={root} onSelect={setSelected} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      )}

      {selected && selected._id && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <img src={selected.photo || 'https://via.placeholder.com/80x80?text=Photo'} alt={selected.name || 'Family Member'} className="w-20 h-20 rounded-full object-cover border" />
              <div>
                <div className="text-xl font-semibold text-gray-700">{selected.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{selected.relation || 'No relation specified'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {selected.gender && <div><span className="font-semibold">Gender:</span> {selected.gender}</div>}
              {selected.dob && <div><span className="font-semibold">DOB:</span> {new Date(selected.dob).toLocaleDateString()}</div>}
              {selected.occupation && <div><span className="font-semibold">Occupation:</span> {selected.occupation}</div>}
              {selected.address && (
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-500">
                    {[selected.address.houseNo, selected.address.place, selected.address.city, selected.address.state, selected.address.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-md"
                  onClick={() => {
                    const spouseRel = (selected?.gender || '').toLowerCase() === 'male' ? 'wife' : 'husband';
                    const spouseGender = spouseRel === 'wife' ? 'female' : 'male';
                    navigate(`/family/form?parentId=${selected._id}&relation=${spouseRel}&gender=${spouseGender}`);
                  }}
                >
                  Add Spouse
                </button>
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-gradient-to-r from-[#1E90FF] to-[#00FFFF] text-white shadow-md"
                  onClick={() => navigate(`/family/form?editId=${selected._id}`)}
                >
                  Edit
                </button>
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-gradient-to-r from-[#00FFFF] to-[#1E90FF] text-[#0f172a] shadow-md"
                  onClick={() => navigate(`/family/form?parentId=${selected._id}&relation=son&gender=male`)}
                >
                  Add Son
                </button>
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-gradient-to-r from-[#00FFFF] to-[#8A2BE2] text-[#0f172a] shadow-md"
                  onClick={() => navigate(`/family/form?parentId=${selected._id}&relation=daughter&gender=female`)}
                >
                  Add Daughter
                </button>
              </div>
              <button className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-xl shadow-md" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
