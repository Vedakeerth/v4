"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Shield, User as UserIcon, AlertCircle, Loader2, Check, Eye, EyeOff, Plus, Edit } from "lucide-react";
import { User, UserRole } from "@/lib/users";

export default function UsersTab() {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER" as UserRole });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.error || "Failed to fetch users");
            }
        } catch (err) {
            setError("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const method = editingUser ? "PATCH" : "POST";
            const url = "/api/admin/users";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingUser ? { ...formData, id: editingUser.id } : formData)
            });
            const data = await res.json();

            if (res.ok) {
                setIsAdding(false);
                setEditingUser(null);
                setFormData({ name: "", email: "", password: "", role: "USER" });
                setShowCreatePassword(false);
                fetchUsers();
            } else {
                setError(data.error || "Failed to save user");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete user");
            }
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const [isChangingPassword, setIsChangingPassword] = useState<{ id: string, name: string } | null>(null);
    const [newPassword, setNewPassword] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChangingPassword) return;
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: isChangingPassword.id, password: newPassword })
            });

            if (res.ok) {
                setIsChangingPassword(null);
                setNewPassword("");
                setShowChangePassword(false);
                alert("Password updated successfully");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update password");
            }
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = (user: Omit<User, 'password'>) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // Password not editable here
            role: user.role
        });
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "USER" });
        setError("");
    };

    if (isLoading && users.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">User Management</h2>
                    <p className="text-slate-400 text-sm">Manage dashboard users and their access levels (Max 5 users).</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <UserPlus size={18} /> Add User
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {isAdding && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <UserPlus className="text-cyan-400" size={20} />
                        <h3 className="text-lg font-bold text-white uppercase italic">{editingUser ? "Edit User Account" : "Create New User"}</h3>
                    </div>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInput}
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInput}
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                placeholder="john@vaelinsa.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {editingUser ? "New Password (Optional)" : "Password"}
                            </label>
                            <div className="relative">
                                <input
                                    required={!editingUser}
                                    name="password"
                                    type={showCreatePassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInput}
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                    placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInput}
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm appearance-none"
                            >
                                <option value="USER">Standard User (Limited Access)</option>
                                <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{editingUser ? <Check size={18} /> : <Plus size={18} />} {editingUser ? "Update Account" : "Create Account"}</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isChangingPassword && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <Shield className="text-cyan-400" size={20} />
                        <h3 className="text-lg font-bold text-white uppercase italic">Change Password: {isChangingPassword.name}</h3>
                    </div>
                    <form onSubmit={handleChangePassword} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showChangePassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    {showChangePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsChangingPassword(null)}
                                className="px-6 py-4 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-[10px] flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">User</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                <UserIcon size={18} className="text-slate-400" />
                                            </div>
                                            <span className="font-bold text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-slate-400 font-medium text-sm">{user.email}</td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'SUPER_ADMIN'
                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                            }`}>
                                            <Shield size={12} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition-all"
                                                title="Edit User"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsChangingPassword({ id: user.id, name: user.name })}
                                                className="p-2.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition-all"
                                                title="Change Password"
                                            >
                                                <Shield size={18} />
                                            </button>
                                            {user.role !== 'SUPER_ADMIN' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
