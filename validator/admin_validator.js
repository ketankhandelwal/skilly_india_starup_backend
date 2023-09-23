const Yup = require("yup");

const registeredStudents = Yup.object().shape({
  search: Yup.string().optional(),
  class_id: Yup.number().optional(),
  month: Yup.number().optional(),
  year: Yup.number().optional()
});

const getStudentsDetailsById = Yup.object().shape({
  student_id: Yup.number().required(),
});

const editStudentDetails = Yup.object().shape({
  skills_id: Yup.array().required(),

  student_id: Yup.number().required(),
  email: Yup.string().email().optional(),
});

const registerStudent = Yup.object().shape({
  name: Yup.string().required(),
  class_id: Yup.number().required(),
  section: Yup.number().required(),
  skills_id: Yup.array().required(),
  roll_no: Yup.number().required(),
  month: Yup.number().required(),
  email: Yup.string().email().optional(),
  year: Yup.number().required(),
  phone_no: Yup.string().required(),
});

const userLogin = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

const getSkillPriceByClassId = Yup.object().shape({
  class_id: Yup.number().required()
})
module.exports = {
  registeredStudents,
  getStudentsDetailsById,
  editStudentDetails,
  registerStudent,
  userLogin,
  getSkillPriceByClassId
};
