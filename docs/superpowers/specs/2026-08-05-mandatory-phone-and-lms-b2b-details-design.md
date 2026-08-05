# Mandatory Phone Field & LMS B2B Details Design Document

**Date**: 2026-08-05  
**Topic**: Mandatory Phone Field for All Purchases & Separate Business Name / GSTIN Columns on LMS

---

## 1. Overview
This feature introduces a mandatory contact phone number requirement across all checkout purchases (individual subscriptions and institute batch plans) on NeetBand. Additionally, for Institute / B2B purchases, the LMS Admin panel (`ManageInstitutePurchases`) is updated to display **Business Name** and **GSTIN** in separate, dedicated columns alongside contact details and multi-field search support.

---

## 2. Requirements

### 2.1 Checkout Page (`Checkout.jsx`)
1. **Mandatory Phone Field**:
   - Add a required "Contact Phone Number" input field on the checkout screen for **all** purchase types (`premium_scholar`, `inst_20`, `inst_50`, etc.).
   - Pre-fill from `user.phone` if available in local user state.
   - Validate that the phone number is non-empty before initiating checkout or coupon redemption. Show clear error feedback if empty.
2. **Institutional B2B Details**:
   - Maintain the B2B invoice inputs (`Business Name` and `GSTIN`) for Institute plans (`inst_20`, `inst_50`).
3. **Payload & Data Flow**:
   - Pass `phone`, `businessName`, and `gstin` in `shippingDetails` to `createPaymentOrder` and `redeemFreeCoupon`.

### 2.2 Backend (`paymentController.js` & `api.js`)
1. **Order Record & User Profile Persistence**:
   - Ensure `createOrder`, `fulfillOrderInternal`, and `redeemFreeCoupon` store `phone`, `businessName`, and `gstin` inside `order.shippingDetails`.
   - Update `user.phone` on the `User` model if the user didn't already have a saved phone number.

### 2.3 LMS Admin Panel (`ManageInstitutePurchases.jsx`)
1. **Separate Columns for B2B Details**:
   - Re-architect table columns to explicitly include:
     - **User**: Name & Email
     - **Phone**: User/Shipping Phone number
     - **Business Name**: Institution / Business Name (or `-` if empty)
     - **GSTIN**: Formatted GSTIN code (or `-` if empty)
     - **Plan**: Badge showing plan name
     - **Amount**: ₹ Paid
     - **Date**: Purchase date
     - **Receipt**: View receipt link/action
2. **Enhanced Search**:
   - Update search filter to query across user name, email, phone, business name, and GSTIN.

---

## 3. Data Schema

### `Order.shippingDetails`
```json
{
  "phone": "9876543210",
  "businessName": "Apex Institute of Science",
  "gstin": "07AAAAA0000A1Z5"
}
```

---

## 4. Verification Plan

### Manual Testing Verification:
1. **Checkout Validation**:
   - Attempt to click payment button without filling phone number. Verify error is shown.
   - Enter phone number and complete checkout for standard plan.
   - Verify phone number is captured in DB order.
2. **Institute B2B Checkout**:
   - Complete checkout for `inst_20` or `inst_50` with phone number, Business Name ("Apex Institute"), and GSTIN ("07AAAAA0000A1Z5").
3. **LMS Admin Inspection**:
   - Open Admin -> Institute Purchases.
   - Verify Business Name and GSTIN appear in their respective separate columns.
   - Verify search filters work when searching for phone number, business name, or GSTIN.
