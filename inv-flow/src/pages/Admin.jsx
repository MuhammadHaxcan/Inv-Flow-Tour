import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Lock, User as UserIcon, Image, PenTool, Check, Upload, X } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import SignatureCanvas from '../components/SignatureCanvas';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import { usePermissions } from '../hooks/usePermissions';
import 'bootstrap/dist/css/bootstrap.min.css';

const Admin = () => {
    const {
        users, roles, permissions, signatures, companySettings,
        loadingStates,
        loadUsers, loadRoles, loadPermissions, loadSignatures, loadCompanySettings,
        createUser, updateUser, deleteUser,
        createRole, updateRole, deleteRole,
        createSignature, setActiveSignature, deleteSignature,
        updateEmailSettings, updateLogo, clearLogo
    } = useAdmin();

    const [activeTab, setActiveTab] = useState('users');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentRole, setCurrentRole] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: [],
        isActive: true
    });
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissionIds: []
    });
    const [smtpForm, setSmtpForm] = useState({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: '',
        enableSsl: true
    });
    const logoInputRef = useRef(null);

    // Confirmation modals state
    const [deleteUserModal, setDeleteUserModal] = useState({ show: false, user: null });
    const [deleteRoleModal, setDeleteRoleModal] = useState({ show: false, role: null });
    const [deleteSignatureModal, setDeleteSignatureModal] = useState({ show: false, signature: null });
    const [clearLogoModal, setClearLogoModal] = useState(false);
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    // Permissions
    const { 
        canWriteUsers, canDeleteUsers,
        canWriteRoles, canDeleteRoles,
        canWriteSignatures, canDeleteSignatures,
        canWriteCompanySettings
    } = usePermissions();

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

    const tabs = [
        { id: 'users', label: 'Users', icon: UserIcon },
        { id: 'roles', label: 'Roles', icon: Lock },
        { id: 'invoice-settings', label: 'Invoice Settings', icon: PenTool }
    ];

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers(true);
            loadRoles(true);
        } else if (activeTab === 'roles') {
            loadRoles(true);
            loadPermissions(true);
        } else if (activeTab === 'invoice-settings') {
            loadSignatures(true);
            loadCompanySettings(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Sync SMTP form with latest company settings when loaded
    useEffect(() => {
        if (companySettings) {
            setSmtpForm({
                smtpHost: companySettings.smtpHost || '',
                smtpPort: companySettings.smtpPort?.toString() || '',
                smtpUser: companySettings.smtpUser || '',
                smtpPassword: '', // never prefill passwords
                fromEmail: companySettings.fromEmail || companySettings.email || '',
                fromName: companySettings.fromName || companySettings.companyName || '',
                enableSsl: companySettings.enableSsl ?? true
            });
        }
    }, [companySettings]);

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                const updateData = {
                    email: userForm.email,
                    fullName: userForm.fullName,
                    roleIds: userForm.roleIds,
                    isActive: userForm.isActive
                };
                // Only include password if it's not empty (leave blank to keep existing)
                if (userForm.password.trim()) {
                    updateData.password = userForm.password;
                }
                await updateUser(currentUser.id, updateData);
            } else {
                await createUser(userForm);
            }
            setShowUserModal(false);
            resetUserForm();
            // Force reload to ensure fresh data
            await loadUsers(true);
            await loadRoles(true);
        } catch (error) {
            showAlert('Error saving user: ' + error.message, 'error');
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await updateRole(currentRole.id, roleForm);
            } else {
                await createRole(roleForm);
            }
            setShowRoleModal(false);
            resetRoleForm();
            // Force reload to ensure fresh data
            await loadRoles(true);
        } catch (error) {
            showAlert('Error saving role: ' + error.message, 'error');
        }
    };

    const handleDeleteUser = async () => {
        try {
            await deleteUser(deleteUserModal.user.id);
            setDeleteUserModal({ show: false, user: null });
            // Force reload to ensure fresh data
            await loadUsers(true);
        } catch (error) {
            showAlert('Error deleting user: ' + error.message, 'error');
        }
    };

    const handleDeleteRole = async () => {
        try {
            await deleteRole(deleteRoleModal.role.id);
            setDeleteRoleModal({ show: false, role: null });
            // Force reload to ensure fresh data
            await loadRoles(true);
        } catch (error) {
            showAlert('Error deleting role: ' + error.message, 'error');
        }
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setUserForm({
            username: user.username,
            email: user.email,
            password: '',
            fullName: user.fullName || '',
            roleIds: user.roles.map(r => roles.find(role => role.name === r)?.id).filter(Boolean),
            isActive: user.isActive !== undefined ? user.isActive : true
        });
        setShowUserModal(true);
    };

    const handleEditRole = (role) => {
        setCurrentRole(role);
        setRoleForm({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissionIds || []
        });
        setShowRoleModal(true);
    };

    const resetUserForm = () => {
        setCurrentUser(null);
        setUserForm({
            username: '',
            email: '',
            password: '',
            fullName: '',
            roleIds: [],
            isActive: true
        });
    };

    const resetRoleForm = () => {
        setCurrentRole(null);
        setRoleForm({
            name: '',
            description: '',
            permissionIds: []
        });
    };

    const handleSaveSignature = async (name, imageData) => {
        try {
            await createSignature({ name, imageData });
            setShowSignatureModal(false);
            // Force reload to ensure fresh data
            await loadSignatures(true);
        } catch (error) {
            showAlert('Error saving signature: ' + error.message, 'error');
        }
    };

    const handleSetActiveSignature = async (id) => {
        try {
            await setActiveSignature(id);
            // Context handles reload
        } catch (error) {
            showAlert('Error setting active signature: ' + error.message, 'error');
        }
    };

    const handleDeleteSignature = async () => {
        try {
            await deleteSignature(deleteSignatureModal.signature.id);
            setDeleteSignatureModal({ show: false, signature: null });
            // Force reload to ensure fresh data
            await loadSignatures(true);
        } catch (error) {
            showAlert('Error deleting signature: ' + error.message, 'error');
        }
    };

    const handleSmtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                smtpHost: smtpForm.smtpHost || null,
                smtpPort: smtpForm.smtpPort ? parseInt(smtpForm.smtpPort, 10) : null,
                smtpUser: smtpForm.smtpUser || null,
                fromEmail: smtpForm.fromEmail || null,
                fromName: smtpForm.fromName || null,
                enableSsl: smtpForm.enableSsl
            };
            if (smtpForm.smtpPassword) {
                payload.smtpPassword = smtpForm.smtpPassword;
            }

            await updateEmailSettings(payload);
            showAlert('Email settings updated successfully', 'success');
            await loadCompanySettings(true);
            // Clear password field after save
            setSmtpForm(prev => ({ ...prev, smtpPassword: '' }));
        } catch (error) {
            showAlert('Error updating email settings: ' + error.message, 'error');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file', 'warning');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert('Image size should be less than 2MB', 'warning');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageData = reader.result;
                await updateLogo({
                    logoImageData: imageData,
                    fileName: file.name
                });
                // Context handles reload
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showAlert('Error uploading logo: ' + error.message, 'error');
        }
    };

    const handleClearLogo = async () => {
        try {
            await clearLogo();
            setClearLogoModal(false);
            // Context handles reload
        } catch (error) {
            showAlert('Error removing logo: ' + error.message, 'error');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="card shadow">
                <div className="card-header bg-light py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="h5 fw-bold text-primary mb-0">Admin Panel</h3>
                        <p className="text-muted small mb-0">
                            Manage users, roles, and company settings
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-bottom">
                    <ul className="nav nav-tabs border-0 px-3">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <li className="nav-item" key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`nav-link d-flex align-items-center gap-2 px-4 py-3 border-0 ${
                                            activeTab === tab.id 
                                                ? 'active text-primary fw-medium border-bottom border-primary border-2' 
                                                : 'text-secondary'
                                        }`}
                                        style={{
                                            fontSize: '0.875rem',
                                            background: 'transparent',
                                            marginBottom: '-1px'
                                        }}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Content */}
                <div className="card-body p-4">
                    {(loadingStates.users || loadingStates.roles || loadingStates.permissions || 
                      loadingStates.signatures || loadingStates.companySettings) ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold text-muted text-uppercase small mb-0">User Management</h6>
                                        {canWriteUsers && (
                                            <button
                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                onClick={() => {
                                                    resetUserForm();
                                                    setShowUserModal(true);
                                                }}
                                            >
                                                <Plus size={16} />
                                                Add User
                                            </button>
                                        )}
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="px-4 py-3">Username</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Full Name</th>
                                                    <th className="px-4 py-3">Roles</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    {(canWriteUsers || canDeleteUsers) && (
                                                        <th className="px-4 py-3 text-center" style={{ width: '100px' }}>Actions</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={canWriteUsers || canDeleteUsers ? "6" : "5"} className="text-center py-4 text-muted">
                                                            No users found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map(user => (
                                                        <tr key={user.id}>
                                                            <td className="px-4 py-3 fw-medium">{user.username}</td>
                                                            <td className="px-4 py-3">{user.email}</td>
                                                            <td className="px-4 py-3">{user.fullName || '-'}</td>
                                                            <td className="px-4 py-3">
                                                                {user.roles.map(role => (
                                                                    <span key={role} className="badge bg-secondary me-1">
                                                                        {role}
                                                                    </span>
                                                                ))}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            {(canWriteUsers || canDeleteUsers) && (
                                                                <td className="px-4 py-3">
                                                                    <div className="d-flex justify-content-center gap-2">
                                                                        {canWriteUsers && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                onClick={() => handleEditUser(user)}
                                                                                title="Edit"
                                                                            >
                                                                                <Edit2 size={14} />
                                                                            </button>
                                                                        )}
                                                                        {canDeleteUsers && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => setDeleteUserModal({ show: true, user })}
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Roles Tab */}
                            {activeTab === 'roles' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold text-muted text-uppercase small mb-0">Role Management</h6>
                                        {canWriteRoles && (
                                            <button
                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                onClick={() => {
                                                    resetRoleForm();
                                                    setShowRoleModal(true);
                                                }}
                                            >
                                                <Plus size={16} />
                                                Add Role
                                            </button>
                                        )}
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Description</th>
                                                    <th className="px-4 py-3">Permissions</th>
                                                    {(canWriteRoles || canDeleteRoles) && (
                                                        <th className="px-4 py-3 text-center" style={{ width: '100px' }}>Actions</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={canWriteRoles || canDeleteRoles ? "4" : "3"} className="text-center py-4 text-muted">
                                                            No roles found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    roles.map(role => (
                                                        <tr key={role.id}>
                                                            <td className="px-4 py-3 fw-medium">{role.name}</td>
                                                            <td className="px-4 py-3">{role.description || '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="badge bg-info">
                                                                    {role.permissionIds?.length || 0} permissions
                                                                </span>
                                                            </td>
                                                            {(canWriteRoles || canDeleteRoles) && (
                                                                <td className="px-4 py-3">
                                                                    <div className="d-flex justify-content-center gap-2">
                                                                        {canWriteRoles && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                onClick={() => handleEditRole(role)}
                                                                                title="Edit"
                                                                            >
                                                                                <Edit2 size={14} />
                                                                            </button>
                                                                        )}
                                                                        {canDeleteRoles && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => setDeleteRoleModal({ show: true, role })}
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Invoice Settings Tab */}
                            {activeTab === 'invoice-settings' && (
                                <div>
                                    <div className="row g-4">
                                        {/* Logo Section */}
                                        <div className="col-md-6">
                                            <div className="card border h-100">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 d-flex align-items-center gap-2">
                                                        <Image size={16} />
                                                        Company Logo
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="text-center mb-3">
                                                        {companySettings?.logoImageData ? (
                                                            <div className="position-relative d-inline-block">
                                                                <img
                                                                    src={companySettings.logoImageData}
                                                                    alt="Company Logo"
                                                                    style={{ 
                                                                        maxWidth: '200px', 
                                                                        maxHeight: '100px',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    className="border rounded p-2"
                                                                />
                                                                {canWriteCompanySettings && (
                                                                    <button
                                                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle rounded-circle p-1"
                                                                        onClick={() => setClearLogoModal(true)}
                                                                        title="Remove Logo"
                                                                        style={{ width: '24px', height: '24px' }}
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                className="border rounded p-4 text-muted"
                                                                style={{ backgroundColor: '#f8f9fa' }}
                                                            >
                                                                <Image size={48} className="mb-2 opacity-50" />
                                                                <p className="mb-0 small">No logo uploaded</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {canWriteCompanySettings && (
                                                        <div className="text-center">
                                                            <input
                                                                type="file"
                                                                ref={logoInputRef}
                                                                onChange={handleLogoUpload}
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1 mx-auto"
                                                                onClick={() => logoInputRef.current?.click()}
                                                            >
                                                                <Upload size={14} />
                                                                {companySettings?.logoImageData ? 'Change Logo' : 'Upload Logo'}
                                                            </button>
                                                            <small className="text-muted d-block mt-2">
                                                                Max: 2MB. PNG, JPG, GIF
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Signatures Section */}
                                        <div className="col-md-6">
                                            <div className="card border h-100">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 d-flex align-items-center gap-2">
                                                        <PenTool size={16} />
                                                        Authorized Signatures
                                                    </h6>
                                                    {canWriteSignatures && (
                                                        <button
                                                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                            onClick={() => setShowSignatureModal(true)}
                                                        >
                                                            <Plus size={14} />
                                                            Add
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="card-body">
                                                    {signatures.length === 0 ? (
                                                        <div className="text-center text-muted py-4">
                                                            <PenTool size={48} className="mb-2 opacity-50" />
                                                            <p className="mb-0 small">No signatures added yet</p>
                                                            {canWriteSignatures && (
                                                                <small>Click "Add" to draw a new signature</small>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="signatures-list">
                                                            {signatures.map(signature => (
                                                                <div 
                                                                    key={signature.id} 
                                                                    className={`d-flex align-items-center justify-content-between p-2 border rounded mb-2 ${signature.isActive ? 'border-primary bg-light' : ''}`}
                                                                >
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <img
                                                                            src={signature.imageData}
                                                                            alt={signature.name}
                                                                            style={{ 
                                                                                width: '80px', 
                                                                                height: '40px',
                                                                                objectFit: 'contain',
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '4px'
                                                                            }}
                                                                        />
                                                                        <div>
                                                                            <div className="fw-medium small">{signature.name}</div>
                                                                            {signature.isActive && (
                                                                                <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                                                                                    <Check size={10} className="me-1" />
                                                                                    Active
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex gap-1">
                                                                        {!signature.isActive && canWriteSignatures && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-success"
                                                                                onClick={() => handleSetActiveSignature(signature.id)}
                                                                                title="Set as Active"
                                                                            >
                                                                                <Check size={14} />
                                                                            </button>
                                                                        )}
                                                                        {canDeleteSignatures && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => setDeleteSignatureModal({ show: true, signature })}
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SMTP / Email Settings */}
                                        <div className="col-12">
                                            <div className="card border">
                                                <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 d-flex align-items-center gap-2">
                                                        <PenTool size={16} />
                                                        SMTP / Email Settings
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <form onSubmit={handleSmtpSubmit} className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-medium">SMTP Host</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.smtpHost}
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-2">
                                                            <label className="form-label small fw-medium">SMTP Port</label>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.smtpPort}
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: e.target.value })}
                                                                min="1"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="form-label small fw-medium">SMTP Username</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.smtpUser}
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, smtpUser: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-medium">SMTP Password</label>
                                                            <input
                                                                type="password"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.smtpPassword}
                                                                placeholder="Leave blank to keep existing"
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, smtpPassword: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-medium">From Email</label>
                                                            <input
                                                                type="email"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.fromEmail}
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-medium">From Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={smtpForm.fromName}
                                                                onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-md-6 d-flex align-items-end">
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="smtpEnableSsl"
                                                                    checked={smtpForm.enableSsl}
                                                                    onChange={(e) => setSmtpForm({ ...smtpForm, enableSsl: e.target.checked })}
                                                                />
                                                                <label className="form-check-label" htmlFor="smtpEnableSsl">
                                                                    Enable SSL
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="d-flex gap-2">
                                                                <button type="submit" className="btn btn-sm btn-primary">
                                                                    Save Email Settings
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => setSmtpForm({
                                                                        smtpHost: companySettings?.smtpHost || '',
                                                                        smtpPort: companySettings?.smtpPort?.toString() || '',
                                                                        smtpUser: companySettings?.smtpUser || '',
                                                                        smtpPassword: '',
                                                                        fromEmail: companySettings?.fromEmail || companySettings?.email || '',
                                                                        fromName: companySettings?.fromName || companySettings?.companyName || '',
                                                                        enableSsl: companySettings?.enableSsl ?? true
                                                                    })}
                                                                >
                                                                    Reset
                                                                </button>
                                                            </div>
                                                            <small className="text-muted d-block mt-2">
                                                                Password is optional; leave blank to keep the current password.
                                                            </small>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Information Section */}
                                        {companySettings && (
                                            <div className="col-12">
                                                <div className="card border">
                                                    <div className="card-header bg-light py-2">
                                                        <h6 className="mb-0">Company Information</h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <p className="mb-2 small"><strong>Company Name:</strong> {companySettings.companyName}</p>
                                                                <p className="mb-2 small"><strong>Address:</strong> {companySettings.address || '-'}</p>
                                                                <p className="mb-2 small"><strong>Phone:</strong> {companySettings.phone || '-'}</p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <p className="mb-2 small"><strong>Email:</strong> {companySettings.email || '-'}</p>
                                                                <p className="mb-2 small"><strong>Website:</strong> {companySettings.website || '-'}</p>
                                                                <p className="mb-2 small"><strong>TRN:</strong> {companySettings.trn || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* User Modal */}
            <Modal
                show={showUserModal}
                onClose={() => { setShowUserModal(false); resetUserForm(); }}
                title={currentUser ? 'Edit User' : 'Add User'}
            >
                <form onSubmit={handleUserSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Username</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            required
                            disabled={!!currentUser}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Email</label>
                        <input
                            type="email"
                            className="form-control form-control-sm"
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Password</label>
                        <input
                            type="password"
                            className="form-control form-control-sm"
                            value={userForm.password}
                            placeholder={currentUser ? "Leave blank to keep existing password" : ""}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            required={!currentUser}
                        />
                        <small className="text-muted d-block mt-1">
                            {currentUser ? "Leave blank to keep the current password" : "Required for new users"}
                        </small>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Full Name</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={userForm.fullName}
                            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                        />
                    </div>
                    {currentUser && (
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="userIsActive"
                                    checked={userForm.isActive}
                                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="userIsActive">
                                    Active User
                                </label>
                            </div>
                            <small className="text-muted d-block mt-1">
                                Inactive users cannot log in to the system
                            </small>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Roles</label>
                        <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {roles.map(role => (
                                <div key={role.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={userForm.roleIds.includes(role.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setUserForm({ ...userForm, roleIds: [...userForm.roleIds, role.id] });
                                            } else {
                                                setUserForm({ ...userForm, roleIds: userForm.roleIds.filter(id => id !== role.id) });
                                            }
                                        }}
                                    />
                                    <label className="form-check-label small" htmlFor={`role-${role.id}`}>{role.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-sm btn-primary flex-grow-1">
                            {currentUser ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => { setShowUserModal(false); resetUserForm(); }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Role Modal */}
            <Modal
                show={showRoleModal}
                onClose={() => { setShowRoleModal(false); resetRoleForm(); }}
                title={currentRole ? 'Edit Role' : 'Add Role'}
                size="lg"
            >
                <form onSubmit={handleRoleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Name</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={roleForm.name}
                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Description</label>
                        <textarea
                            className="form-control form-control-sm"
                            value={roleForm.description}
                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                            rows="2"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Permissions</label>
                        <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {permissions.map(permission => (
                                <div key={permission.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`perm-${permission.id}`}
                                        checked={roleForm.permissionIds.includes(permission.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setRoleForm({ ...roleForm, permissionIds: [...roleForm.permissionIds, permission.id] });
                                            } else {
                                                setRoleForm({ ...roleForm, permissionIds: roleForm.permissionIds.filter(id => id !== permission.id) });
                                            }
                                        }}
                                    />
                                    <label className="form-check-label small" htmlFor={`perm-${permission.id}`}>
                                        {permission.name}
                                        {permission.description && (
                                            <span className="text-muted ms-1">({permission.description})</span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-sm btn-primary flex-grow-1">
                            {currentRole ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => { setShowRoleModal(false); resetRoleForm(); }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Signature Modal */}
            <Modal
                show={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                title="Add New Signature"
                size="lg"
            >
                <SignatureCanvas
                    onSave={handleSaveSignature}
                    onCancel={() => setShowSignatureModal(false)}
                />
            </Modal>

            {/* Delete User Confirmation Modal */}
            <ConfirmationModal
                show={deleteUserModal.show}
                onClose={() => setDeleteUserModal({ show: false, user: null })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user?"
                itemName={deleteUserModal.user?.username}
                confirmButtonText="Delete"
                type="danger"
            />

            {/* Delete Role Confirmation Modal */}
            <ConfirmationModal
                show={deleteRoleModal.show}
                onClose={() => setDeleteRoleModal({ show: false, role: null })}
                onConfirm={handleDeleteRole}
                title="Delete Role"
                message="Are you sure you want to delete this role?"
                itemName={deleteRoleModal.role?.name}
                confirmButtonText="Delete"
                type="danger"
            />

            {/* Delete Signature Confirmation Modal */}
            <ConfirmationModal
                show={deleteSignatureModal.show}
                onClose={() => setDeleteSignatureModal({ show: false, signature: null })}
                onConfirm={handleDeleteSignature}
                title="Delete Signature"
                message="Are you sure you want to delete this signature?"
                itemName={deleteSignatureModal.signature?.name}
                confirmButtonText="Delete"
                type="danger"
            />

            {/* Clear Logo Confirmation Modal */}
            <ConfirmationModal
                show={clearLogoModal}
                onClose={() => setClearLogoModal(false)}
                onConfirm={handleClearLogo}
                title="Remove Logo"
                message="Are you sure you want to remove the company logo?"
                confirmButtonText="Remove"
                type="warning"
            />

            {/* Alert Modal */}
            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default Admin;
