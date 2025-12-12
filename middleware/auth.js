const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = decoded;

      if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        if (!decoded.role || !requiredRoles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
      }

      next();
    } catch (err) {
      console.error('JWT error:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = auth;
