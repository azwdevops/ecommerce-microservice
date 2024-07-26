const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { config } = require("dotenv");

const User = require("./User");

config();

mongoose.connect("mongodb://localhost:27017/auth-service").then(() => {
  console.log(`Auth service DB connected`);
});

const app = express();
const PORT = process.env_PORT_ONE || 5000;

app.use(express.json());

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  return res.json(newUser);
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid login" });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid login" });
  }
  const payload = {
    email,
    name: user.name,
  };
  jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: "Invalid login" });
    } else {
      return res.status(200).json({ token });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Auth service at ${PORT}`);
});
