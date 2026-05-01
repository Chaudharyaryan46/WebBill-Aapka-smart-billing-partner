const express = require('express');
const cors = require('cors');
const escpos = require('escpos');
const logger = require('pino')({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

escpos.USB = require('escpos-usb');
escpos.Serial = require('escpos-serialport');

const app = express();
const PORT = 3001;

// CONFIG: Set your Bluetooth COM Port here if using Bluetooth
// On Windows, pair the printer and find the COM port in Bluetooth Settings > Outgoing Port
const COM_PORT = process.env.COM_PORT || 'COM3'; 

app.use(cors());
app.use(express.json());

// Health check
app.get('/status', (req, res) => {
  try {
    const usbDevices = escpos.USB.findPrinter();
    res.json({ 
      usbConnected: usbDevices.length > 0,
      bluetoothPort: COM_PORT,
      timestamp: new Date().toISOString(),
      usbDevices: usbDevices.length 
    });
  } catch (err) {
    logger.error('Status check failed', err);
    res.json({ usbConnected: false, error: err.message });
  }
});

/**
 * 📠 Universal Print Function
 * Attempts USB first, then falls back to Serial/Bluetooth
 */
async function printUniversal(text) {
  return new Promise((resolve, reject) => {
    let device = null;
    let adapterType = 'USB';

    try {
      const usbDevices = escpos.USB.findPrinter();
      if (usbDevices.length > 0) {
        device = new escpos.USB();
        adapterType = 'USB';
      } else {
        logger.info(`No USB printer. Attempting Bluetooth/Serial on ${COM_PORT}...`);
        device = new escpos.Serial(COM_PORT, { baudRate: 9600 });
        adapterType = 'Bluetooth/Serial';
      }

      device.open((err) => {
        if (err) {
          logger.error(`Failed to open ${adapterType} device`, err);
          return reject(new Error(`${adapterType} connection failed: ${err.message}`));
        }

        try {
          const printer = new escpos.Printer(device);
          printer
            .font('a')
            .align('ct')
            .size(1, 1)
            .text(text)
            .feed(3)
            .cut()
            .close(() => {
              logger.info(`${adapterType} print job completed successfully`);
              resolve({ success: true, adapter: adapterType });
            });
        } catch (printErr) {
          logger.error(`${adapterType} Printing error`, printErr);
          device.close();
          reject(printErr);
        }
      });
    } catch (err) {
      logger.error('Critical error during device selection', err);
      reject(err);
    }
  });
}

// Print logic
app.post('/print', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Payload missing text field' });
  }

  logger.info('Printing new bill...');

  try {
    const result = await printUniversal(text);
    res.json(result);
  } catch (err) {
    logger.error('Print request failed', err);
    res.status(500).json({ error: 'Print failed', detail: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 BillEasy Dual Print Agent live at http://localhost:${PORT}`);
  logger.info(`Configuration: USB (Auto) | Bluetooth (${COM_PORT})`);
  
  try {
    const devices = escpos.USB.findPrinter();
    logger.info(`USB: Found ${devices.length} printer(s)`);
  } catch (e) {
    logger.warn('Initial USB scan failed.');
  }
});
