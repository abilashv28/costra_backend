require("dotenv").config({ path: ".env" });
const db = require("./models");
const bcrypt = require("bcryptjs");

async function syncAndSeed() {
  try {
    console.log("Starting sync with force: true...");
    await db.sequelize.sync({ force: true });
    console.log("Database synced successfully.");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const superAdmin = await db.Employee.create({
      name: "Super Admin",
      email: "admin@costra.com",
      password: hashedPassword,
      plain_password: "admin123",
      role: "superadmin",
      department: "Management",
      designation: "CEO",
      base_salary: 0,
      company_id: null,
      is_active: true
    });
    
    await superAdmin.update({ recorded_by: superAdmin.id });

    console.log("Super admin created: admin@costra.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

syncAndSeed();
