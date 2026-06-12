const fs = require('fs');
const cashierPage = fs.readFileSync('app/cashier/page.tsx', 'utf8');
const adminPage = fs.readFileSync('app/admin/orders/new/page.tsx', 'utf8');

console.log("Cashier Page dynamic export?", cashierPage.includes("export const dynamic"));
console.log("Admin Page dynamic export?", adminPage.includes("export const dynamic"));
