# BillEasy - USB Thermal Printing MVP

A working prototype of a web-based billing SaaS with local USB thermal printer support.

## Project Structure

- `/frontend`: Next.js web application (localhost:3000)
- `/print-agent`: Node.js Express server for hardware communication (localhost:3001)

## Setup & Running

### 1. Local Print Agent
Connect your USB thermal printer before starting.

```bash
cd print-agent
npm install
npm start
```

### 2. Frontend App
```bash
cd frontend
npm install
npm run dev
```

## How to Test

1. Ensure the **Print Agent** is running.
2. Open `http://localhost:3000` in your browser.
3. You should see "Printer Connected" in green (if agent is running).
4. Add items to the bill.
5. Click **Print Bill**.
6. Your thermal printer should instantly print the receipt and cut the paper.

## Hardware Requirements
- USB Thermal Receipt Printer (58mm or 80mm)
- For Windows: You might need to install generic USB drivers using [Zadig](https://zadig.akeo.ie/) if the printer is not automatically recognized by the `escpos` library.

## API Endpoints (Print Agent)
- `GET /status`: Check agent and printer connectivity.
- `GET /devices`: List detected USB printers.
- `POST /print`: Send `{ text: "..." }` to print.
