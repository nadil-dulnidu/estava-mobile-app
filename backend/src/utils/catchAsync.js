// Async wrapper to forward controller/service errors to central error middleware.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};