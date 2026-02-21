import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByOrderId,
  getOrdersByEmail,
  getOrdersByUserId,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
} from '../controllers/order.controller.js';

const router = express.Router();

// ================= CREATE ORDER =================
router.post('/', createOrder);

// ================= GET ORDERS =================
router.get('/stats', getOrderStats);
router.get('/', getAllOrders);
router.get('/order-id/:orderId', getOrderByOrderId);
router.get('/email/:email', getOrdersByEmail);
router.get('/user/:userId', getOrdersByUserId);
router.get('/:id', getOrderById);

// ================= UPDATE ORDER =================
router.put('/status/:orderId', updateOrderStatus);
router.put('/payment/:orderId', updatePaymentStatus);

export default router;
