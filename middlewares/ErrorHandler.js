const ErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  /* -------------------- Mongoose CastError -------------------- */
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  /* -------------------- Mongoose ValidationError -------------------- */
  else if (err.name === "ValidationError") {
    statusCode = 400;

    // Collect all validation messages
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(statusCode).json({
      status: "error",
      statusCode,
      message: "Validation failed",
      errors,
    });
  }

  /* -------------------- Mongo Duplicate Key Error -------------------- */
  else if (err.code === 11000) {
    statusCode = 400;

    const duplicatedField = err.keyValue
      ? Object.keys(err.keyValue)[0]
      : null;
    const duplicatedValue = err.keyValue
      ? err.keyValue[duplicatedField]
      : null;

    if (duplicatedField && duplicatedValue) {
      message = `Duplicate value for field '${duplicatedField}': '${duplicatedValue}'. Please use a different value.`;
    } else {
      const matches = err.message.match(
        /index:\s+([a-zA-Z0-9_]+)_1 dup key: { :?"?([^ "}]+)"? }/
      );
      message = matches
        ? `Duplicate value for field '${matches[1]}': '${matches[2]}'. Please use a different value.`
        : "Duplicate key error.";
    }
  }

  /* -------------------- Default Error -------------------- */
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default ErrorHandler;
