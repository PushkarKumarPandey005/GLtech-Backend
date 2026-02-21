# Payment System Setup Guide

This guide will help you set up the Razorpay payment integration for the GL Technology e-commerce application.

## Prerequisites

Before you begin, ensure you have:
- A Razorpay account (sign up at https://razorpay.com)
- Node.js and npm installed on your machine
- MongoDB connection set up
- Both Backend and Frontend services running

## Installation

### 1. Install Razorpay Package

Navigate to the Backend directory and install the razorpay package:

```bash
cd Backend
npm install razorpay
```

### 2. Configure Environment Variables

Create a `.env` file in the Backend directory (or update your existing one) with Razorpay credentials:

```bash
# Copy from .env.example
cp .env.example .env
```

Then update the `.env` file with your Razorpay keys:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=rzp_test_YOUR_KEY_SECRET
```

### 3. Get Razorpay API Keys

1. Go to https://dashboard.razorpay.com
2. Sign in with your Razorpay account
3. Navigate to **Settings → API Keys**
4. You'll find:
   - Key ID (Public Key)
   - Key Secret (Private Key - keep this safe!)

For development/testing, use **Test Keys**.
For production, use **Live Keys**.

### 4. Configure Frontend

Update your frontend environment file (`.env.local` in the frontend directory):

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Payment Flow

### 1. **Add to Cart**
   - User adds items to cart

### 2. **Checkout - Step 1: Address**
   - User enters delivery address

### 3. **Checkout - Step 2: Payment Method**
   - User selects payment method:
     - **Cash on Delivery (COD)**: Order created immediately with pending payment status
     - **Card/UPI/Digital Wallet**: Opens Razorpay payment modal

### 4. **Payment Processing**
   - **For Card/UPI/Wallet**:
     1. Frontend calls `/api/payments/create-order` to create Razorpay order
     2. Razorpay modal opens with payment form
     3. User enters payment details and submits
     4. Frontend receives payment response
     5. Frontend calls `/api/payments/verify` to verify signature
     6. Backend updates order with payment status
     7. Frontend navigates to confirmation page

   - **For COD**:
     1. Order created directly with status "pending"
     2. Frontend navigates to confirmation page

### 5. **Order Confirmation - Step 3**
   - User sees order confirmation with details
   - User can track order in admin dashboard

## API Endpoints

### Create Payment Order
```
POST /api/payments/create-order
Body: {
  amount: number (in rupees),
  orderId: string,
  customerEmail: string,
  customerName: string,
  customerPhone: string
}
Response: {
  success: boolean,
  razorpayOrderId: string,
  amount: number (in paise),
  currency: "INR"
}
```

### Verify Payment
```
POST /api/payments/verify
Body: {
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
  orderId: string (MongoDB order ID)
}
Response: {
  success: boolean,
  message: string,
  paymentId: string
}
```

### Get Payment Details
```
GET /api/payments/details/:paymentId
Response: {
  success: boolean,
  payment: {
    id: string,
    amount: number,
    currency: string,
    status: string,
    method: string,
    email: string,
    contact: string,
    createdAt: string
  }
}
```

### Process Refund
```
POST /api/payments/refund
Body: {
  paymentId: string,
  amount: number (optional, full amount if not specified),
  reason: string
}
Response: {
  success: boolean,
  refund: {
    id: string,
    amount: number,
    status: string,
    reasonCode: string
  }
}
```

## Testing

### Test Cards (Use with Razorpay Test Keys)

**Success Cases:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Failure Cases:**
- Card: 4444 3333 2222 1111
- (Will fail at OTP/verification stage)

### Test UPI
- Any test number ending in @okhdfcbank (e.g., 9123456789@okhdfcbank)

## Troubleshooting

### Payment modal doesn't open
- Check that Razorpay script loaded successfully in browser console
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors

### Payment verification fails
- Ensure `RAZORPAY_KEY_SECRET` is correct in backend
- Check that payment signature is being sent correctly
- Verify timestamp hasn't expired

### "Payment service not configured" error
- Ensure environment variables are set in `.env`
- Restart the backend server after setting variables
- Check that razorpay package is installed (`npm install razorpay`)

### Order doesn't get created after successful payment
- Check browser network tab for `/api/orders` POST request
- Verify MongoDB connection is working
- Check backend logs for error details

## Security Best Practices

1. **Never commit `.env` file** - Keep it in `.gitignore`
2. **Use Test Keys in development** - Switch to Live Keys only in production
3. **Verify all signatures** - Always verify payment signatures on the backend
4. **HTTPS in production** - Always use HTTPS for payment requests
5. **PCI Compliance** - Never store card data on your servers
6. **Rate Limiting** - Backend already has rate limiting configured

## Production Checklist

Before going live:
- [ ] Switch to Razorpay Live Keys
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live keys
- [ ] Test with real (small) payments
- [ ] Enable HTTPS on frontend and backend
- [ ] Set up email notifications for orders
- [ ] Configure admin dashboard for order management
- [ ] Set up backup/recovery procedures
- [ ] Monitor payment logs and errors

## Support

For Razorpay support and documentation:
- Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com
- Support: https://razorpay.com/contact-us/

For application-specific issues:
- Check the `/admin/orders` dashboard
- Review backend logs in `/Backend/src/controllers/payment.controller.js`
- Check browser console for frontend errors

## File Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── payment.controller.js (NEW)
│   │   └── order.controller.js
│   ├── routes/
│   │   ├── payment.router.js (NEW)
│   │   └── order.router.js
│   └── app.js (UPDATED)
├── .env.example (NEW)
└── package.json (NEEDS: npm install razorpay)

Frontend/
├── src/
│   ├── services/
│   │   └── paymentService.js (UPDATED)
│   └── app/
│       └── checkout/
│           └── page.js (UPDATED)
└── .env.local (ADD RAZORPAY_KEY_ID)
```

## Next Steps

1. Install razorpay package: `npm install razorpay`
2. Set up environment variables in `.env`
3. Restart backend server
4. Test checkout flow with test cards
5. Monitor admin dashboard for orders

Happy coding! 🚀
