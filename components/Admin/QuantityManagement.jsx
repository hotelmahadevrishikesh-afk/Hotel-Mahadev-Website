"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus } from "lucide-react";
const QuantityManagement = ({ productData, packageId }) => {
  // State for three sections: 1, 2, and 8 persons
  const [priceRows, setPriceRows] = useState({
    one: [{ type: '', inr: '', usd: '' }],
    two: [{ type: '', inr: '', usd: '' }],
    eight: [{ type: '', inr: '', usd: '' }],
  });
  const [priceLog, setPriceLog] = useState([]); // [{ person, type, inr, usd }]
  const [saving, setSaving] = useState(false);

  // Add row to a section
  const handleAddRow = (section) => {
    setPriceRows(rows => ({
      ...rows,
      [section]: [...rows[section], { type: '', inr: '', usd: '' }],
    }));
  };

  // Handle input change
  const handleChange = (section, idx, field, value) => {
    setPriceRows(rows => ({
      ...rows,
      [section]: rows[section].map((row, i) => i === idx ? { ...row, [field]: value } : row),
    }));
  };

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Collect all rows with person count for prices array
      const prices = [
        ...priceRows.one.map(r => ({ person: '01', type: r.type, inr: Number(r.inr), usd: Number(r.usd) })),
        ...priceRows.two.map(r => ({ person: '02', type: r.type, inr: Number(r.inr), usd: Number(r.usd) })),
        ...priceRows.eight.map(r => ({ person: '08', type: r.type, inr: Number(r.inr), usd: Number(r.usd) })),
      ].filter(r => r.type && (r.inr || r.usd));
      const payload = {
        packages: packageId,
        prices
      };
      const res = await fetch('/api/productQuantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save quantity');
      }
      toast.success(editMode ? 'Quantity data updated successfully' : 'Quantity data saved successfully');
      setPriceRows({ one: [{ type: '', inr: '', usd: '' }], two: [{ type: '', inr: '', usd: '' }], eight: [{ type: '', inr: '', usd: '' }] }); // clear form
      setEditMode(false);
      fetchQuantities();
    } catch (err) {
      toast.error(err.message || 'Failed to save quantity');
    } finally {
      setSaving(false);
    }
  };
  // No need for allQuantities state; always show form and auto-fill
  const [viewDialog, setViewDialog] = useState({ open: false, data: null });
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Fetch quantity records for the current product only
  const fetchQuantities = async () => {
    if (!packageId) return;
    try {
      const res = await fetch(`/api/productQuantity?packages=${packageId}`);
      const data = await res.json();
      if (res.ok && data && data.prices && Array.isArray(data.prices) && data.prices.length) {
        handleEdit(data); // Pre-fill form with existing data
      } else {
        setPriceRows({ one: [{ type: '', inr: '', usd: '' }], two: [{ type: '', inr: '', usd: '' }], eight: [{ type: '', inr: '', usd: '' }] });
      }
    } catch {
      setPriceRows({ one: [{ type: '', inr: '', usd: '' }], two: [{ type: '', inr: '', usd: '' }], eight: [{ type: '', inr: '', usd: '' }] });
    }
  };


  useEffect(() => { fetchQuantities(); }, []);



  // Edit
  const handleEdit = (record) => {
    // record.prices is the array [{ person, type, inr, usd }]
    setPriceRows({
      one: (record.prices || []).filter(p => p.person === '01'),
      two: (record.prices || []).filter(p => p.person === '02'),
      eight: (record.prices || []).filter(p => p.person === '08')
    });
    setEditMode(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setPriceRows({ one: [{ type: '', inr: '', usd: '' }], two: [{ type: '', inr: '', usd: '' }], eight: [{ type: '', inr: '', usd: '' }] });
    setEditMode(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      // Include packageId in the DELETE request so backend can clear Product.quantity
      const res = await fetch(`/api/productQuantity?id=${deleteDialog.id}&packageId=${packageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      setDeleteDialog({ open: false, id: null });
      fetchQuantities();
    } catch {
      toast.error('Failed to delete');
    }
  };
  const form = (
    <form className="flex flex-col items-center w-full" style={{ maxWidth: 800 }} onSubmit={handleSave}>
      {/* Section: 01 Person */}
      <div className="w-full mb-6">
        <div className="font-bold text-green-900 text-lg mb-1">Base Price: 01 Person</div>
        <table className="w-full border border-gray-200 bg-[#f9f6ef] rounded-t-xl">
          <thead className="bg-[#fbe5c3]">
            <tr>
              <th className="p-2 text-left text-xs font-semibold">Accommodation Type</th>
              <th className="p-2 text-left text-xs font-semibold">In INR Price</th>
              <th className="p-2 text-left text-xs font-semibold">US Doller Price</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {priceRows.one.map((row, idx) => (
              <tr key={idx} className="border-b border-blue-200 bg-blue-50">
                <td className="p-1"><Input value={row.type} onChange={e => handleChange('one', idx, 'type', e.target.value)} className="rounded bg-white text-xs" placeholder="Type" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.inr} onChange={e => handleChange('one', idx, 'inr', e.target.value)} className="rounded bg-white text-xs" placeholder="INR" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.usd} onChange={e => handleChange('one', idx, 'usd', e.target.value)} className="rounded bg-white text-xs" placeholder="USD" /></td>
                <td className="p-1">
                  {idx === priceRows.one.length - 1 && (
                    <button type="button" className="bg-blue-700 text-white rounded px-2 text-lg font-bold mr-2" onClick={() => handleAddRow('one')}><Plus size={16} /></button>
                  )}
                  {priceRows.one.length > 1 && (
                    <button type="button" className="text-red-600" onClick={() => setPriceRows(rows => ({ ...rows, one: rows.one.filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Section: 02 Person */}
      <div className="w-full mb-6">
        <div className="font-bold text-green-900 text-lg mb-1">Base Price: 02 Person</div>
        <table className="w-full border border-gray-200 bg-[#f9f6ef] rounded-t-xl">
          <thead className="bg-[#fbe5c3]">
            <tr>
              <th className="p-2 text-left text-xs font-semibold">Accommodation Type</th>
              <th className="p-2 text-left text-xs font-semibold">In INR Price</th>
              <th className="p-2 text-left text-xs font-semibold">US Doller Price</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {priceRows.two.map((row, idx) => (
              <tr key={idx} className="border-b border-blue-200 bg-blue-50">
                <td className="p-1"><Input value={row.type} onChange={e => handleChange('two', idx, 'type', e.target.value)} className="rounded bg-white text-xs" placeholder="Type" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.inr} onChange={e => handleChange('two', idx, 'inr', e.target.value)} className="rounded bg-white text-xs" placeholder="INR" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.usd} onChange={e => handleChange('two', idx, 'usd', e.target.value)} className="rounded bg-white text-xs" placeholder="USD" /></td>
                <td className="p-1">
                  {idx === priceRows.two.length - 1 && (
                    <button type="button" className="bg-blue-700 text-white rounded px-2 py-1 text-lg font-bold mr-2" onClick={() => handleAddRow('two')}><Plus size={16} /></button>
                  )}
                  {priceRows.two.length > 1 && (
                    <button type="button" className="text-red-600" onClick={() => setPriceRows(rows => ({ ...rows, two: rows.two.filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       
      </div>
      {/* Section: 08 Person */}
      <div className="w-full mb-6">
        <div className="font-bold text-green-900 text-lg mb-1">Base Price: 08 Person <span className="text-xs">( minimum up to 8 person )</span></div>
        <table className="w-full border border-gray-200 bg-[#f9f6ef] rounded-t-xl">
          <thead className="bg-[#fbe5c3]">
            <tr>
              <th className="p-2 text-left text-xs font-semibold">Accommodation Type</th>
              <th className="p-2 text-left text-xs font-semibold">In INR Price</th>
              <th className="p-2 text-left text-xs font-semibold">US Doller Price</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {priceRows.eight.map((row, idx) => (
              <tr key={idx} className="border-b border-blue-200 bg-blue-50">
                <td className="p-1"><Input value={row.type} onChange={e => handleChange('eight', idx, 'type', e.target.value)} className="rounded bg-white text-xs" placeholder="Type" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.inr} onChange={e => handleChange('eight', idx, 'inr', e.target.value)} className="rounded bg-white text-xs" placeholder="INR" /></td>
                <td className="p-1"><Input type="number" inputMode="numeric" pattern="[0-9]*" value={row.usd} onChange={e => handleChange('eight', idx, 'usd', e.target.value)} className="rounded bg-white text-xs" placeholder="USD" /></td>
                <td className="p-1">
                  {idx === priceRows.eight.length - 1 && (
                    <button type="button" className="bg-blue-700 text-white rounded px-2 py-1 text-lg font-bold mr-2" onClick={() => handleAddRow('eight')}><Plus size={16} /></button>
                  )}
                  {priceRows.eight.length > 1 && (
                    <button type="button" className="text-red-600" onClick={() => setPriceRows(rows => ({ ...rows, eight: rows.eight.filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       
      </div>
      <button type="submit" className="bg-black text-white font-bold py-2 px-10 rounded mb-8">Data Save</button>
    </form>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {form}
    </div>
  );
};

export default QuantityManagement;
