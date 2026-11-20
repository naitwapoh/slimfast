# SLIMFAST — 100% Organic Herbal Weight Management & Detox
### Full-Stack E-Commerce Web Application & Business Management System (BMS)

A production-ready, full-stack e-commerce web platform and integrated Business Management System built for **SLIMFAST**, an authentic herbal weight-loss and wellness brand selling across Tanzania, Kenya, Uganda, Rwanda, and Africa at large.

---

## 🌿 Brand Identity & Design System
- **Deep Herbal Forest Green (`#2E6F24`):** Primary brand authority, wellness, and vitality.
- **Fresh Leaf Lime Green (`#8CB83E`):** Secondary accent, energy, and organic certification badges.
- **Soft Botanical Mint Surface (`#F4F8F2`):** Clean, refreshing user experience.
- **Charcoal Forest (`#1A2E19`):** High readability, accessible typography.
- **Pure White Cards:** Crisp product packaging showcases.

---

## 🌍 Key Features

### 1. Bilingual Storefront (`EN` | `SW`)
- Instant real-time language switcher (`EN` | `SW`) in the top navigation bar.
- Translates the entire catalog, checkout process, brewing rituals, health benefits, and Business Management System between **English** and **Swahili**.

### 2. Pan-African Currency Switcher
- Live multi-currency engine supporting:
  - `TZS` (Tanzanian Shilling - Base)
  - `KES` (Kenyan Shilling)
  - `UGX` (Ugandan Shilling)
  - `RWF` (Rwandan Franc)
  - `NGN` (Nigerian Naira)
  - `ZAR` (South African Rand)
  - `USD` (US Dollar)
- Owner-managed exchange rates stored and synchronized in real time via Firestore (`settings/currency`).

### 3. Dynamic Product Catalog (Strict No Demo Data Rule)
- Direct real-time reads from Firestore `products` collection with clean empty states until real items are added.
- Designed for SLIMFAST's core lineup:
  1. **SLIMFAST Best Slimming Tea (Jar):** Moringa oleifera, Black Pepper, Great Basil, Garcinia Cambogia, Fennel.
  2. **SLIMFAST Bean Powder for Weight Loss (250g Pouch):** Unroasted Arabica AAA Decaffeinated Beans with green tea and dandelion purifying herbs.
- Includes batch number and expiry tracking (e.g., `FEB 2027`), ingredient breakdowns, and brewing/dosage directions.

### 4. Pan-African Checkout & WhatsApp Dispatch
- Slide-over shopping bag drawer with quantity controls.
- Checkout capturing customer WhatsApp number, destination country (Tanzania, Kenya, Uganda, Rwanda, Burundi, DR Congo, Nigeria, South Africa, etc.), city, and address.
- Multiple payment options: Mobile Money (M-Pesa, Tigo Pesa, Airtel Money), Cash on Delivery, or Bank Card.
- Direct write to Firestore `orders` collection + automatic inventory deduction.
- **One-Click WhatsApp Order Confirmation:** Pre-fills order details and item summaries directed to official customer care at `+255 752 613 616`.

### 5. Integrated Business Management System (BMS)
Accessible via the discrete **"Staff & Owner Portal (Mlango wa Usimamizi)"** link in the footer:
- **First-Time Setup Guard:** Automatically detects if `users` collection is empty and allows the first registered user to claim the **Business Owner (`owner`)** role without requiring manual database edits.
- **Role 1: Shop Worker (`worker`):**
  - **Point of Sale (POS):** Instant counter walk-in sales recording, stock decrement, and thermal receipt printing.
  - **Order Fulfillment:** Incoming Pan-African order tracking, status progression (`Pending` ➔ `Confirmed` ➔ `Dispatched` ➔ `Delivered`), and printable packing slips/invoices.
  - **Stock Check:** Real-time read-only inventory visibility.
- **Role 2: Business Owner (`owner`):**
  - **Real-Time Analytics Dashboard:** Live KPI cards strictly calculated from Firestore (Gross Revenue, Total Orders, Net Profit after Expenses, Low-Stock Alerts, and Regional Sales Distribution).
  - **Product & Inventory Management:** Add, edit, delete products, restock batches with expiry dates, and upload product photos directly to **Firebase Storage**.
  - **Owner 1-Click Quick Seed:** Quickly seed official SLIMFAST products into Firestore when initializing a new catalog.
  - **Expense & Financial Ledger:** Track overheads (packaging, shipping courier fees, marketing, raw herbs, wages) to calculate true net profit.
  - **Staff Management:** Create shop worker accounts, assign roles, activate/deactivate access, and inspect comprehensive audit logs.
  - **Exchange Rates & Settings:** Adjust African currency exchange rates dynamically.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide React icons
- **Backend & Database:** Firebase v10 Modular SDK (`firebase/auth`, `firebase/firestore`, `firebase/storage`)
- **Security:** `firestore.rules` and `storage.rules` enforcing role-based permissions

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/naitwapoh/slimfast.git
cd slimfast
npm install
```

### 2. Configure Firebase
Create or open the `.env` file in the root directory and paste your Firebase Web App credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Where to find these keys:**
> 1. Go to [Firebase Console](https://console.firebase.google.com/).
> 2. Open your project ➔ Project Settings (gear icon) ➔ **General**.
> 3. Under **Your apps**, select your Web App and copy the `firebaseConfig` object values into `.env`.
> 4. Ensure **Authentication** (Email/Password), **Cloud Firestore**, and **Cloud Storage** are enabled in your project.

### 3. Deploy Firestore & Storage Security Rules
Run the following commands using the Firebase CLI or copy the rules directly into your Firebase Console:

- **Firestore Rules:** Deploy `firestore.rules`
- **Storage Rules:** Deploy `storage.rules`

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 First-Time Owner Initialization
1. Start the app and scroll to the bottom of the footer.
2. Click **"Staff & Owner Portal (Mlango wa Usimamizi)"**.
3. The system will detect that no staff accounts exist yet and display the **First-Time Setup Guard**.
4. Register your email and password to automatically claim the **Business Owner (`owner`)** role.
5. In the BMS dashboard under **Products & Stock**, click **"Quick Seed: Load Official SLIMFAST Products"** to instantly populate the official SLIMFAST Slimming Tea and Bean Powder with ingredients, instructions, and batch records.

---

## 📞 Official Contacts
- **Customer Care & Orders (WhatsApp):** `+255 752 613 616`
- **Additional Support Lines:** `+255 752 924 855`, `+255 758 412 408`, `+255 783 032 211`
- **Official Email:** `slimfastslimmingtea@gmail.com`

---

© SLIMFAST Herbal Solutions. All Rights Reserved. Handcrafted for Africa.
