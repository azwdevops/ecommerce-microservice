const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    products: [{ product_id: String }],
    user: String,
    total_price: Number,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

module.exports = model("order", OrderSchema);
