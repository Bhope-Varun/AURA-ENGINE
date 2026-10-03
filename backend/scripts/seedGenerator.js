import { faker } from '@faker-js/faker';

export const CATEGORIES = [
  'Electronics',
  'Audio',
  'Computers',
  'Mobile',
  'Gaming',
  'Home Appliances',
  'Accessories',
  'Networking',
  'Cameras',
  'Wearables',
];

const CATEGORY_PREFIXES = {
  Electronics: 'ELEC',
  Audio: 'AUD',
  Computers: 'COMP',
  Mobile: 'MOBL',
  Gaming: 'GAME',
  'Home Appliances': 'APPL',
  Accessories: 'ACCS',
  Networking: 'NETW',
  Cameras: 'CAMR',
  Wearables: 'WEAR',
};

const BRAND_NAMES = [
  'Apex', 'Vanguard', 'Omni', 'Titan', 'Spectra', 'Echo', 'Horizon',
  'Nova', 'Pinnacle', 'Pulse', 'Vertex', 'Aero', 'Quantum', 'Nexus',
  'Zenith', 'Prism', 'Matrix', 'Sonic', 'Hyper', 'Stealth', 'Forge'
];

const PRODUCT_NOUNS = {
  Electronics: ['Power Station', 'Surge Protector', 'Smart Plug', 'Voltage Regulator', 'LED Driver', 'Digital Multimeter', 'AC Inverter'],
  Audio: ['Wireless Noise-Canceling Headphones', 'Studio Studio Monitor', 'Soundbar Pro', 'In-Ear Monitors', 'Desktop DAC Amplifier', 'Bluetooth Speaker'],
  Computers: ['Ultrabook 15-inch', 'Workstation Desktop', 'Mechanical Keyboard', 'Ergonomic Vertical Mouse', 'Thunderbolt 4 Dock', 'NVMe SSD 2TB'],
  Mobile: ['Flagship 5G Smartphone', 'OLED Tablet 11-inch', 'Wireless Fast Charger Pad', 'MagSafe Battery Pack', 'Rugged Armor Case'],
  Gaming: ['Mechanical RGB Keyboard', 'Ultra-Light Gaming Mouse', 'Pro Wireless Controller', 'Curved Gaming Display 34-Inch', 'Flight Simulator Stick'],
  'Home Appliances': ['Smart Air Purifier HEPA', 'Robot Vacuum & Mop', 'Infrared Induction Cooktop', 'Precision Espresso Machine', 'Digital Air Fryer'],
  Accessories: ['Braided USB-C Cable 2M', 'Aluminum Laptop Stand', 'Desk Mat Leather 900x400', 'Travel Cable Organizer', 'GaN 100W Multi-Port Charger'],
  Networking: ['Wi-Fi 7 Tri-Band Router', '24-Port Gigabit Managed Switch', 'Mesh Wi-Fi Node', 'Outdoor Access Point POE', 'Patch Panel Cat6A'],
  Cameras: ['Mirrorless Full-Frame Camera', 'Prime Lens 50mm f/1.4', 'Carbon Fiber Tripod', '4K 60FPS Video Capture Card', 'Bi-Color LED Ring Light'],
  Wearables: ['Fitness GPS Smartwatch', 'Heart Rate Tracker Strap', 'Smart Health Ring', 'Titanium Smartwatch Band', 'Bone Conduction Headset'],
};

export const generateProductsBatch = (batchSize, offset = 0) => {
  const batch = new Array(batchSize);

  for (let i = 0; i < batchSize; i++) {
    const globalIndex = offset + i + 1;
    const categoryIndex = (globalIndex + i) % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];
    const prefix = CATEGORY_PREFIXES[category] || 'ITEM';

    // Strictly guaranteed unique SKU format: PREFIX-PADDEDNUMBER-HEX
    const paddedNum = String(globalIndex).padStart(6, '0');
    const sku = `${prefix}-${paddedNum}`;

    const brand = BRAND_NAMES[(globalIndex + i * 3) % BRAND_NAMES.length];
    const nouns = PRODUCT_NOUNS[category] || ['Item'];
    const noun = nouns[(globalIndex + i) % nouns.length];
    const modelTag = `X${(globalIndex % 900) + 100}`;
    const productName = `${brand} ${noun} ${modelTag}`;

    // Realistic price & cost structure: price >= cost
    // Baseline cost between $10 and $1,800
    const rawCost = faker.number.float({ min: 12, max: 1400, fractionDigits: 2 });
    const markupMultiplier = faker.number.float({ min: 1.15, max: 2.1, fractionDigits: 2 });
    const rawPrice = Number((rawCost * markupMultiplier).toFixed(2));
    const cost = Number(rawCost.toFixed(2));
    const price = Math.max(cost, rawPrice);

    // Varied stock distributions: ~85% in stock, ~10% low stock, ~5% out of stock
    const stockRoll = (globalIndex + i * 7) % 100;
    let stockQuantity = 0;
    let reorderLevel = faker.number.int({ min: 10, max: 60 });

    if (stockRoll < 5) {
      stockQuantity = 0; // Out of stock
    } else if (stockRoll < 15) {
      stockQuantity = faker.number.int({ min: 1, max: reorderLevel }); // Low stock
    } else {
      stockQuantity = faker.number.int({ min: reorderLevel + 1, max: 850 }); // Normal healthy stock
    }

    const lastUpdated = faker.date.recent({ days: 45 });

    batch[i] = {
      productName,
      sku,
      category,
      price,
      cost,
      stockQuantity,
      reorderLevel,
      lastUpdated,
    };
  }

  return batch;
};
