# Mandatory Phone Field & LMS B2B Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a contact phone number on all checkout purchases, persist B2B details (`phone`, `businessName`, `gstin`), and display `Business Name` and `GSTIN` in dedicated separate columns in the LMS Institute Purchases admin table.

**Architecture:** 
Frontend `Checkout.jsx` adds mandatory phone input and validation for all plans, bundling `phone`, `businessName`, and `gstin` into `shippingDetails`. Backend `paymentController.js` saves these fields into `Order.shippingDetails` and populates `user.phone`. `ManageInstitutePurchases.jsx` in LMS updates table columns and multi-field search to display Phone, Business Name, and GSTIN separately.

**Tech Stack:** React, Node.js / Express, MongoDB / Mongoose, Tabler Icons, Tailwind CSS / Vanilla CSS tokens.

## Global Constraints
- Mandatory Phone field validation required for all checkout transactions.
- B2B `businessName` and `gstin` displayed in separate columns on LMS Institute Purchases view.
- Support multi-field search across Name, Email, Phone, Business Name, and GSTIN.

---

### Task 1: Backend Persistence for Shipping/B2B Details and Free Coupon Handler

**Files:**
- Modify: `backend/src/controllers/paymentController.js:148-175`, `backend/src/controllers/paymentController.js:602-690`
- Modify: `frontend/src/services/api.js:537-544`

**Interfaces:**
- Consumes: `req.body.shippingDetails` containing `{ phone, businessName, gstin }`
- Produces: `Order.shippingDetails` populated with `phone`, `businessName`, and `gstin`; updates `user.phone` if unset.

- [ ] **Step 1: Update `redeemFreeCoupon` in `backend/src/controllers/paymentController.js` to accept `shippingDetails`**

```javascript
// In backend/src/controllers/paymentController.js inside redeemFreeCoupon
const { plan, discountCode, shippingDetails, billingCycle: rawBillingCycle } = req.body;
```

And update `Order` creation in `redeemFreeCoupon`:
```javascript
const orderDoc = new Order({
  user: req.user._id,
  razorpayOrderId: `free_coupon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  plan: validatedPlan,
  amount: 0,
  currency: 'INR',
  billingCycle,
  discountCode: normalizedCode,
  shippingDetails: shippingDetails || null,
  status: 'paid',
  fulfilled: true,
  paidAt: new Date()
});
```

Also if `shippingDetails?.phone` is provided and user has no phone set, save `user.phone`:
```javascript
if (shippingDetails?.phone && !user.phone) {
  user.phone = shippingDetails.phone;
  await user.save();
}
```

- [ ] **Step 2: Update `api.js` `redeemFreeCoupon` function signature**

```javascript
// In frontend/src/services/api.js
export const redeemFreeCoupon = async (plan, discountCode, billingCycle, shippingDetails = null) => {
  const res = await apiFetch(`${API_URL}/payments/redeem-free`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ plan, discountCode, billingCycle, shippingDetails }),
  });
  return handleResponse(res);
};
```

- [ ] **Step 3: Test backend payment suite**

Run: `node backend/test_payment_suite.js`
Expected: Payment test suite completes successfully.

- [ ] **Step 4: Commit Task 1**

```bash
git add backend/src/controllers/paymentController.js frontend/src/services/api.js
git commit -m "feat(backend): support shippingDetails and user phone in payment redemption and order fulfillment"
```

---

### Task 2: Frontend Mandatory Phone Field & B2B Inputs on Checkout

**Files:**
- Modify: `frontend/src/components/Checkout.jsx:39-44`, `frontend/src/components/Checkout.jsx:131-165`, `frontend/src/components/Checkout.jsx:388-415`

**Interfaces:**
- Consumes: `user.phone` for initial state fallback
- Produces: `shippingDetails` `{ phone: phone.trim(), businessName: businessName.trim(), gstin: gstin.trim() }` passed to payment creation and free coupon redemption.

- [ ] **Step 1: Add `phone` state initialized from `user.phone` in `Checkout.jsx`**

```javascript
const [phone, setPhone] = useState(user?.phone || '');
```

- [ ] **Step 2: Add validation check in `handlePurchase` in `Checkout.jsx`**

```javascript
if (!phone.trim()) {
  setError('Contact Phone Number is mandatory to complete purchase.');
  setIsLoading(false);
  return;
}
```

- [ ] **Step 3: Construct full `shippingDetails` payload in `handlePurchase`**

```javascript
const shippingDetails = {
  phone: phone.trim(),
  businessName: businessName.trim(),
  gstin: gstin.trim()
};
```

Pass `shippingDetails` to `createPaymentOrder` and `redeemFreeCoupon(selectedPlan, finalDiscountCode, billingCycle, shippingDetails)`.

- [ ] **Step 4: Render Mandatory Phone field UI for ALL plans, plus B2B Box for Institute plans in `Checkout.jsx`**

```jsx
{/* Contact Details (Mandatory Phone) */}
<div className="mb-6 p-4 bg-background/50 rounded-2xl border border-outline-variant/30">
  <label className="flex items-center gap-2 font-bold text-sm text-on-surface mb-3">
    <IconPhone size={16} className="text-primary" /> Contact Details <span className="text-error">*</span>
  </label>
  <div>
    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
      Phone Number <span className="text-error">*</span>
    </label>
    <input
      type="tel"
      placeholder="Enter 10-digit phone number"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      disabled={isLoading}
      required
      className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm"
    />
  </div>
