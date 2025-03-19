exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  res
    .status(err.staus || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
};
