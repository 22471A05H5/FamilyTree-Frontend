import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

// Simple form to create/update a family member with optional parent linkage
export default function FamilyForm() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentParent, setCurrentParent] = useState(null); // context node for quick-add
  const editId = searchParams.get('editId');

  const [form, setForm] = useState({
    name: '',
    relation: '',
    gender: 'other',
    dob: '',
    occupation: '',
    address_houseNo: '',
    address_place: '',
    address_city: '',
    address_state: '',
    address_country: '',
    parentId: '',
    photo: null,
  });

  const loadMembers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/family/${user.id}`);
      // flatten tree for parent selection
      const list = [];
      const walk = (node, depth = 0) => {
        node.forEach((n) => {
          list.push({ _id: n._id, name: n.name, relation: n.relation, depth });
          if (n.children?.length) walk(n.children, depth + 1);
        });
      };
      walk(data);
      setMembers(list);
      // If currentParent no longer exists, clear it
      if (currentParent && !list.find((m) => m._id === currentParent._id)) {
        setCurrentParent(null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill from query params (?parentId=...&relation=...&gender=...)
  useEffect(() => {
    const qpParent = searchParams.get('parentId');
    const qpRelation = searchParams.get('relation');
    const qpGender = searchParams.get('gender');
    if (qpParent || qpRelation || qpGender) {
      setForm((f) => ({
        ...f,
        parentId: qpParent ?? f.parentId,
        relation: qpRelation ?? f.relation,
        gender: qpGender ?? f.gender,
      }));
      // If parentId provided, mark currentParent in sidebar (if present after load)
      const maybe = members.find((m) => m._id === qpParent);
      if (maybe) setCurrentParent(maybe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load existing member for edit mode
  useEffect(() => {
    (async () => {
      if (!editId) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/family/member/${editId}`);
        setForm((f) => ({
          ...f,
          name: data.name || '',
          relation: data.relation || '',
          gender: data.gender || 'other',
          dob: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : '',
          occupation: data.occupation || '',
          parentId: data.parentId || '',
          address_houseNo: data.address?.houseNo || '',
          address_place: data.address?.place || '',
          address_city: data.address?.city || '',
          address_state: data.address?.state || '',
          address_country: data.address?.country || '',
          photo: null,
        }));
        if (data.parentId) {
          const maybe = members.find((m) => m._id === data.parentId);
          if (maybe) setCurrentParent(maybe);
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load member');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm((f) => ({ ...f, photo: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });
      if (editId) {
        await api.put(`/family/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Member updated');
      } else {
        await api.post('/family', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Member created');
      }
      setForm({
        name: '', relation: '', gender: 'other', dob: '', occupation: '',
        address_houseNo: '', address_place: '', address_city: '', address_state: '', address_country: '', parentId: '', photo: null,
      });
      await loadMembers();
    } catch (e) {
      setError(e?.response?.data?.message || (editId ? 'Failed to update member' : 'Failed to create member'));
    }
  };

  const setQuick = (preset) => {
    // preset: { relation, gender, parentFromContext: boolean, clearParent?: boolean }
    setForm((f) => ({
      ...f,
      relation: preset.relation,
      gender: preset.gender || f.gender,
      parentId: preset.clearParent ? '' : (preset.parentFromContext && currentParent ? currentParent._id : f.parentId),
    }));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent">{editId ? 'Edit Family Member' : 'Add Family Member'}</h1>

      {/* Quick-add toolbar */}
      <div className="rounded-2xl border border-white/40 bg-white/90 shadow-xl p-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Quick add:</span>
        <button type="button" onClick={() => setQuick({ relation: 'self', gender: 'male', clearParent: true })} className="px-3 py-1.5 rounded-xl border border-[#00FFFF]/40 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(0,255,255,0.35)] transition">Self</button>
        <button type="button" onClick={() => setQuick({ relation: 'wife', gender: 'female', parentFromContext: true })} className="px-3 py-1.5 rounded-xl border border-[#8A2BE2]/40 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(138,43,226,0.35)] transition">Wife</button>
        <button type="button" onClick={() => setQuick({ relation: 'husband', gender: 'male', parentFromContext: true })} className="px-3 py-1.5 rounded-xl border border-[#1E90FF]/40 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(30,144,255,0.35)] transition">Husband</button>
        <button type="button" onClick={() => setQuick({ relation: 'son', gender: 'male', parentFromContext: true })} className="px-3 py-1.5 rounded-xl border border-[#00FFFF]/40 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(0,255,255,0.35)] transition">Son</button>
        <button type="button" onClick={() => setQuick({ relation: 'daughter', gender: 'female', parentFromContext: true })} className="px-3 py-1.5 rounded-xl border border-[#8A2BE2]/40 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(138,43,226,0.35)] transition">Daughter</button>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, name: user?.name || f.name, relation: 'self', parentId: '' }))}
          className="px-3 py-1.5 rounded-xl border border-[#00FFFF]/60 text-[#0f172a] bg-white hover:shadow-[0_0_14px_rgba(0,255,255,0.5)] transition"
          title="Prefill with your profile name as a root member"
        >
          Use my profile
        </button>
        <div className="ml-auto text-xs text-gray-600">Context parent: {currentParent ? `${currentParent.name} (${currentParent.relation})` : 'None selected'}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {editId && (
            <div className="rounded-xl p-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800">
              Editing existing member. Leave the Photo empty to keep the current photo.
            </div>
          )}
          {error && <div className="text-red-600">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-xl p-3" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Relation</label>
              <input name="relation" value={form.relation} onChange={handleChange} placeholder="self, wife, son, daughter, ..." className="w-full border rounded-xl p-3" required />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded-xl p-3">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border rounded-xl p-3" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Occupation</label>
              <input name="occupation" value={form.occupation} onChange={handleChange} className="w-full border rounded-xl p-3" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Parent</label>
              <select name="parentId" value={form.parentId} onChange={handleChange} className="w-full border rounded-xl p-3">
                <option value="">(none)</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{'\u00A0'.repeat(m.depth * 2)}{m.name} ({m.relation})</option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">Tip: Click a member on the right to set them as the context parent.</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Photo</label>
              <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Address</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="address_houseNo" value={form.address_houseNo} onChange={handleChange} placeholder="House No" className="w-full border rounded-xl p-3" />
              <input name="address_place" value={form.address_place} onChange={handleChange} placeholder="Place" className="w-full border rounded-xl p-3" />
              <input name="address_city" value={form.address_city} onChange={handleChange} placeholder="City" className="w-full border rounded-xl p-3" />
              <input name="address_state" value={form.address_state} onChange={handleChange} placeholder="State" className="w-full border rounded-xl p-3" />
              <input name="address_country" value={form.address_country} onChange={handleChange} placeholder="Country" className="w-full border rounded-xl p-3" />
            </div>
          </div>

          <button className="rounded-2xl px-6 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-xl transition transform hover:scale-105 active:scale-95">{editId ? 'Update Member' : 'Save Member'}</button>
        </form>

        <aside className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Existing Members</h3>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : members.length ? (
            <ul className="space-y-2 max-h-[400px] overflow-auto">
              {members.map((m) => {
                const active = currentParent && currentParent._id === m._id;
                return (
                  <li
                    key={m._id}
                    className={["text-sm px-2 py-1 rounded-xl cursor-pointer", active ? "bg-gradient-to-r from-[#00FFFF]/10 to-[#8A2BE2]/10 text-[#0f172a] ring-1 ring-[#00FFFF]/40" : "text-gray-600 hover:bg-white"].join(' ')}
                    onClick={() => { setCurrentParent(m); setForm((f) => ({ ...f, parentId: m._id })); }}
                    title="Set as context parent"
                  >
                    {'\u00A0'.repeat(m.depth * 2)}• {m.name} <span className="text-gray-400">({m.relation})</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-500">No members yet</div>
          )}
        </aside>
      </div>
    </div>
  );
}