</div>

{/* Institute Tax / B2B Details */}
{isInstitutePlan(selectedPlan) && (
  <div className="mb-6 p-4 bg-background/50 rounded-2xl border border-outline-variant/30">
    <label className="flex items-center gap-2 font-bold text-sm text-on-surface mb-3">
      <IconBuilding size={16} className="text-primary" /> Institutional B2B Invoice Details (Optional)
    </label>
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
          Institution / Business Name
        </label>
        <input
          type="text"
          placeholder="Institution / Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
          GSTIN (Optional)
        </label>
        <input
          type="text"
          placeholder="GSTIN (e.g. 07AAAAA0000A1Z5)"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm font-mono uppercase"
        />
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Commit Task 2**

```bash
git add frontend/src/components/Checkout.jsx
git commit -m "feat(checkout): add mandatory phone field and pass shipping details"
```

---

### Task 3: Display Business Name and GSTIN in Separate Columns on LMS Admin

**Files:**
- Modify: `frontend/src/components/Admin/ManageInstitutePurchases.jsx:27-34`, `frontend/src/components/Admin/ManageInstitutePurchases.jsx:81-135`

**Interfaces:**
- Consumes: `purchase.shippingDetails`, `purchase.user`
- Produces: Table with separate columns for User, Phone, Business Name, GSTIN, Plan, Amount, Date, Receipt.

- [ ] **Step 1: Update filtering logic in `ManageInstitutePurchases.jsx`**

```javascript
const filteredPurchases = purchases.filter(p => {
  const term = searchTerm.toLowerCase();
  const userName = (p.user?.name || '').toLowerCase();
  const userEmail = (p.user?.email || '').toLowerCase();
  const userPhone = (p.shippingDetails?.phone || p.user?.phone || '').toLowerCase();
  const businessName = (p.shippingDetails?.businessName || '').toLowerCase();
  const gstin = (p.shippingDetails?.gstin || '').toLowerCase();
  return userName.includes(term) || userEmail.includes(term) || userPhone.includes(term) || businessName.includes(term) || gstin.includes(term);
});
```

- [ ] **Step 2: Re-architect Table headers and row columns in `ManageInstitutePurchases.jsx`**

Headers:
```jsx
<tr className="bg-surface-variant/50 text-on-surface font-semibold text-sm border-b border-outline-variant/50">
  <th className="px-6 py-4 whitespace-nowrap">User</th>
  <th className="px-6 py-4 whitespace-nowrap">Phone</th>
  <th className="px-6 py-4 whitespace-nowrap">Business Name</th>
  <th className="px-6 py-4 whitespace-nowrap">GSTIN</th>
  <th className="px-6 py-4 whitespace-nowrap">Plan</th>
  <th className="px-6 py-4 whitespace-nowrap">Amount</th>
  <th className="px-6 py-4 whitespace-nowrap">Date</th>
  <th className="px-6 py-4 whitespace-nowrap text-right">Receipt</th>
</tr>
```

Body Rows:
```jsx
{filteredPurchases.map((purchase) => {
  const phone = purchase.shippingDetails?.phone || purchase.user?.phone;
  const bName = purchase.shippingDetails?.businessName;
  const gstin = purchase.shippingDetails?.gstin;

  return (
    <tr key={purchase._id} className="hover:bg-surface-variant/30 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-on-surface">{purchase.user?.name || 'Unknown User'}</div>
        <div className="text-on-surface-variant text-xs mt-0.5">{purchase.user?.email}</div>
      </td>
      <td className="px-6 py-4">
        {phone ? (
          <div className="flex items-center gap-1.5 text-on-surface font-medium">
            <IconPhone size={14} className="text-primary" />
            {phone}
          </div>
        ) : (
          <span className="text-on-surface-variant/60 italic">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-on-surface font-medium">
        {bName ? (
          <span>{bName}</span>
        ) : (
          <span className="text-on-surface-variant/60 italic">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {gstin ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-surface-variant text-on-surface border border-outline-variant/40">
            {gstin}
          </span>
        ) : (
          <span className="text-on-surface-variant/60 italic">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          {purchase.plan}
        </span>
      </td>
      <td className="px-6 py-4 font-medium text-on-surface">
        ₹{purchase.amount}
      </td>
      <td className="px-6 py-4 text-on-surface-variant">
        {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}
      </td>
      <td className="px-6 py-4 text-right">
        <a 
          href={`/receipt/${purchase._id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface text-xs font-medium rounded-lg transition-colors border border-outline-variant/50"
        >
          <IconReceipt size={16} /> Receipt
        </a>
      </td>
    </tr>
  );
})}
```

- [ ] **Step 3: Test rendering and check build**

Run build or syntax check to ensure clean React compilation.

- [ ] **Step 4: Commit Task 3**

```bash
git add frontend/src/components/Admin/ManageInstitutePurchases.jsx
git commit -m "feat(lms): display phone, business name, and gstin in separate columns on institute purchases"
```
