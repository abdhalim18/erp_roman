'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, Mail, ShieldCheck, Settings as SettingsIcon, Package, User, CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings, type AppSettings } from '@/app/actions/settings'

import { savePaymentMethods, type PaymentMethod } from '@/app/actions/payment_methods'

const settingsSchema = z.object({
    storeName: z.string().min(1, { message: 'Nama toko wajib diisi.' }),
    storeAddress: z.string().optional(),
    storePhone: z.string().optional(),
    lowStockThreshold: z.number().min(1, { message: 'Threshold minimal 1.' }),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    initialSettings: AppSettings
    user?: any
    initialPaymentMethods: PaymentMethod[]
}

export function SettingsForm({ initialSettings, user, initialPaymentMethods }: SettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('account')
    
    // Payment Methods State
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)
    const [newMethodName, setNewMethodName] = useState('')
    const [newMethodIsCash, setNewMethodIsCash] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: initialSettings,
    })

    async function onSubmit(data: SettingsFormValues) {
        setLoading(true)
        try {
            // Wait for both updates
            const [settingsResult, pmResult] = await Promise.all([
                updateSettings(data),
                savePaymentMethods(paymentMethods)
            ])

            if (settingsResult.success && pmResult.success) {
                toast.success('Pengaturan berhasil diperbarui')
            } else {
                toast.error('Gagal memperbarui: ' + (settingsResult.error || pmResult.error))
            }
        } catch {
            toast.error('Terjadi kesalahan yang tidak terduga')
        } finally {
            setLoading(false)
        }
    }

    const addPaymentMethod = () => {
        if (!newMethodName.trim()) return
        const newMethod: PaymentMethod = {
            id: newMethodName.toLowerCase().replace(/\s+/g, '_'),
            name: newMethodName,
            is_cash: newMethodIsCash,
            status: 'active'
        }
        setPaymentMethods([...paymentMethods, newMethod])
        setNewMethodName('')
        setNewMethodIsCash(false)
    }

    const togglePaymentMethodStatus = (id: string) => {
        setPaymentMethods(methods => 
            methods.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m)
        )
    }

    const deletePaymentMethod = (id: string) => {
        setPaymentMethods(methods => methods.filter(m => m.id !== id))
    }

    const tabs = [
        { id: 'account', label: 'Profil Akun', icon: User, desc: 'Informasi akun Anda' },
        { id: 'payment', label: 'Metode Pembayaran', icon: CreditCard, desc: 'Kelola opsi pembayaran kasir' },
        { id: 'system', label: 'Profil Toko & Sistem', icon: SettingsIcon, desc: 'Identitas & ambang batas stok' },
        { id: 'security', label: 'Keamanan Akses', icon: ShieldCheck, desc: 'Kontrol privasi login & role' },
    ]

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Nav Tabs */}
            <div className="w-full md:w-72 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex flex-col items-start px-5 py-3.5 rounded-xl transition-all duration-200 text-left border',
                            activeTab === tab.id
                                ? 'bg-indigo-50 border-indigo-100 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50'
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <tab.icon className={cn("h-4 w-4 shrink-0", activeTab === tab.id ? "text-indigo-600" : "text-gray-400")} />
                            <span className={cn("text-[13px] font-bold uppercase tracking-wide whitespace-nowrap", activeTab === tab.id ? "text-indigo-900" : "text-gray-700")}>{tab.label}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-1.5 ml-6.5 hidden md:block">{tab.desc}</span>
                    </button>
                ))}
            </div>

            {/* Right Pane Form */}
            <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
                    {activeTab === 'account' && (
                        <div className="p-7 flex-1">
                            <div className="mb-7 border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Profil Akun</h2>
                                <p className="text-sm text-gray-500 mt-1">Identitas profil akun Anda yang sedang login.</p>
                            </div>
                            
                            <div className="space-y-6 max-w-xl">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Alamat Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input disabled value={user?.email || ''} className="pl-10 h-11 bg-gray-50 text-gray-500" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Email digunakan untuk login dan tidak dapat diubah di sini.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Peran (Role)</Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input disabled value={(user?.user_metadata?.role || 'admin').toUpperCase()} className="pl-10 h-11 bg-gray-50 text-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="p-7 flex-1 flex flex-col h-full">
                            <div className="mb-7 border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
                                <p className="text-sm text-gray-500 mt-1">Kelola daftar metode pembayaran yang muncul di Kasir (POS).</p>
                            </div>
                            
                            <div className="space-y-6 max-w-2xl flex-1">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 block">Tambah Metode Pembayaran Baru</Label>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1 space-y-1.5">
                                            <Input 
                                                placeholder="Contoh: QRIS BCA" 
                                                className="bg-white h-11"
                                                value={newMethodName}
                                                onChange={e => setNewMethodName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPaymentMethod())}
                                            />
                                        </div>
                                        <div className="flex items-center h-11 px-3 bg-white border border-gray-200 rounded-md">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                                                    checked={newMethodIsCash}
                                                    onChange={e => setNewMethodIsCash(e.target.checked)}
                                                />
                                                <span className="text-sm text-gray-700">Opsi Tunai?</span>
                                            </label>
                                        </div>
                                        <Button 
                                            type="button"
                                            onClick={addPaymentMethod}
                                            disabled={!newMethodName.trim()}
                                            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-2"
                                        >
                                            <Plus className="h-4 w-4" /> Tambah
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">Centang "Opsi Tunai" jika metode ini mewajibkan perhitungan uang kembalian di POS.</p>
                                </div>

                                <div className="space-y-3 mt-6">
                                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Daftar Metode Aktif</Label>
                                    {paymentMethods.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">
                                            <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">Belum ada metode pembayaran.</p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                                            {paymentMethods.map(method => (
                                                <div key={method.id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${method.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-semibold ${method.status === 'active' ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                                                {method.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-0.5">
                                                                {method.is_cash ? 'Tipe: Tunai (Perlu Kembalian)' : 'Tipe: Non-Tunai'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => togglePaymentMethodStatus(method.id)}
                                                            className={`h-8 px-2 text-xs font-medium ${method.status === 'active' ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                                        >
                                                            {method.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deletePaymentMethod(method.id)}
                                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="p-7 flex-1">
                            <div className="mb-7 border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Profil Toko & Sistem</h2>
                                <p className="text-sm text-gray-500 mt-1">Kontrol identitas toko yang tampil pada struk serta parameter teknis.</p>
                            </div>
                            
                            <div className="space-y-6 max-w-xl">
                                <div className="space-y-1.5">
                                    <Label htmlFor="storeName" className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">Nama Toko <span className="text-red-500">*</span></Label>
                                    <Input id="storeName" className="h-11 bg-gray-50/50" {...register('storeName')} />
                                    {errors.storeName && <p className="text-xs text-red-500 font-medium mt-1">{errors.storeName.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="storeAddress" className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">Alamat Toko</Label>
                                    <Input id="storeAddress" className="h-11 bg-gray-50/50" {...register('storeAddress')} />
                                    {errors.storeAddress && <p className="text-xs text-red-500 font-medium mt-1">{errors.storeAddress.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="storePhone" className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">Telepon Toko</Label>
                                    <Input id="storePhone" className="h-11 bg-gray-50/50" {...register('storePhone')} />
                                    {errors.storePhone && <p className="text-xs text-red-500 font-medium mt-1">{errors.storePhone.message}</p>}
                                </div>
                                <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 items-start">
                                    <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Mekanisme Peringatan Gudang</p>
                                        <p className="text-sm text-amber-700 mt-1 leading-relaxed">Sistem akan menyalakan alarm visual di Dashboard dan memberi peringatan pada riwayat transaksi jika stok produk menyentuh batas minimum yang telah disetel.</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <Label htmlFor="lowStockThreshold" className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">Ambang Batas Minimum (Satuan Umum) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input id="lowStockThreshold" type="number" className="pl-10 h-11 bg-gray-50/50" {...register('lowStockThreshold', { valueAsNumber: true })} />
                                    </div>
                                    {errors.lowStockThreshold && <p className="text-xs text-red-500 font-medium mt-1">{errors.lowStockThreshold.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-7 flex-1">
                            <div className="mb-7 border-b border-gray-100 pb-5">
                                <h2 className="text-xl font-bold text-gray-900">Hak Akses & Keamanan Data</h2>
                                <p className="text-sm text-gray-500 mt-1">Kebijakan dan matriks kendali kontrol sistem internal.</p>
                            </div>
                            
                            <div className="mt-2 space-y-5">
                                <div className="border border-gray-100 shadow-sm rounded-xl p-5 flex gap-5 bg-white items-center">
                                    <div className="h-12 w-12 shrink-0 bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        A
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-gray-900">Modul Peran Pengguna (Role-Based Access)</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Penambahan staf dan penugasan kasir telah didelegasikan dan diamankan pada Modul Pengguna terpisah secara spesifik.</p>
                                    </div>
                                    <Button type="button" variant="outline" className="h-10 text-indigo-600 border-indigo-200 hover:bg-indigo-50" asChild>
                                        <a href="/admin/users">Kelola Modul Pengguna</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Save Buttons Bottom Area */}
                    {(activeTab === 'payment' || activeTab === 'system') && (
                        <div className="mt-auto p-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Kolom dengan tanda <span className="text-red-500">*</span> wajib diisi.</p>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl h-11 px-8 gap-2 shadow-sm shadow-indigo-500/20">
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan Perubahan Setelan
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
