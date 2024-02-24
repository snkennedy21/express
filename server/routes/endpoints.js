const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("GET /endpoints");
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;