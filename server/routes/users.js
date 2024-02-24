const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

// Middleware function to verify JWT token
const loginRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader: ", authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "super_secret_access_key", (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden if token is invalid
      }
      req.user = user; // Attach the decoded user object to the request
      next(); // Call the next middleware
    });
  } else {
    res.sendStatus(401); // Unauthorized if no token provided
  }
};

// ************* //
// Get all users //
// ************* //
router.get("/", async (req, res) => {
  console.log("GET /users");
  const users = await prisma.user.findMany();
  res.json(users);
});

// ***************** //
// Create a new user //
// ***************** //
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

// *********************** //
// Get a single user by ID //
// *********************** //
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   console.log("ID: ", id);
//   const user = await prisma.user.findUnique({
//     where: { id: parseInt(id) },
//   });
//   res.json(user);
// });

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
  console.log("HELLO");
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
  console.log("req.headers.authorization: ", req.headers.authorization);
  const refreshToken = req.headers.authorization.split(" ")[1];

  console.log("REFRESH TOKEN: ", refreshToken);

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

router.get("/protected", loginRequired, (req, res) => {
  // Access the decoded user object from the request
  console.log("User:", req.user);
  res.json({ message: "This is a protected API endpoint" });
});

module.exports = router;
