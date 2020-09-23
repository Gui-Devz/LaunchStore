const { formatPricing } = require("../../lib/utils");
const { put } = require("../../routes");
const Category = require("../models/Category");
const Product = require("../models/Product");

module.exports = {
  index(req, res) {
    return res.render("layout");
  },

  create(req, res) {
    //pegar categorias
    Category.all()
      .then(function (results) {
        const categories = results.rows;

        return res.render("products/create", { categories });
      })
      .catch(function (err) {
        throw new Error(err);
      });
  },

  async post(req, res) {
    // Lógica para savar produto
    const urlEncoded = req.body;

    const keys = Object.keys(urlEncoded);

    for (const key of keys) {
      if (req.body[key] == "") {
        return res.send("Fill all the fields");
      }
    }

    let results = await Product.create(urlEncoded);
    const productId = results.rows[0].id;

    results = await Category.all();
    const categories = results.rows;

    return res.redirect(`/products/${productId}`);
  },

  async edit(req, res) {
    let results = await Product.find(req.params.id);

    let product = results.rows[0];

    if (!product) return res.send("product not found!");

    results = await Category.all();
    const categories = results.rows;

    product.old_price = formatPricing(product.old_price);
    product.price = formatPricing(product.price);
    console.log(product);

    return res.render("products/edit.njk", { product, categories });
  },

  async put(req, res) {
    const urlEncoded = req.body;

    const keys = Object.keys(urlEncoded);

    for (const key of keys) {
      if (req.body[key] == "") {
        return res.send("Fill all the fields");
      }
    }

    urlEncoded.price = urlEncoded.price.replace(/\D/g, "");

    if (urlEncoded.old_price != urlEncoded.price) {
      const oldProduct = await Product.find(urlEncoded.id);

      urlEncoded.old_price = oldProduct.rows[0].price;
    }

    const results = await Product.update(urlEncoded);

    const productID = results.rows[0].id;

    return res.redirect(`/products/${productID}/edit`);
  },
};
