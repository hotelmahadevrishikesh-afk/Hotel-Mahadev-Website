import React from 'react';
import toast from "react-hot-toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
const PackagePrice = ({productData, packageId }) => {
  const productTitle = productData?.title || "";
  const [rows, setRows] = React.useState({
    one: [{ type: '', inr: '', usd: '' }],
    eight: [{ type: '', inr: '', usd: '' }],
    ten: [{ type: '', inr: '', usd: '' }],
    elevenToFourteen: [{ type: '', inr: '', usd: '' }],
    fifteenToTwentyEight: [{ type: '', inr: '', usd: '' }],
  });
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false); // true if updating
  React.useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    fetch(`/api/packagePrice?packageId=${packageId}`)
      .then(res => res.json())
      .then(data => {
        if (data && (data.onePerson || data.eightPerson|| data.tenPerson || data.elevenToFourteenPerson || data.fifteenToTwentyEight)) {
          setRows({ 
            one: Array.isArray(data.onePerson) && data.onePerson.length > 0 ? data.onePerson : [{ type: '', inr: '', usd: '' }],
            eight: Array.isArray(data.eightPerson) && data.eightPerson.length > 0 ? data.eightPerson : [{ type: '', inr: '', usd: '' }],
            ten: Array.isArray(data.tenPerson) && data.tenPerson.length > 0 ? data.tenPerson : [{ type: '', inr: '', usd: '' }],
            elevenToFourteen: Array.isArray(data.elevenToFourteenPerson) && data.elevenToFourteenPerson.length > 0 ? data.elevenToFourteenPerson : [{ type: '', inr: '', usd: '' }],
            fifteenToTwentyEight: Array.isArray(data.fifteenToTwentyEightPerson) && data.fifteenToTwentyEightPerson.length > 0 ? data.fifteenToTwentyEightPerson : [{ type: '', inr: '', usd: '' }],
          });
          setEditing(true);
        } else {
          setRows({
            one: [{ type: '', inr: '', usd: '' }],
            eight: [{ type: '', inr: '', usd: '' }],
            ten: [{ type: '', inr: '', usd: '' }],
            elevenToFourteen: [{ type: '', inr: '', usd: '' }],
            fifteenToTwentyEight: [{ type: '', inr: '', usd: '' }],
          });
          setEditing(false);
        }
      })
      .catch(() => toast.error("Failed to fetch package price"))
      .finally(() => setLoading(false));
  }, [packageId]);

  const handleAddRow = (section) => {
    setRows((prev) => ({
      ...prev,
      [section]: [...prev[section], { type: '', inr: '', usd: '' }],
    }));
  };

  const handleChange = (section, idx, field, value) => {
    setRows((prev) => {
      const updated = prev[section].map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      );
      return { ...prev, [section]: updated };
    });
};

// --- API Integration ---

const handleSave = async (e) => {
  if (e) e.preventDefault();
  if (!packageId) {
    toast.error("No packageId provided!");
    return;
  }
  setLoading(true);
  try {
    const payload = {
      packageId,
      onePerson: rows.one,
      eightPerson: rows.eight,
      tenPerson: rows.ten,
      elevenToFourteenPerson: rows.elevenToFourteen,
      fifteenToTwentyEightPerson: rows.fifteenToTwentyEight,
      };
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch('/api/packagePrice', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(editing ? "Package Price Updated" : "Package Price Saved");
      setEditing(true);
    } else {
      toast.error(data.error || 'Failed to save');
    }
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
}
  const renderSection = (label, sectionKey, subtitle = '') => (
    <div className="w-full mb-6">
      <div className="font-bold text-green-900 text-lg mb-1">
        {label} <span className="text-xs">{subtitle}</span>
      </div>
      <table className="w-full border border-gray-200 bg-[#f9f6ef] rounded-t-xl">
        <thead className="bg-[#fbe5c3]">
          <tr>
            <th className="p-2 text-left text-md font-semibold">Accommodation Type</th>
            <th className="p-2 text-left text-md font-semibold">In INR Price</th>
            <th className="p-2 text-left text-md font-semibold">US Dollar Price</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows[sectionKey].map((row, idx) => (
            <tr key={idx} className="border-b border-blue-200 bg-blue-50">
              <td className="p-1">
                <Input value={row.type} onChange={e => handleChange(sectionKey, idx, 'type', e.target.value)} className="rounded bg-white text-xs" placeholder="Type" />
              </td>
              <td className="p-1">
                <Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.inr} onChange={e => handleChange(sectionKey, idx, 'inr', e.target.value)} className="rounded bg-white text-xs" placeholder="INR" />
              </td>
              <td className="p-1">
                <Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.usd} onChange={e => handleChange(sectionKey, idx, 'usd', e.target.value)} className="rounded bg-white text-xs" placeholder="USD" />
              </td>
              <td className="p-1 flex items-center">
                {idx === rows[sectionKey].length - 1 && (
                  <button type="button" className="bg-blue-700 text-white rounded px-2 py-2 text-lg font-bold mr-2" onClick={() => handleAddRow(sectionKey)}><Plus size={16} /></button>
                )}
                {rows[sectionKey].length > 1 && (
                  <button type="button" className="text-red-600" onClick={() => setRows(prev => ({ ...prev, [sectionKey]: prev[sectionKey].filter((_, i) => i !== idx) }))}><Trash2 size={18} /></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <form className="flex flex-col items-center w-full" style={{ maxWidth: 800 }} onSubmit={handleSave}>
        <div className='mb-2'>
          <label className="block text-sm font-medium mb-1">Package Name</label>
          <input
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
            value={productTitle || 'N/A'}
            readOnly
          />
        </div>
      {renderSection('Base Price: 01 Person', 'one')}
      {renderSection('Base Price: 08 Person', 'eight', ' ( Minimum up to 8 person )')}
      {renderSection('Base Price: 10 Person', 'ten', ' ( Minimum up to 10 person )')}
      {renderSection('Base Price: 11 To 14 Person', 'elevenToFourteen', ' ( Minimum up to 14 person )')}
      {renderSection('Base Price: 15 To 28 Person', 'fifteenToTwentyEight', ' ( Minimum up to 28 person )')}
      <Button type="submit" className="bg-black text-white font-bold py-2 px-10 rounded mb-8 mt-4">Data Save</Button>
    </form>
  );
}

export default PackagePrice 