const Category = require("../models/Category");
const Product = require("../models/Product");

module.exports = {
  index(req, res) {
    return res.render("layout");
  },

  async create(req, res) {
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
    console.log(productId);

    results = await Category.all();
    const categories = results.rows;

    return res.render("products/create.njk", { productId, categories });
  },
};
