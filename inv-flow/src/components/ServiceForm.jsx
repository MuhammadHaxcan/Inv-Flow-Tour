import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Service</label>
                <select 
                    value={service} 
                    onChange={(e) => handleServiceChange(e.target.value)} 
                    className="form-select"
                >
                    <option value="">Select Service</option>
                    {servicesList.map((s, i) => (
                        <option key={i} value={s.name}>{s.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Rate (AED)</label>
                <input 
                    type="number" 
                    value={rate} 
                    onChange={(e) => setRate(e.target.value)} 
                    className="form-control" 
                    placeholder="0" 
                />
            </div>
            <div className="d-flex gap-2">
                <button 
                    type="submit" 
                    className="btn btn-primary flex-grow-1"
                >
                    Add Service
                </button>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="btn btn-outline-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;