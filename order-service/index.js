const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Order = require("./Order");
const isAuthenticated = require("../isAuthenticated");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT_THREE || 5002;

let channel, connection;
mongoose.connect("mongodb://localhost:27017/order-service").then(() => {
  console.log(`Order service DB connected`);
});

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}

async function createOrder(products, userEmail) {
  let total = 0;
  for (let i = 0; i < products.length; i++) {
    total += products[i].price;
  }
  return await Order.create({ products, user: userEmail, total });
}

connect().then(() => {
  channel.consume("ORDER", async (data) => {
    const { products, userEmail } = JSON.parse(data.content);
    const newOrder = await createOrder(products, userEmail);
    channel.ack(data);
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
  });
});

app.listen(PORT, () => {
  console.log(`Order service at ${PORT}`);
});
