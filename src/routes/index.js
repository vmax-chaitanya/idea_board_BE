const express = require("express");
const ideaRoutes = require("./ideaRoutes");

const router = express.Router();

router.use("/ideas", ideaRoutes);

module.exports = router;
