# 🚀 BillEasy POS - Client Setup Guide

Welcome to your new Smart Billing Partner! Follow these simple steps to get your POS system up and running.

## 📋 Prerequisites
1. **Node.js Installed**: Download and install from [nodejs.org](https://nodejs.org/).
2. **Thermal Printer**: Ensure your USB thermal printer is plugged in and turned on.

---

## 🛠️ One-Time Setup
1. **Extract the Folder**: Unzip the `BillEasy` folder to your Desktop.
2. **Install Dependencies**: 
   - Open the `print-agent` folder.
   - Hold `Shift` and Right-click in the folder, then select "Open PowerShell window here".
   - Type `npm install` and press Enter.

---

## ⚡ Daily Start-up (Single Click)
To start your billing system every morning:
1. Double-click the **`run_pos.bat`** file located in the main folder.
2. This will:
   - Start the **Local Print Agent** (required for the thermal printer).
   - Open the **Billing Dashboard** in your Chrome browser.

---

## 🖨️ Printer Troubleshooting
If the printer icon in the top right of the screen is **Red (Offline)**:
1. Ensure the USB cable is connected.
2. Make sure the "Print Agent" window (black box) is still open.
3. Refresh the page in your browser.

---

## ☁️ Data Sync
- Your bills are saved **locally** first, so you can work even without internet.
- When internet is available, they will automatically sync to your **Cloud Dashboard**.

---

*Need help? Contact your developer for support.*
