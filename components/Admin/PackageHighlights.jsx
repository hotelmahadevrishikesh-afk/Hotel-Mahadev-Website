import { Trash } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PackageHighlights = ({ productData, packageId }) => {
  const [highlights, setHighlights] = useState(['']);
  const [highlightId, setHighlightId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch highlights on mount
  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    fetch(`/api/packageHighlight?packageId=${packageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.highlights) {
          setHighlights(data.highlights.length ? data.highlights : ['']);
          setHighlightId(data._id || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch highlights');
        setLoading(false);
      });
  }, [packageId]);

  const handleHighlightChange = (idx, value) => {
    setHighlights(prev => prev.map((h, i) => (i === idx ? value : h)));
  };

  const addHighlight = () => {
    setHighlights(prev => [...prev, '']);
  };

  const removeHighlight = idx => {
    setHighlights(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };

  const saveHighlights = async () => {
    setLoading(true);
    setError('');
    const filtered = highlights.map(h => h.trim()).filter(h => h);
    if (!filtered.length) {
      setError('Please enter at least one highlight.');
      setLoading(false);
      return;
    }
    try {
      let res, data;
      if (highlightId) {
        res = await fetch('/api/packageHighlight', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: highlightId, highlights: filtered })
        });
      } else {
        res = await fetch('/api/packageHighlight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId, highlights: filtered })
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('Highlights saved!');
      setHighlightId(data._id);
      setHighlights(data.highlights.length ? data.highlights : ['']);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 w-[60%] mx-auto">
      {/* Show package name in readonly input */}
      <div className="mb-2 w-[50%] mx-auto">
        <label className="block text-sm font-semibold mb-1">Package Name</label>
        <input
          type="text"
          value={productData?.title || ''}
          className="border rounded px-3 py-2 w-full bg-gray-100 font-bold text-green-700"
          readOnly
        />
      </div>
      {/* Highlights inputs */}
      <div className="flex flex-col gap-2">
        {highlights.map((highlight, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={highlight}
              onChange={e => handleHighlightChange(idx, e.target.value)}
              placeholder={`Highlight ${idx + 1}`}
              className="border rounded px-3 py-2 flex-1"
              disabled={loading}
            />
            {/* Add and Remove Buttons */}
            {idx === highlights.length - 1 && (
              <button
                type="button"
                onClick={addHighlight}
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                aria-label="Add highlight"
                disabled={loading}
              >
                Add
              </button>
            )}
            {highlights.length > 1 && (
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                aria-label="Remove highlight"
                disabled={loading}
              >
                <Trash/>
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Save button and messages */}
      <button
        type="button"
        onClick={saveHighlights}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
        disabled={loading}
      >
        {loading ? (highlightId ? 'Updating...' : 'Saving...') : (highlightId ? 'Update Highlights' : 'Save Highlights')}
      </button>
    </div>
  );
};

export default PackageHighlights