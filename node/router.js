const express = require('express');
const router = express.Router();
const logicController = require("./controllers/logic.js");


router.post("/get-:value",  logicController.getOptions);
router.post("/getNumber", logicController.getNumber);
router.post("/quotegen",  logicController.quoteGen);
router.get("/", logicController.main);
router.get("/login", logicController.loginPage);
router.post("/loginData", logicController.loginData);
router.get("/admin", logicController.admin);
router.get("/admin/login", logicController.adminLogin);
router.post("/admin/login-data", logicController.adminLoginData);

module.exports = router;
