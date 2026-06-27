import jwt from 'jsonwebtoken';

/**
 * Express middleware to authenticate secure API calls with Bearer Tokens
 */
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Portal authentication required. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // holds id, email, role
    next();
  } catch (error) {
    console.error('JWT token verification failure:', error.message);
    return res.status(401).json({ error: 'Session expired or token invalid. Please sign in again.' });
  }
};

/**
 * Access Control Authorization based on corporate Portal Roles
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied. Required authorization clearance levels are: [${allowedRoles.join(', ')}].` 
      });
    }
    next();
  };
};
