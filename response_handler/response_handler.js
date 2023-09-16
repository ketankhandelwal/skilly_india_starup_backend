function formatResponse(statusCode, message, data = null) {
    return {
      status_code: statusCode,
      message: message,
      data: data
    };
  }
  
  module.exports = formatResponse;
  