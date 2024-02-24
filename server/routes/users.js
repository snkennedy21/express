const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("GET /users");
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post("/create", async (req, res) => {
  console.log(req);
  const { name, email, age, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user
    .create({
      data: {
        name,
        email,
        age,
        password: hashedPassword,
      },
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

router.post("/login", async (req, res) => {
  console.log("HELLO");
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.json({ message: "Invalid credentials" });
  }

  res.json({ message: "Logged in" });
});

module.exports = router;
