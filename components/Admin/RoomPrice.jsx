"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus } from "lucide-react";
const RoomPrice = ({ roomData, roomId }) => {

  const [selectedPax, setSelectedPax] = useState(); // Only one of 01 or 02 Pax
  const [showExtraBed, setShowExtraBed] = useState(false);
  const [prices, setPrices] = useState({
    "01 Pax": { price: '', oldPrice: '', cgst: '', sgst: '' },
    "02 Pax": { price: '', oldPrice: '', cgst: '', sgst: '' },
    "Extra Bed": { price: '', oldPrice: '', cgst: '', sgst: '' }
  });
  const [editablePax, setEditablePax] = useState("01 Pax");



  const roomName = roomData?.title || "";


  const [saving, setSaving] = useState(false);
  const [allQuantities, setAllQuantities] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Fetch quantity records for the current product only
  const fetchQuantities = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/roomPrice?product=${roomId}`);
      const data = await res.json();
      // If API returns a single object, wrap in array for consistency
      if (res.ok && data && (Array.isArray(data) ? data.length : data._id)) {
        setAllQuantities(Array.isArray(data) ? data : [data]);
      } else {
        setAllQuantities([]);
      }
    } catch {
      setAllQuantities([]);
    }
  };

  // Fetch RoomPrice data and populate form fields
  useEffect(() => {
    async function fetchRoomPrice() {
      if (!roomId) return;
      try {
        const res = await fetch(`/api/roomPrice?product=${roomId}`);
        const data = await res.json();
        if (data && Array.isArray(data.prices)) {
          const newPrices = {
            "01 Pax": { price: '', oldPrice: '', cgst: '', sgst: '' },
            "02 Pax": { price: '', oldPrice: '', cgst: '', sgst: '' },
            "Extra Bed": { price: '', oldPrice: '', cgst: '', sgst: '' }
          };
          data.prices.forEach(p => {
            if (p.type === "01 Pax" || p.type === "02 Pax" || p.type === "Extra Bed") {
              newPrices[p.type] = {
                price: p.amount?.toString() ?? '',
                oldPrice: p.oldPrice?.toString() ?? '',
                cgst: p.cgst?.toString() ?? '',
                sgst: p.sgst?.toString() ?? ''
              }
            }
          });
          setPrices(newPrices);
          setShowExtraBed(!!data.prices.find(p => p.type === "Extra Bed"));
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchRoomPrice();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare variants for RoomPrice model: type, price, oldPrice, cgst, sgst
      const allVariants = [
        {
          type: "01 Pax",
          amount: prices["01 Pax"].price ? Number(prices["01 Pax"].price) : 0,
          oldPrice: prices["01 Pax"].oldPrice ? Number(prices["01 Pax"].oldPrice) : 0,
          cgst: prices["01 Pax"].cgst ? Number(prices["01 Pax"].cgst) : 0,
          sgst: prices["01 Pax"].sgst ? Number(prices["01 Pax"].sgst) : 0,
        },
        {
          type: "02 Pax",
          amount: prices["02 Pax"].price ? Number(prices["02 Pax"].price) : 0,
          oldPrice: prices["02 Pax"].oldPrice ? Number(prices["02 Pax"].oldPrice) : 0,
          cgst: prices["02 Pax"].cgst ? Number(prices["02 Pax"].cgst) : 0,
          sgst: prices["02 Pax"].sgst ? Number(prices["02 Pax"].sgst) : 0,
        },
        {
          type: "Extra Bed",
          amount: prices["Extra Bed"].price ? Number(prices["Extra Bed"].price) : 0,
          oldPrice: prices["Extra Bed"].oldPrice ? Number(prices["Extra Bed"].oldPrice) : 0,
          cgst: prices["Extra Bed"].cgst ? Number(prices["Extra Bed"].cgst) : 0,
          sgst: prices["Extra Bed"].sgst ? Number(prices["Extra Bed"].sgst) : 0,
        }
      ];
      // Only keep variants with at least one non-zero value
      const variants = allVariants.filter(
        v => v.amount || v.oldPrice || v.cgst || v.sgst
      );
      const payload = {
        room: roomId,
        prices: variants
      };
      const res = await fetch('/api/roomPrice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save quantity');
      }
      toast.success(editMode ? 'Quantity data updated successfully' : 'Quantity data saved successfully');
      setEditMode(false);
      fetchQuantities();
    } catch (err) {
      toast.error(err.message || 'Failed to save quantity');
    } finally {
      setSaving(false);
    }
  };


  // Cancel edit
  const handleCancelEdit = () => {
    setRows([{ size: '', price: '', qty: '', color: '', weight: '' }]);
    setEditMode(false);
  };
  // --- FORM ---
  const form = (
    <form className="flex flex-col items-center" style={{ maxWidth: 1200 }} onSubmit={handleSubmit}>
      <h3 className="font-semibold my-2 text-center text-xl">Create Room Price</h3>
      <div className="w-full bg-white rounded shadow p-4">
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-bold mb-2 text-md">Room Name</Label>
          <Input
            className="mb-4 w-80 font-black text-center border-gray-300"
            value={roomName}
            disabled
            // {productName ? {} : { border: '2px solid red', color: 'red' }}
            placeholder={roomName ? "Room Name" : "Room Name not found"}
          />
          {!roomName && (
            <div style={{ color: 'red', marginTop: '4px', fontWeight: 'bold' }}>
              Room name not found!
            </div>
          )}
        </div>
        <h5 className="font-semibold mb-2 text-center text-xl">Room Price Table</h5>
        <div className="flex gap-4 mb-2">
          <label>
            <input
              type="radio"
              name="editablePax"
              checked={editablePax === "01 Pax"}
              onChange={() => setEditablePax("01 Pax")}
            />
            01 Pax
          </label>
          <label>
            <input
              type="radio"
              name="editablePax"
              checked={editablePax === "02 Pax"}
              onChange={() => setEditablePax("02 Pax")}
            />
            02 Pax
          </label>
          <div className="flex items-center gap-2 ml-8">
            <label htmlFor="extrabed-switch">Extra Bed</label>
            <input
              id="extrabed-switch"
              type="checkbox"
              checked={showExtraBed}
              onChange={e => setShowExtraBed(e.target.checked)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-center">Price For</th>
                <th className="border px-2 py-1 text-center">New Price</th>
                <th className="border px-2 py-1 text-center">Old Price</th>
                <th className="border px-2 py-1 text-center">CGST Tax (%)</th>
                <th className="border px-2 py-1 text-center">SGST Tax (%)</th>
              </tr>
            </thead>
            <tbody>
              {/* Only one of 01 Pax or 02 Pax */}
              <tr>
                <td className="border px-2 py-1 text-center">01 Pax</td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-32 bg-gray-100 rounded"
                    placeholder="New Price"
                    value={prices["01 Pax"].price}
                    onChange={e => setPrices(p => ({ ...p, ["01 Pax"]: { ...p["01 Pax"], price: e.target.value } }))}
                    disabled={editablePax !== "01 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-32 bg-gray-100 rounded"
                    placeholder="Old Price"
                    value={prices["01 Pax"].oldPrice}
                    onChange={e => setPrices(p => ({ ...p, ["01 Pax"]: { ...p["01 Pax"], oldPrice: e.target.value } }))}
                    disabled={editablePax !== "01 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-24 bg-gray-100 rounded"
                    placeholder="CGST %"
                    value={prices["01 Pax"].cgst}
                    onChange={e => setPrices(p => ({ ...p, ["01 Pax"]: { ...p["01 Pax"], cgst: e.target.value } }))}
                    disabled={editablePax !== "01 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-24 bg-gray-100 rounded"
                    placeholder="SGST %"
                    value={prices["01 Pax"].sgst}
                    onChange={e => setPrices(p => ({ ...p, ["01 Pax"]: { ...p["01 Pax"], sgst: e.target.value } }))}
                    disabled={editablePax !== "01 Pax"}
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 text-center">02 Pax</td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-32 bg-gray-100 rounded"
                    placeholder="New Price"
                    value={prices["02 Pax"].price}
                    onChange={e => setPrices(p => ({ ...p, ["02 Pax"]: { ...p["02 Pax"], price: e.target.value } }))}
                    disabled={editablePax !== "02 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-32 bg-gray-100 rounded"
                    placeholder="Old Price"
                    value={prices["02 Pax"].oldPrice}
                    onChange={e => setPrices(p => ({ ...p, ["02 Pax"]: { ...p["02 Pax"], oldPrice: e.target.value } }))}
                    disabled={editablePax !== "02 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-24 bg-gray-100 rounded"
                    placeholder="CGST %"
                    value={prices["02 Pax"].cgst}
                    onChange={e => setPrices(p => ({ ...p, ["02 Pax"]: { ...p["02 Pax"], cgst: e.target.value } }))}
                    disabled={editablePax !== "02 Pax"}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-24 bg-gray-100 rounded"
                    placeholder="SGST %"
                    value={prices["02 Pax"].sgst}
                    onChange={e => setPrices(p => ({ ...p, ["02 Pax"]: { ...p["02 Pax"], sgst: e.target.value } }))}
                    disabled={editablePax !== "02 Pax"}
                  />
                </td>
              </tr>
              {showExtraBed && (
                <tr>
                  <td className="border px-2 py-1 text-center">Extra Bed</td>
                  <td className="border px-2 py-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-32 bg-gray-100 rounded"
                      placeholder="New Price"
                      value={prices["Extra Bed"].price}
                      onChange={e => setPrices(p => ({ ...p, ["Extra Bed"]: { ...p["Extra Bed"], price: e.target.value } }))}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-32 bg-gray-100 rounded"
                      placeholder="Old Price"
                      value={prices["Extra Bed"].oldPrice}
                      onChange={e => setPrices(p => ({ ...p, ["Extra Bed"]: { ...p["Extra Bed"], oldPrice: e.target.value } }))}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-24 bg-gray-100 rounded"
                      placeholder="CGST %"
                      value={prices["Extra Bed"].cgst}
                      onChange={e => setPrices(p => ({ ...p, ["Extra Bed"]: { ...p["Extra Bed"], cgst: e.target.value } }))}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-24 bg-gray-100 rounded"
                      placeholder="SGST %"
                      value={prices["Extra Bed"].sgst}
                      onChange={e => setPrices(p => ({ ...p, ["Extra Bed"]: { ...p["Extra Bed"], sgst: e.target.value } }))}
                    />
                  </td>
                </tr>
              )}
             
            </tbody>
          </table>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <Button type="submit" className="bg-red-500 font-bold px-5" disabled={saving}>{editMode ? 'Update' : 'Data Save'}</Button>
          {editMode && (
            <Button type="button" className="bg-gray-400 font-bold px-5" onClick={handleCancelEdit}>Cancel</Button>
          )}
        </div>
      </div>
    </form>
  )


  return (
    <div className="flex flex-col items-center w-full">
      {form}
    </div>
  );
};

export default RoomPrice;
