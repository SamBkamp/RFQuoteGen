const express = require('express');
const router = express.Router();
const logicController = require("./controllers/logic.js");


router.get("/", logicController.test);
router.post("/get-:value",  logicController.getOptions);
router.post("/getNumber", logicController.getNumber);
router.post("/quotegen",  logicController.quoteGen);

module.exports = router;
