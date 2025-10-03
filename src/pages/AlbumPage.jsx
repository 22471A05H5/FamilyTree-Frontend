import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import UploadForm from '../components/UploadForm';
import PhotoGrid from '../components/PhotoGrid';

export default function AlbumPage() {
  const { category } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/photos`, { params: { category } });
      setPhotos(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleUploaded = (newPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/${photo._id}`);
      setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const pretty = (key) => {
    if (key === 'marriage') return 'Marriage';
    if (key === 'birthday') return 'Birthday';
    if (key === 'other') return 'Other Occasion';
    return key;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">{pretty(category)} Album</h1>
        <Link to="/dashboard" className="text-pink-500 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Upload a new photo</h2>
        <UploadForm category={category} onUploaded={handleUploaded} />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Photos</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <PhotoGrid photos={photos} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
