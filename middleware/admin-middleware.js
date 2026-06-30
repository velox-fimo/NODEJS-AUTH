

const isAdminUser = (req, res, next) => {
  if(req.userinfo.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. admin rights required."
    });
  }
  next();
};

module.exports = isAdminUser;