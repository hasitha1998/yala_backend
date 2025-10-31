import Package from "./models/Package.js";
import "./config/db.js";

async function testPackageAPI() {
  try {
    console.log("Testing Package API...");

    // Wait for DB connection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Initialize if needed
    await Package.initialize();
    console.log("Package initialized");

    // Find current package
    const pkg = await Package.findOne().sort({ createdAt: -1 });
    console.log("Current package:", JSON.stringify(pkg, null, 2));

    // Test creating new package
    const testPackage = new Package({
      jeep: {
        basic: { morning: 15, afternoon: 15, extended: 17, fullDay: 20 },
        luxury: { morning: 17, afternoon: 17, extended: 19, fullDay: 22 },
        superLuxury: { morning: 20, afternoon: 20, extended: 22, fullDay: 25 },
      },
      shared: {
        1: 20,
        2: 18,
        3: 17,
        4: 15,
        5: 15,
        6: 15,
        7: 15,
      },
      meals: {
        breakfast: 15,
        lunch: 16,
      },
      guide: {
        driver: 5,
        driverGuide: 15,
        separateGuide: 25,
      },
    });

    await testPackage.save();
    console.log("Test package saved");

    // Fetch latest
    const latest = await Package.findOne().sort({ createdAt: -1 });
    console.log("Latest package:", JSON.stringify(latest, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testPackageAPI();
