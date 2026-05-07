function buildStandardResponse(payload, res) {
  const statusCode = res.statusCode || 200;
  const isError = statusCode >= 400;

  if (payload && payload.success !== undefined && payload.message !== undefined && payload.data !== undefined && payload.error !== undefined) {
    return payload;
  }

  const response = {
    success: !isError,
    message: null,
    data: null,
    meta: null,
    error: null,
  };

  if (payload == null || Array.isArray(payload) || typeof payload !== "object") {
    response.data = payload;
    return response;
  }

  const { message, data, meta, error, success, ...rest } = payload;

  const hasStandardKeysOnly = Object.keys(rest).length === 0;

  if (hasStandardKeysOnly) {
    response.message = message ?? null;
    response.data = data ?? null;
    response.meta = meta ?? null;
    response.error = error ?? null;
    return response;
  }

  response.message = message ?? null;
  response.meta = meta ?? null;
  response.error = error ?? null;

  if (data !== undefined) {
    response.data = typeof data === "object" && data !== null ? { ...data, ...rest } : { value: data, ...rest };
  } else {
    response.data = Object.keys(rest).length ? rest : null;
  }

  return response;
}

function responseWrapper(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const responsePayload = buildStandardResponse(payload, res);
    return originalJson(responsePayload);
  };

  next();
}

module.exports = {
  responseWrapper,
  buildStandardResponse,
};
