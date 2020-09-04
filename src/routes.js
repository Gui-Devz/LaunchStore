const express = require("express");
const productsController = require("./app/controllers/productsController");

const routes = express.Router();

routes.get("/", productsController.index);

module.exports = routes;
