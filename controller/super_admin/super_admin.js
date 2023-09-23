const formatResponse = require("../../response_handler/response_handler");
const pool = require("../../dbConfig/db");
const jwt = require("jsonwebtoken");

const superAdminValidator = require("../../validator/super_admin_validator");

exports.collectionDetails = async (req, res) => {
  try {
    const { year, month, skillGraph, classGraph } = req.query;

    try {
      // Validate input data against the schema
      await superAdminValidator.collectionDetails.validate({
        year,
        month,
        skillGraph,
        classGraph,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    const client = await pool.connect();

    await client.query("BEGIN");

    let result;

    if (year && month && skillGraph && month !== 1) {
      const skill_wise_query = `
      SELECT
      s.skill_id,
      sk.name AS skill_name,
      SUM(s.price) AS total_amount
        FROM
            student_details sd
        JOIN
            amount_collection ac ON sd.id = ac.student_id
        JOIN
            price_list s ON s.skill_id = ANY(sd.skills_id)
            AND s.class_id = sd.class_id
        JOIN
            skills sk ON s.skill_id = sk.id
        WHERE
            ac.year = ${year}
            AND ac.month = ${month}
        GROUP BY
            s.skill_id, sk.name;
  
  `;
      result = await client.query(skill_wise_query);
    } else if (year && month && classGraph && month !== 1) {
      const class_wise_query = `SELECT sd.class_id,
    SUM(ac.amount) AS total_amount
    FROM student_details sd
    INNER JOIN amount_collection ac
    ON sd.id = ac.student_id
    WHERE ac.year = ${year}
    AND ac.month = ${month}
    GROUP BY sd.class_id;`;
      result = await client.query(class_wise_query);
    } else if (year && month && month !== 1) {
      const month_wise_query = `SELECT month ,
      SUM(amount) AS total
      FROM amount_collection
      WHERE year = ${year}
      GROUP BY month
      ORDER BY month;`;
      result = await client.query(month_wise_query);
    } else if (year && month == 1) {
      const all_month_wise = `SELECT
      month,
     SUM(amount) AS total_amount
 FROM
     amount_collection
 WHERE
     year = ${year} 
     
     month
 ORDER BY
     month;`;

      result = await client.query(all_month_wise);
    } else {
      const year_wise_query = `SELECT year AS year,
    SUM(amount) AS total
    FROM amount_collection
    GROUP BY year
    ORDER BY year;
    `;

      result = await client.query(year_wise_query);
    }

    await client.query("COMMIT");

    if (result?.rowCount) {
      const response = formatResponse(
        200,
        "Amount fetched successfully",
        result.rows
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
