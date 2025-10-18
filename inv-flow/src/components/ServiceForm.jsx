import React, { useState, useEffect } from 'react';

const ServiceForm = ({ servicesList, onSave, onCancel, invoice }) => {
    const [service, setService] = useState('');
    const [rate, setRate] = useState('');

    useEffect(() => {
        if (invoice) {
            setService('');
            setRate('');
        }
    }, [invoice]);

    const handleServiceChange = (val) => {
        setService(val);
        const found = servicesList.find(s => s.name === val);
        if (found) setRate(found.rate);
        else setRate('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!service || !rate) return;
        onSave(service, rate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select 
                    value={service} 
                    onChange={(e) => handleServiceChange(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                >
                    <option value="">Select Service</option>
                    {servicesList.map((s, i) => (
                        <option key={i} value={s.name}>{s.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (AED)</label>
                <input 
                    type="number" 
                    value={rate} 
                    onChange={(e) => setRate(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" 
                    placeholder="0" 
                />
            </div>
            <div className="flex gap-3 pt-2">
                <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium"
                >
                    Add Service
                </button>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;