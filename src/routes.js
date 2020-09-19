const express = require("express");
const productsController = require("./app/controllers/productsController");

const routes = express.Router();

routes.get("/", productsController.index);

routes.get("/products/create", productsController.create);
routes.get("/products/:id/edit", productsController.edit);
routes.post("/products", productsController.post);

// Alias
routes.get("/ads/create", (req, res) => {
  return res.send("olá");
});

module.exports = routes;
