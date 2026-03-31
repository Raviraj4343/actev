const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (typeof next === 'function') return next(err);
      // Fallback: if `next` is not available, send a 500 response and log the error
      console.error('Unhandled async error (no next):', err);
      try{
        res.status(500).json({ success: false, statusCode: 500, message: err.message || 'Internal server error' });
      }catch(e){
        console.error('Also failed to send 500 response:', e);
      }
    });
  };
};

export default asyncHandler;