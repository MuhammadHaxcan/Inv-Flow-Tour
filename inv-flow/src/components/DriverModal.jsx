import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const DriverModal = ({ show, onClose, onSave, drivers, currentDriver = '' }) => {
    const [assignedDriver, setAssignedDriver] = useState('');
    const [assignmentDate, setAssignmentDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (show) {
            setAssignedDriver(currentDriver || '');
            setAssignmentDate(new Date().toISOString().slice(0, 10));
            setNotes('');
        }
    }, [show, currentDriver]);

    const handleSubmit = () => {
        if (!assignedDriver) return;
        onSave(assignedDriver, assignmentDate, notes);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title="Assign Driver">
            <div className="mb-3">
                <label className="form-label">Select Driver</label>
                <select
                    value={assignedDriver}
                    onChange={(e) => setAssignedDriver(e.target.value)}
                    className="form-select"
                >
                    <option value="">Choose a driver</option>
                    {drivers.map((driver) => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Assignment Date</label>
                <input 
                    type="date" 
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                    className="form-control" 
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-control" 
                    rows="3" 
                    placeholder="Add any special instructions"
                ></textarea>
            </div>
            <div className="d-flex gap-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary flex-grow-1"
                    disabled={!assignedDriver}
                >
                    Assign Driver
                </button>
                <button 
                    type="button"
                    onClick={onClose} 
                    className="btn btn-outline-secondary"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};

export default DriverModal;