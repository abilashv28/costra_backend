const expenseRequestService = require("../services/expenserequest.service");

exports.createRequest = async (req, res) => {
  try {
    const request = await expenseRequestService.createRequest(req.body, req.employee);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await expenseRequestService.getRequests(req.employee);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure admin only
    if (!['admin', 'superadmin', 'super admin'].includes(req.employee.role?.toLowerCase())) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await expenseRequestService.approveRequest(id, req.employee);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!['admin', 'superadmin', 'super admin'].includes(req.employee.role?.toLowerCase())) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const request = await expenseRequestService.rejectRequest(id, rejection_reason, req.employee);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
