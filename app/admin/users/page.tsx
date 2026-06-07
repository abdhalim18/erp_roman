import { getUsers } from '@/app/actions/users'
import { getUser } from '@/app/actions/auth'
import { UserDialog } from '@/components/users/user-dialog'
import { EditUserDialog } from '@/components/users/edit-user-dialog'
import { Badge } from '@/components/ui/badge'
import { DeleteUserButton } from './delete-user-button'
import { Shield, UserCog, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const [{ users, error }, currentUser] = await Promise.all([getUsers(), getUser()])
    const currentUserId = currentUser?.id

    const adminCount = users?.filter(u => u.role === 'admin').length || 0
    const cashierCount = users?.filter(u => u.role !== 'admin').length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengguna</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola akun admin dan kasir</p>
                </div>
                <UserDialog />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm">
                    <span className="font-medium">Gagal memuat pengguna:</span> {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pengguna</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{users?.length || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Akun terdaftar</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-indigo-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{adminCount}</p>
                            <p className="text-xs text-gray-400 mt-1">Akses penuh</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-violet-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kasir</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{cashierCount}</p>
                            <p className="text-xs text-gray-400 mt-1">Akses kasir</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                            <UserCog className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Daftar Pengguna</p>
                    <p className="text-xs text-gray-400">{users?.length || 0} akun terdaftar</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Peran</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Terakhir Masuk</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Users className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Tidak ada pengguna ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users?.map((user) => (
                                    <tr key={user.id} className={`hover:bg-gray-50/80 transition-colors ${user.id === currentUserId ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                                            {user.email}
                                            {user.id === currentUserId && (
                                                <span className="ml-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">Anda</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === 'admin'
                                                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                {user.role === 'admin' ? 'Admin' : 'Kasir'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400">
                                            {user.last_sign_in_at
                                                ? new Date(user.last_sign_in_at).toLocaleString('id-ID')
                                                : 'Belum pernah'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <EditUserDialog
                                                    userId={user.id}
                                                    userEmail={user.email || ''}
                                                    currentRole={user.role}
                                                />
                                                {user.id === currentUserId ? (
                                                    <span className="h-8 w-8 inline-flex items-center justify-center text-gray-300 cursor-not-allowed" title="Tidak dapat menghapus akun sendiri">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                    </span>
                                                ) : (
                                                    <DeleteUserButton userId={user.id} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
