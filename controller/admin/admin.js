const formatResponse = require("../../response_handler/response_handler");
const pool = require("../../dbConfig/db");
const jwt = require("jsonwebtoken");

const adminValidator = require("../../validator/admin_validator");

exports.getRegisteredStudentsDetails = async (req, res) => {
  try {
    let { search, class_id, month } = req.query;

    try {
      // Validate input data against the schema
      await adminValidator.registeredStudents.validate({
        search,
        class_id,
        month,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    search = search || "";
    class_id = class_id || null;
    month = month || null;
    const client = await pool.connect();

    await client.query("BEGIN");

    const getActiveStudentListQuery = `SELECT
    s.*,
    (
        SELECT jsonb_agg(jsonb_build_object('skill_id', skill.id, 'skill_name', skill.name))
        FROM skills skill
        WHERE skill.id = ANY(s.skills_id)
    ) AS skills_choosen
FROM
    student_details s
WHERE

(s.class_id = ${class_id} OR ${class_id} IS NULL)
AND (LOWER(s.name) LIKE LOWER('%${search}%') OR '%${search}%' IS NULL)
  AND (s.month = ${month} OR ${month} IS NULL);     
`;

    const getActiveStudentListResult = await client.query(
      getActiveStudentListQuery
    );

    await client.query("COMMIT");

    if (
      getActiveStudentListResult.rows ||
      getActiveStudentListResult?.rowCount
    ) {
      const response = formatResponse(
        200,
        "Student Details Fetched Successfully",
        getActiveStudentListResult.rows
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

exports.getStudentsDetailsById = async (req, res) => {
  try {
    const { student_id } = req.query;

    try {
      // Validate input data against the schema
      await adminValidator.getStudentsDetailsById.validate({
        student_id,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    const client = await pool.connect();

    await client.query("BEGIN");

    const searchByIDQuery = `SELECT
    s.*,
    (
        SELECT jsonb_agg(jsonb_build_object('skill_id', skill.id, 'skill_name', skill.name))
        FROM skills skill
        WHERE skill.id = ANY(s.skills_id)
    ) AS skills_choosen
FROM
    student_details s WHERE id = ${student_id}`;
    const result = await client.query(searchByIDQuery);

    await client.query("COMMIT");

    if (result?.rowCount) {
      const response = formatResponse(
        200,
        "Student details fetched Successfully",
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

exports.editStudentDetails = async (req, res) => {
  try {
    const { student_id, skills_id, email } = req.body;

    try {
      // Validate input data against the schema
      await adminValidator.editStudentDetails.validate({
        student_id,
        skills_id,
        email,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    const client = await pool.connect();

    await client.query("BEGIN");

    const update_query = `UPDATE student_details SET  skills_id = $1, updated_at = $2 , email = $3 WHERE id = $4`;

    const update_result = await client.query(update_query, [
      skills_id,
      Date.now(),
      email,
      student_id,
    ]);

    await client.query("COMMIT");

    if (update_result?.rowCount) {
      const response = formatResponse(
        200,
        "Student details updated successfully",
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

exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      class_id,
      section,
      skills_id,
      roll_no,
      month,
      year,
      email,
      phone_no,
    } = req.body;

    try {
      // Validate input data against the schema
      await adminValidator.registerStudent.validate({
        name,
        class_id,
        section,
        skills_id,
        roll_no,
        month,
        year,
        email,
        phone_no,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }

    const client = await pool.connect();

    await client.query("BEGIN");

    const insert_query = `INSERT INTO student_details (name,
        class_id,
        section,
        skills_id,
        roll_no,
        month,
        year,
        email,
        created_at,
        phone_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

    const insert_result = await client.query(insert_query, [
      name,
      class_id,
      section,
      skills_id,
      roll_no,
      month,
      year,
      email,
      Date.now(),
      phone_no,
    ]);

    let amount = 0;
    const promises = [];

    skills_id.forEach((items) => {
      const search_price_query = `SELECT price FROM price_list WHERE class_id = ${class_id} AND skill_id = ${items}`;
      const promise = pool
        .query(search_price_query)
        .then((search_price_result) => {
          amount += search_price_result.rows[0].price;
        })
        .catch((error) => {
          const response = formatResponse(400, error, []);
          res.status(400).json(response);
        });

      promises.push(promise);
    });

    await Promise.all(promises)
      .then(() => {
        console.log("here");
        const insert_collection_query = `INSERT INTO amount_collection (student_id, 
         amount , month , year  , created_at ) VALUES ($1,$2,$3,$4,$5) `;
        const insert_collection_result = pool.query(insert_collection_query, [
          insert_result.rows[0].id,
          amount,
          month,
          year,
          Date.now(),
        ]);
      })
      .catch((error) => {
        const response = formatResponse(400, error, []);
        res.status(400).json(response);
      });

    await client.query("COMMIT");

    if (insert_result?.rowCount) {
      const response = formatResponse(
        200,
        "Student Registered Successfully",
        []
        // insert_result.rows
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

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    try {
      // Validate input data against the schema
      await adminValidator.userLogin.validate({
        email,
        password,
      });
    } catch (validationError) {
      const response = formatResponse(400, validationError.errors, []);
      return res.status(400).json(response);
    }
    const client = await pool.connect();

    await client.query("BEGIN");

    const search_query = `SELECT * FROM "user" WHERE LOWER(email) = LOWER('${email}') AND password = '${password}'`;

    const search_result = await client.query(search_query);

    if (!search_result?.rowCount) {
      const response = formatResponse(400, "Invalid Email or Password", []);
      res.status(400).json(response);
      return;
    }

    delete search_result.rows[0].password;

    const token = jwt.sign(search_result.rows[0], process.env.SECRET_KEY, {
      expiresIn: "30d",
    });

    await client.query("COMMIT");

    if (search_result?.rowCount) {
      const response = formatResponse(200, "Request Success", {
        userDetails: search_result.rows[0],
        token: token,
      });
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
