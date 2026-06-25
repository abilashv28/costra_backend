require("dotenv").config({ path: ".env" });
const db = require("./models");

async function fixDb() {
  try {
    console.log("Adding columns to vendors table...");
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN country VARCHAR(255);');
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN state VARCHAR(255);');
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN city VARCHAR(255);');
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN area VARCHAR(255);');
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN latitude FLOAT;');
    await db.sequelize.query('ALTER TABLE vendors ADD COLUMN longitude FLOAT;');
    console.log("Columns added successfully.");
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log("Columns already exist.");
      process.exit(0);
    } else {
      console.error("Error modifying DB:", error);
      process.exit(1);
    }
  }
}

fixDb();
