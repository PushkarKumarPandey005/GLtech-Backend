import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment
} from '../controllers/payment.controller.js';

const router = express.Router();

// Create payment order
router.post('/create-order', createPaymentOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment details
router.get('/details/:paymentId', getPaymentDetails);

// Process refund
router.post('/refund', refundPayment);

export default router;
