module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: {
      message: err.message || "Internal Server Error",
      code: err.code || null,
      details: err.details || null,
    },
    data: null,
    meta: null,
  });
};