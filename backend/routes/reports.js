const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const moment = require('moment');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

function getDateRange(period, from, to) {
  const now = moment();
  if (from && to) return { start: moment(from).startOf('day'), end: moment(to).endOf('day') };

  switch (period) {
    case 'today': return { start: now.clone().startOf('day'), end: now.clone().endOf('day') };
    case 'week': return { start: now.clone().startOf('isoWeek'), end: now.clone().endOf('isoWeek') };
    case 'month': return { start: now.clone().startOf('month'), end: now.clone().endOf('month') };
    case 'year': return { start: now.clone().startOf('year'), end: now.clone().endOf('year') };
    default: return { start: now.clone().startOf('month'), end: now.clone().endOf('month') };
  }
}

// ADMIN: Dashboard stats
router.get('/stats', authMiddleware, (req, res) => {
  const { period = 'month', from, to } = req.query;
  const { start, end } = getDateRange(period, from, to);

  const periodOrders = db.orders.filter(o => {
    const d = moment(o.createdAt);
    return d.isBetween(start, end, null, '[]');
  });

  const completedOrders = periodOrders.filter(o => o.status === 'completed');
  const revenue = completedOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || parseFloat(o.total) || 0), 0);

  // Daily breakdown
  const dailyMap = {};
  completedOrders.forEach(o => {
    const day = moment(o.createdAt).format('YYYY-MM-DD');
    if (!dailyMap[day]) dailyMap[day] = { date: day, orders: 0, revenue: 0 };
    dailyMap[day].orders++;
    dailyMap[day].revenue += parseFloat(o.amount) || parseFloat(o.total) || 0;
  });

  // Top products
  const productSales = {};
  completedOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.id].qty += item.quantity || 1;
      productSales[item.id].revenue += item.subtotal || 0;
    });
  });

  res.json({
    period,
    dateRange: { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') },
    summary: {
      totalOrders: periodOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: periodOrders.filter(o => o.status === 'pending').length,
      failedOrders: periodOrders.filter(o => o.status === 'failed').length,
      revenue: revenue.toFixed(2),
      avgOrderValue: completedOrders.length ? (revenue / completedOrders.length).toFixed(2) : 0
    },
    dailyData: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    allTimeOrders: db.orders.length,
    allTimeRevenue: db.orders.filter(o => o.status === 'completed').reduce((s, o) => s + (parseFloat(o.amount) || parseFloat(o.total) || 0), 0).toFixed(2)
  });
});

// ADMIN: Export Excel
router.get('/export', authMiddleware, (req, res) => {
  const { period = 'month', from, to } = req.query;
  const { start, end } = getDateRange(period, from, to);

  const orders = db.orders
    .filter(o => {
      const d = moment(o.createdAt);
      return d.isBetween(start, end, null, '[]');
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Sheet 1: Orders
  const orderRows = orders.map(o => ({
    'Order Number': o.orderNumber || o.id,
    'Date': moment(o.createdAt).format('DD/MM/YYYY HH:mm'),
    'Customer Name': o.customerName || '',
    'Phone': o.phone || '',
    'Email': o.email || '',
    'Amount (KES)': parseFloat(o.amount) || parseFloat(o.total) || 0,
    'Status': o.status,
    'M-Pesa Receipt': o.mpesaReceiptNumber || '',
    'Till Number': '5367886',
    'Payment Method': 'M-Pesa',
    'Notes': o.notes || ''
  }));

  // Sheet 2: Summary
  const completed = orders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((s, o) => s + (parseFloat(o.amount) || parseFloat(o.total) || 0), 0);

  const summaryRows = [
    { 'Metric': 'Report Period', 'Value': `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}` },
    { 'Metric': 'Generated On', 'Value': moment().format('DD/MM/YYYY HH:mm') },
    { 'Metric': 'Total Orders', 'Value': orders.length },
    { 'Metric': 'Completed Orders', 'Value': completed.length },
    { 'Metric': 'Pending Orders', 'Value': orders.filter(o => o.status === 'pending').length },
    { 'Metric': 'Failed Orders', 'Value': orders.filter(o => o.status === 'failed').length },
    { 'Metric': 'Total Revenue (KES)', 'Value': revenue.toFixed(2) },
    { 'Metric': 'Avg Order Value (KES)', 'Value': completed.length ? (revenue / completed.length).toFixed(2) : 0 },
    { 'Metric': 'Till Number', 'Value': '5367886' },
    { 'Metric': 'Business Name', 'Value': 'Geopram Technologies Shops' }
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(orderRows);
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);

  // Style column widths
  ws1['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 15 },
    { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 20 }
  ];
  ws2['!cols'] = [{ wch: 25 }, { wch: 35 }];

  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
  XLSX.utils.book_append_sheet(wb, ws1, 'Orders');

  const filename = `GeopramGifts_${period}_${moment().format('YYYYMMDD_HHmm')}.xlsx`;
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

module.exports = router;
