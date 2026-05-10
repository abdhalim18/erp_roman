import { Resend } from 'resend';
import { getSettings } from '@/app/actions/settings';

// Initialize Resend with API key if available
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendLowStockEmail(productName: string, currentStock: number) {
    if (!resend) {
        console.log('RESEND_API_KEY is not set. Skipping email.');
        // console.log(`[MOCK EMAIL] Low Stock Alert: ${productName} is currently at ${currentStock} pcs.`);
        return;
    }

    const settings = await getSettings();
    const toEmail = settings.alertEmail || 'delivered@resend.dev'; // Fallback if not set

    try {
        await resend.emails.send({
            from: 'Toko Roman <onboarding@resend.dev>',
            to: toEmail,
            subject: `Peringatan Stok Menipis: ${productName}`,
            html: `
        <h1>Peringatan Stok Menipis</h1>
        <p>Stok untuk produk <strong>${productName}</strong> saat ini telah menyentuh batas minimum, tersisa <strong>${currentStock}</strong> unit.</p>
        <p>Mohon segera lakukan penambahan stok barang.</p>
      `,
        });
        console.log(`Low stock email sent for ${productName} to ${toEmail}`);
    } catch (error) {
        console.error('Failed to send low stock email:', error);
    }
}
