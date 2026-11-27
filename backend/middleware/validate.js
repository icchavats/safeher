export const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, password, and phone number',
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }
  next();
};

export const validateContact = (req, res, next) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Contact name and phone number are required',
    });
  }
  next();
};
