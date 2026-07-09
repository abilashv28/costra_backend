module.exports = (roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const role = req.employee.role?.toString().trim().toLowerCase();
    
    // Convert allowed roles to lowercase for comparison
    const normalizedRoles = roles.map(r => r.toLowerCase());
    
    if (normalizedRoles.includes(role)) {
      next();
    } else {
      return res.status(403).json({ message: "Forbidden: You don't have enough privileges" });
    }
  };
};
