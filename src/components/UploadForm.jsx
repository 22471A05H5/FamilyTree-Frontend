import { useState } from 'react';
import api from '../api';

export default function UploadForm({ category, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSelect = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Please select an image');
    try {
      setLoading(true);
      const form = new FormData();
      form.append('photo', file);
      form.append('category', category);
      const { data } = await api.post('/photos/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      if (onUploaded) onUploaded(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <div className="border-2 border-dashed border-pink-300 rounded-xl bg-pink-50 hover:bg-pink-100 flex flex-col items-center justify-center p-8 transition cursor-pointer">
          <span className="text-gray-600">{file ? file.name : 'Click to choose a photo'}</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
        </div>
        <input type="file" accept="image/*" onChange={onSelect} className="hidden" />
      </label>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
