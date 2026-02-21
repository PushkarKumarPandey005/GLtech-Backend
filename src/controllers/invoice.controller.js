import Invoice from "../model/invoice.model.js";
import Order from "../model/order.model.js";

// ================= CREATE INVOICE =================
export const createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.status(200).json({
        success: true,
        invoice: existingInvoice,
        message: "Invoice already exists for this order"
      });
    }

    // Create invoice
    const invoiceData = {
      orderId: order._id,
      orderNumber: order.orderId,
      customer: order.customer,
      address: order.address,
      items: order.items.map(item => ({
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      pricing: order.pricing,
      payment: order.payment,
      notes: "Thank you for your order! Please keep this invoice for your records.",
      termsAndConditions:
        "1. Payment terms: Due on receipt\n2. Please retain this invoice for warranty claims\n3. Products are non-refundable after 48 hours of delivery\n4. For disputes, contact support within 7 days of delivery"
    };

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    res.status(201).json({
      success: true,
      invoice: newInvoice,
      message: "Invoice created successfully"
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message
    });
  }
};

// ================= GET INVOICE BY ORDER ID =================
export const getInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};

// ================= GET INVOICE BY INVOICE NUMBER =================
export const getInvoiceByNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};

// ================= GET ALL INVOICES =================
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      invoices,
      total: invoices.length
    });
  } catch (error) {
    console.error("Get all invoices error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message
    });
  }
};

// ================= UPDATE INVOICE STATUS =================
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    const validStatuses = ["draft", "issued", "sent", "viewed", "paid", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}`
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice,
      message: "Invoice status updated successfully"
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message
    });
  }
};

// ================= MARK INVOICE AS PRINTED =================
export const markAsPrinted = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { printedAt: new Date() },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice,
      message: "Invoice marked as printed"
    });
  } catch (error) {
    console.error("Mark printed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark invoice as printed",
      error: error.message
    });
  }
};

// ================= MARK INVOICE AS DOWNLOADED =================
export const markAsDownloaded = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { downloadedAt: new Date() },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      invoice,
      message: "Invoice marked as downloaded"
    });
  } catch (error) {
    console.error("Mark downloaded error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark invoice as downloaded",
      error: error.message
    });
  }
};

// ================= GET INVOICES BY EMAIL =================
export const getInvoicesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const invoices = await Invoice.find({ "customer.email": email }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      invoices,
      total: invoices.length
    });
  } catch (error) {
    console.error("Get invoices by email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message
    });
  }
};

// ================= DELETE INVOICE =================
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message
    });
  }
};
