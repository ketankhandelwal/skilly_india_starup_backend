const formatResponse = require("../../response_handler/response_handler");
const pool = require("../../dbConfig/db");
const jwt = require("jsonwebtoken");

exports.collectionDetails = async (req, res) => {
  try {
    const { year, month, skill_id } = req.query;

    try {
      // Validate input data against the schema
      await su.getFarmerDetailsById.validate({
        farmer_id,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    const client = await pool.connect();

    await client.query("BEGIN");

    await client.query("COMMIT");

    if (result?.rowCount) {
      const response = formatResponse(
        200,
        "Farmer Registered Successfully",
        []
      );
      res.status(200).json(response);
    } else {
      await client.query("ROLLBACK");
      const response = formatResponse(400, "Something went wrong", []);
      res.status(400).json(response);
    }
  } catch (error) {
    const response = formatResponse(400, error, []);
    res.status(400).json(response);
  }
};
