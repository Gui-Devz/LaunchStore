module.exports = {
  index(req, res) {
    return res.render("layout");
  },

  create(req, res) {
    return res.render("products/create");
  },
};
