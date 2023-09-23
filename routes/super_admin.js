var express = require("express");
var router = express.Router();
const authetication = require("../public/middleware/auth");

const superAdminLogic = require("../controller/super_admin/super_admin");

router.get("/getCollectionData",authetication.authenticateToken,superAdminLogic.collectionDetails);

module.exports = router