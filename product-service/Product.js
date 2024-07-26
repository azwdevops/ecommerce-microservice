const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
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

module.exports = model("product", ProductSchema);
