import { useState } from 'react';

export default function PhotoGrid({ photos = [], onDelete }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!photos.length) {
    return <p className="text-gray-500">No photos yet. Upload your first memory!</p>;
  }

  const handleDownload = async (photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${photo._id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download photo');
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p._id} className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition">
            <img 
              src={p.url} 
              alt={p.category} 
              className="w-full h-40 object-cover cursor-pointer" 
              onClick={() => setSelectedPhoto(p)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-between p-2 text-white text-xs">
              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownload(p); }} 
                  className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                  title="Download"
                >
                  ↓
                </button>
                {onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(p); }} 
                    className="bg-pink-500 hover:bg-pink-600 px-2 py-1 rounded"
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo View Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.category} 
                className="w-full max-h-[70vh] object-contain"
              />
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Uploaded: {new Date(selectedPhoto.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">Category: {selectedPhoto.category}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(selectedPhoto)}
                  className="rounded-xl px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                >
                  Download
                </button>
                {onDelete && (
                  <button 
                    onClick={() => { onDelete(selectedPhoto); setSelectedPhoto(null); }}
                    className="rounded-xl px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white shadow-md"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
