const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  console.log("GET /users");
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post("/create", async (req, res) => {
  console.log(req);
  const { name, email, age } = req.body;
  await prisma.user
    .create({
      data: { ...req.body },
    })
    .then((user) => {
      res.json(user);
    });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("ID: ", id);
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.delete({
    where: { id: parseInt(id) },
  });
  res.json(user);
});

module.exports = router;
