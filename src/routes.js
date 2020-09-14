const express = require("express");
const productsController = require("./app/controllers/productsController");

const routes = express.Router();

routes.get("/", productsController.index);

routes.get("/product/create", productsController.create);

module.exports = routes;
