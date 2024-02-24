const express = require("express");
const prisma = require("../prisma");
const { loginRequired } = require("../middleware");

const router = express.Router();

router.get("/protected", loginRequired, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;
