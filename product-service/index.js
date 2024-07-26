const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../isAuthenticated");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT_TWO || 5001;

let channel, connection;
mongoose.connect("mongodb://localhost:27017/product-service").then(() => {
  console.log(`Product service DB connected`);
});

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}

connect();

app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = await Product.create({ name, description, price });
  return res.json(newProduct);
});

app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  let order;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue("ORDER", Buffer.from(JSON.stringify({ products, userEmail: req.user.email })));
  channel.consume("PRODUCT", (data) => {
    console.log("consuming product queue");
    order = JSON.parse(data.content);
    channel.ack(data);
  });
  return res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`Product service at ${PORT}`);
});
