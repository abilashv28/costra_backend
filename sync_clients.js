require("dotenv").config({ path: ".env" });
const db = require("./models");

async function syncDB() {
  try {
    console.log("Syncing Client table...");
    await db.Client.sync({ alter: true });
    console.log("Syncing Project table...");
    await db.Project.sync({ alter: true });
    console.log("Done syncing successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing:", err);
    process.exit(1);
  }
}

syncDB();
