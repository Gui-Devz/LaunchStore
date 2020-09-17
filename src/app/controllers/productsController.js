const Category = require("../models/Category");

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

  post(req, res) {},
};
