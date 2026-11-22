const asyncHandler = require('express-async-handler');
const HttpError = require('../helpers/httpError');
const { verifySessionToken } = require('../helpers/tokens');
const UserModel = require('../models/userModel');
const UserSessionModel = require('../models/userSessionModel');

// A request is authenticated when its bearer token is a valid, unexpired JWT,
// still has an active session row (so logout works), and belongs to an active user.
const auth = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Not authorized');
  }

  const decoded = verifySessionToken(token);
  if (!decoded) {
    throw new HttpError(401, 'Not authorized');
  }

  const session = await UserSessionModel.findOne({ sessionToken: token, isActive: true });
  if (!session) {
    throw new HttpError(401, 'Not authorized');
  }

  const user = await UserModel.findOne({ _id: decoded.userId, isActive: true });
  if (!user) {
    throw new HttpError(401, 'Not authorized');
  }

  req.user = user;
  req.sessionToken = token;
  next();
});

// Must run after `auth`.
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  next(new HttpError(403, 'Not authorized since you are not admin'));
};

// Allows the request when the :param in the URL is the caller's own id, or the
// caller is an admin. Prevents one customer reading or editing another's data.
const selfOrAdmin = (paramName) => (req, res, next) => {
  if (req.user.isAdmin || String(req.user._id) === req.params[paramName]) {
    return next();
  }
  next(new HttpError(403, 'Not authorized to access this resource'));
};

module.exports = { auth, isAdmin, selfOrAdmin };
