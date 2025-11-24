import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock, User as UserIcon } from 'lucide-react';
import { usersAPI, rolesAPI, permissionsAPI } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentRole, setCurrentRole] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: []
    });
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissionIds: []
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const [usersData, rolesData] = await Promise.all([
                    usersAPI.getAll(),
                    rolesAPI.getAll()
                ]);
                setUsers(usersData);
                setRoles(rolesData);
            } else if (activeTab === 'roles') {
                const [rolesData, permissionsData] = await Promise.all([
                    rolesAPI.getAll(),
                    permissionsAPI.getAll()
                ]);
                setRoles(rolesData);
                setPermissions(permissionsData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await usersAPI.update(currentUser.id, {
                    email: userForm.email,
                    fullName: userForm.fullName,
                    roleIds: userForm.roleIds
                });
            } else {
                await usersAPI.create(userForm);
            }
            setShowUserModal(false);
            resetUserForm();
            loadData();
        } catch (error) {
            alert('Error saving user: ' + error.message);
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await rolesAPI.update(currentRole.id, roleForm);
            } else {
                await rolesAPI.create(roleForm);
            }
            setShowRoleModal(false);
            resetRoleForm();
            loadData();
        } catch (error) {
            alert('Error saving role: ' + error.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(id);
                loadData();
            } catch (error) {
                alert('Error deleting user: ' + error.message);
            }
        }
    };

    const handleDeleteRole = async (id) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await rolesAPI.delete(id);
                loadData();
            } catch (error) {
                alert('Error deleting role: ' + error.message);
            }
        }
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setUserForm({
            username: user.username,
            email: user.email,
            password: '',
            fullName: user.fullName || '',
            roleIds: user.roles.map(r => roles.find(role => role.name === r)?.id).filter(Boolean)
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
            roleIds: []
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

    return (
        <div className="content-wrapper py-3 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 mb-0">Admin Panel</h2>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Roles
                    </button>
                </li>
            </ul>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {activeTab === 'users' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Users</h4>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => {
                                        resetUserForm();
                                        setShowUserModal(true);
                                    }}
                                >
                                    <Plus size={18} />
                                    Add User
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Full Name</th>
                                            <th>Roles</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>{user.fullName || '-'}</td>
                                                <td>
                                                    {user.roles.map(role => (
                                                        <span key={role} className="badge bg-secondary me-1">
                                                            {role}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Roles</h4>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => {
                                        resetRoleForm();
                                        setShowRoleModal(true);
                                    }}
                                >
                                    <Plus size={18} />
                                    Add Role
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Permissions</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map(role => (
                                            <tr key={role.id}>
                                                <td>{role.name}</td>
                                                <td>{role.description || '-'}</td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {role.permissionIds.length} permissions
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEditRole(role)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{currentUser ? 'Edit User' : 'Add User'}</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowUserModal(false);
                                    resetUserForm();
                                }}></button>
                            </div>
                            <form onSubmit={handleUserSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={userForm.username}
                                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                            required
                                            disabled={!!currentUser}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={userForm.email}
                                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {!currentUser && (
                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={userForm.password}
                                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                                required={!currentUser}
                                            />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={userForm.fullName}
                                            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Roles</label>
                                        {roles.map(role => (
                                            <div key={role.id} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={userForm.roleIds.includes(role.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setUserForm({ ...userForm, roleIds: [...userForm.roleIds, role.id] });
                                                        } else {
                                                            setUserForm({ ...userForm, roleIds: userForm.roleIds.filter(id => id !== role.id) });
                                                        }
                                                    }}
                                                />
                                                <label className="form-check-label">{role.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setShowUserModal(false);
                                        resetUserForm();
                                    }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {showRoleModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{currentRole ? 'Edit Role' : 'Add Role'}</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowRoleModal(false);
                                    resetRoleForm();
                                }}></button>
                            </div>
                            <form onSubmit={handleRoleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={roleForm.name}
                                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            value={roleForm.description}
                                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Permissions</label>
                                        <div className="border p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {permissions.map(permission => (
                                                <div key={permission.id} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={roleForm.permissionIds.includes(permission.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setRoleForm({ ...roleForm, permissionIds: [...roleForm.permissionIds, permission.id] });
                                                            } else {
                                                                setRoleForm({ ...roleForm, permissionIds: roleForm.permissionIds.filter(id => id !== permission.id) });
                                                            }
                                                        }}
                                                    />
                                                    <label className="form-check-label">
                                                        {permission.name}
                                                        {permission.description && (
                                                            <small className="text-muted ms-2">({permission.description})</small>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setShowRoleModal(false);
                                        resetRoleForm();
                                    }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;

