const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

// ************* //
// Get all users //
// ************* //
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
  console.log("hello");
});

// ***************** //
// Create a new user //
// ***************** //
router.post("/create", async (req, res) => {
  const { name, email, age, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      age,
      password: hashedPassword,
    },
  });

  delete user.password;
  res.json(user);
});

// *********************** //
// Get a single user by ID //
// *********************** //
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  delete user.password;
  res.json(user);
});

// ******************* //
// Delete a user by ID //
// ******************* //
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.delete({
    where: { id: parseInt(id) },
  });

  res.json(user);
});

// ************ //
// Login a user //
// ************ //
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ userId: user.id }, "super_secret_access_key", {
    expiresIn: "1m",
  });
  const refreshToken = jwt.sign(
    { userId: user.id },
    "super_secret_refresh_key",
    {
      expiresIn: "1m",
    }
  );

  res.json({ accessToken, refreshToken });
});

// ******************* //
// Refresh User Tokens //
// ******************* //
router.post("/refresh", async (req, res) => {
  const refreshToken = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(refreshToken, "super_secret_refresh_key");
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const newAccessToken = jwt.sign(
    { userId: user.id },
    "super_secret_access_key",
    {
      expiresIn: "1m",
    }
  );
  const newRefreshToken = jwt.sign(
    { userId: user.id },
    "super_secret_refresh_key",
    {
      expiresIn: "1m",
    }
  );

  res.json({ newAccessToken, newRefreshToken });
});

module.exports = router;
