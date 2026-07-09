require("dotenv").config({ path: ".env" });
const db = require("./models");
const bcrypt = require("bcryptjs");

async function clearAndSeed() {
  try {
    console.log("Wiping database and syncing tables...");
    // force: true drops all tables and recreates them empty
    await db.sequelize.sync({ force: true });
    console.log("Database cleared successfully.");

    console.log("Seeding admin account...");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const superAdmin = await db.Employee.create({
      name: "Abilash Vishnudoss",
      email: "abilashv281999@gmail.com",
      password: hashedPassword,
      plain_password: "Admin@123",
      role: "superadmin",
      department: "Management",
      designation: "CEO",
      base_salary: 0,
      company_id: null,
      is_active: true
    });
    
    await superAdmin.update({ recorded_by: superAdmin.id });

    console.log("Super admin created: abilashv281999@gmail.com / Admin@123");
    process.exit(0);
  } catch (error) {
    console.error("Operation failed:", error);
    process.exit(1);
  }
}

clearAndSeed();
