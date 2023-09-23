var express = require("express");
var router = express.Router();
const authetication = require("../public/middleware/auth");

const adminLogic = require("../controller/admin/admin");

/* GET users listing. */
router.get(
  "/getStudentsList",
  authetication.authenticateToken,
  adminLogic.getRegisteredStudentsDetails
);
router.get(
  "/getStudentDetailsById",
  authetication.authenticateToken,
  adminLogic.getStudentsDetailsById
);
router.patch(
  "/updateStudentDetailsById",
  authetication.authenticateToken,
  adminLogic.editStudentDetails
);
router.post(
  "/registerStudent",
  authetication.authenticateToken,
  adminLogic.registerStudent
);
router.post("/userLogin", adminLogic.userLogin);

router.get(
  "/getSkillPriceByClass",
  authetication.authenticateToken,
  adminLogic.getSkillPriceByClassId
);

module.exports = router;
