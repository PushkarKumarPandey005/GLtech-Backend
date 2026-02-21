import Order from "../model/order.model.js";

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    const { items, customer, address, pricing, payment } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item"
      });
    }

    if (!customer || !customer.fullName || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer information is required"
      });
    }

    if (!address || !address.fullAddress || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required"
      });
    }

    if (!pricing || pricing.total === undefined) {
      return res.status(400).json({
        success: false,
        message: "Pricing information is required"
      });
    }

    // Generate unique order ID
    const orderId = `GL${Date.now().toString().slice(-10)}`;

    // Create order document
    const newOrder = new Order({
      orderId,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
        userId: customer.userId || null
      },
      address: {
        fullAddress: address.fullAddress.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim()
      },
      items: items.map(item => ({
        productId: item._id,
        productTitle: item.title,
        productImage: item.image,
        category: item.category,
        slug: item.slug,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping || 0,
        tax: pricing.tax,
        total: pricing.total
      },
      payment: {
        method: payment?.method || "cod",
        status: payment?.status || "pending",
        transactionId: payment?.transactionId || null
      }
    });

    // Save to database
    const savedOrder = await newOrder.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: savedOrder.orderId,
      order: savedOrder
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order"
    });
  }
};

// ================= GET ALL ORDERS (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ORDER BY ID =================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ORDER BY ORDER ID =================
export const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ORDERS BY EMAIL =================
export const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await Order.find({ "customer.email": email.toLowerCase() })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ORDERS BY USER ID =================
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ "customer.userId": userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= UPDATE ORDER STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required"
      });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= UPDATE PAYMENT STATUS =================
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required"
      });
    }

    const validStatuses = ["pending", "completed", "failed"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: ${validStatuses.join(", ")}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        "payment.status": paymentStatus,
        "payment.transactionId": transactionId || undefined,
        "payment.paymentDate": paymentStatus === "completed" ? Date.now() : undefined,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ORDER STATISTICS =================
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$pricing.total" }
        }
      }
    ]);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.totalAmount || 0,
        ordersByStatus
      }
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
