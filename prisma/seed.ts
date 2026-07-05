import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@electrocomp.com" },
    update: {},
    create: { name: "Admin User", email: "admin@electrocomp.com", password: adminPassword, role: "ADMIN" },
  });
  console.log("✅ Admin:", admin.email);

  // Demo client
  const clientPassword = await bcrypt.hash("client123456", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: { name: "Demo Client", email: "client@example.com", password: clientPassword, role: "CLIENT" },
  });
  console.log("✅ Client:", client.email);

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: "microcontrollers" }, update: {}, create: { name: "Microcontrollers", slug: "microcontrollers", description: "Arduino, ESP32, Raspberry Pi and more" } }),
    prisma.category.upsert({ where: { slug: "sensors" }, update: {}, create: { name: "Sensors", slug: "sensors", description: "Temperature, humidity, motion, distance sensors" } }),
    prisma.category.upsert({ where: { slug: "displays" }, update: {}, create: { name: "Displays", slug: "displays", description: "OLED, LCD, TFT displays" } }),
    prisma.category.upsert({ where: { slug: "power" }, update: {}, create: { name: "Power Modules", slug: "power", description: "Voltage regulators, battery chargers" } }),
    prisma.category.upsert({ where: { slug: "communication" }, update: {}, create: { name: "Communication", slug: "communication", description: "WiFi, Bluetooth, LoRa, RF modules" } }),
    prisma.category.upsert({ where: { slug: "kits" }, update: {}, create: { name: "Kits & Bundles", slug: "kits", description: "Starter kits and component bundles" } }),
  ]);
  const [micro, sensors, displays, power, comms, kits] = cats;
  console.log(`✅ ${cats.length} categories`);

  // Products (prices in Naira)
  const products = [
    { name: "Arduino Uno R3", slug: "arduino-uno-r3", description: "The classic Arduino Uno R3 microcontroller board based on ATmega328P. Perfect for beginners and experienced makers. Features 14 digital I/O pins, 6 analog inputs, USB connection, and 16MHz clock speed.", price: 12500, stock: 150, sku: "ARD-UNO-R3", featured: true, categoryId: micro.id, images: [] },
    { name: "ESP32 Development Board", slug: "esp32-dev-board", description: "Dual-core 240MHz processor with built-in WiFi and Bluetooth. 4MB flash, 520KB SRAM. Perfect for IoT projects. 38 GPIO pins, SPI, I2C, UART interfaces.", price: 6500, stock: 200, sku: "ESP32-DEV-V1", featured: true, categoryId: micro.id, images: [] },
    { name: "Arduino Nano", slug: "arduino-nano", description: "Compact Arduino board with ATmega328P. Same functionality as Uno in a smaller form factor. USB-C powered, breadboard friendly.", price: 4800, stock: 300, sku: "ARD-NANO", featured: false, categoryId: micro.id, images: [] },
    { name: "Raspberry Pi 4 Model B (4GB)", slug: "raspberry-pi-4-4gb", description: "Quad-core ARM Cortex-A72, 4GB RAM, dual 4K display support, USB 3.0, Gigabit Ethernet, WiFi and Bluetooth built in.", price: 45000, stock: 30, sku: "RPI4-4GB", featured: true, categoryId: micro.id, images: [] },
    { name: "DHT22 Temperature & Humidity Sensor", slug: "dht22-sensor", description: "High-accuracy digital temperature and humidity sensor. Range: -40°C to +80°C (±0.5°C), 0-100% RH. Single-wire digital interface, 3.3V–5V supply.", price: 2500, stock: 400, sku: "SEN-DHT22", featured: false, categoryId: sensors.id, images: [] },
    { name: "HC-SR04 Ultrasonic Distance Sensor", slug: "hc-sr04-ultrasonic", description: "Non-contact distance measurement 2cm to 400cm with 3mm accuracy. 5V operating voltage.", price: 1200, stock: 500, sku: "SEN-HCSR04", featured: false, categoryId: sensors.id, images: [] },
    { name: "PIR Motion Sensor Module", slug: "pir-motion-sensor", description: "Passive infrared motion detector. Detection range up to 7 metres, 110° angle. 3.3V–5V compatible.", price: 1800, stock: 300, sku: "SEN-PIR01", featured: false, categoryId: sensors.id, images: [] },
    { name: "Soil Moisture Sensor", slug: "soil-moisture-sensor", description: "Resistive soil moisture sensor with analog and digital output. Ideal for plant watering automation and agricultural projects.", price: 900, stock: 400, sku: "SEN-SOIL01", featured: false, categoryId: sensors.id, images: [] },
    { name: "0.96\" OLED Display Module (I2C)", slug: "oled-096-i2c", description: "128×64 pixel monochrome OLED display with I2C interface. SSD1306 driver, 3.3V and 5V compatible.", price: 3500, stock: 200, sku: "DISP-OLED096", featured: true, categoryId: displays.id, images: [] },
    { name: "16x2 LCD Display with I2C", slug: "lcd-16x2-i2c", description: "Classic 16 character × 2 line LCD with I2C backpack. Blue backlight, adjustable contrast, only 2 wires needed.", price: 2800, stock: 250, sku: "DISP-LCD162", featured: false, categoryId: displays.id, images: [] },
    { name: "LM2596 DC-DC Buck Converter", slug: "lm2596-buck-converter", description: "Adjustable step-down voltage regulator. Input: 4V–40V, Output: 1.25V–37V. Max 3A continuous current, up to 92% efficiency.", price: 1500, stock: 600, sku: "PWR-LM2596", featured: false, categoryId: power.id, images: [] },
    { name: "TP4056 Lithium Battery Charger", slug: "tp4056-lipo-charger", description: "Micro USB lithium battery charging module with over-charge and short circuit protection. 1A charge current.", price: 800, stock: 700, sku: "PWR-TP4056", featured: false, categoryId: power.id, images: [] },
    { name: "NRF24L01+ 2.4GHz Wireless Module", slug: "nrf24l01-wireless", description: "2.4GHz transceiver for wireless communication up to 100m open air. SPI interface, 250kbps to 2Mbps data rate.", price: 2200, stock: 300, sku: "COM-NRF24", featured: false, categoryId: comms.id, images: [] },
    { name: "SIM800L GSM/GPRS Module", slug: "sim800l-gsm", description: "Quad-band GSM/GPRS module for cellular connectivity in Nigeria. Send SMS, make calls, use GPRS data. AT command interface.", price: 5500, stock: 80, sku: "COM-SIM800L", featured: true, categoryId: comms.id, images: [] },
    { name: "Arduino Starter Kit", slug: "arduino-starter-kit", description: "Everything to get started: Arduino Uno, breadboard, jumper wires, LEDs, resistors, capacitors, sensors, servo motor and project guide.", price: 22000, stock: 50, sku: "KIT-ARD-STR", featured: true, categoryId: kits.id, images: [] },
    { name: "Component Variety Pack (500pcs)", slug: "component-variety-500", description: "500-piece assorted component kit. Resistors (20 values), capacitors, LEDs (10 colours), diodes, transistors, push buttons. Comes in a carry case.", price: 8500, stock: 100, sku: "KIT-VAR-500", featured: false, categoryId: kits.id, images: [] },
  ];

  let created = 0;
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
    created++;
  }
  console.log(`✅ ${created} products seeded`);

  // Sample project for demo client
  const existingProject = await prisma.project.findFirst({ where: { clientId: client.id } });
  if (!existingProject) {
    await prisma.project.create({
      data: {
        title: "Smart Greenhouse Monitoring System",
        description: "Build an automated greenhouse monitoring system using ESP32.\n\nRequirements:\n- Temperature and humidity monitoring (DHT22)\n- Soil moisture sensing (3 zones)\n- Automated watering relay control\n- Data logging\n- WiFi dashboard for remote monitoring",
        budget: 150000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        status: "ACTIVE",
        clientId: client.id,
        quote: 120000,
        depositPaid: true,
        adminNotes: "Client approved quote. PCB design underway.",
        milestones: {
          create: [
            { title: "Component selection & BOM", status: "COMPLETED", order: 0, completedAt: new Date() },
            { title: "PCB schematic design", status: "COMPLETED", order: 1, completedAt: new Date() },
            { title: "Firmware development", status: "IN_PROGRESS", order: 2 },
            { title: "Web dashboard", status: "PENDING", order: 3, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) },
            { title: "Testing & delivery", status: "PENDING", order: 4 },
          ],
        },
      },
    });
    console.log("✅ Sample project seeded");
  }

  // Sample order
  const firstProduct = await prisma.product.findFirst({ where: { slug: "arduino-uno-r3" } });
  const secondProduct = await prisma.product.findFirst({ where: { slug: "dht22-sensor" } });
  if (firstProduct && secondProduct) {
    const existingOrder = await prisma.order.findFirst({ where: { userId: client.id } });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          userId: client.id,
          total: 15000,
          status: "PAID",
          items: {
            create: [
              { productId: firstProduct.id, quantity: 1, price: 12500 },
              { productId: secondProduct.id, quantity: 1, price: 2500 },
            ],
          },
        },
      });
      console.log("✅ Sample order seeded");
    }
  }

  console.log("\n🎉 Done!");
  console.log("Admin:  admin@electrocomp.com / admin123456");
  console.log("Client: client@example.com / client123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
