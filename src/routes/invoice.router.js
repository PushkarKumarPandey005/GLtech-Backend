import express from 'express';
import {
  createInvoice,
  getInvoiceByOrderId,
  getInvoiceByNumber,
  getAllInvoices,
  updateInvoiceStatus,
  markAsPrinted,
  markAsDownloaded,
  getInvoicesByEmail,
  deleteInvoice
} from '../controllers/invoice.controller.js';

const router = express.Router();

// ================= CREATE INVOICE =================
router.post('/create', createInvoice);

// ================= GET INVOICES =================
router.get('/all', getAllInvoices);
router.get('/order/:orderId', getInvoiceByOrderId);
router.get('/number/:invoiceNumber', getInvoiceByNumber);
router.get('/email/:email', getInvoicesByEmail);

// ================= UPDATE INVOICE =================
router.put('/:invoiceId/status', updateInvoiceStatus);
router.put('/:invoiceId/printed', markAsPrinted);
router.put('/:invoiceId/downloaded', markAsDownloaded);

// ================= DELETE INVOICE =================
router.delete('/:invoiceId', deleteInvoice);

export default router;
