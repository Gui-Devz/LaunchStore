const { formatPricing } = require("../../lib/utils");
const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");
const fs = require("fs");

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

    if (req.files === 0) {
      res.send("Please send at least one image");
    }

    let results = await Product.create(urlEncoded);
    const productId = results.rows[0].id;

    //CALLING THE FUNCTION CREATE FROM MODAL FILE FOR EACH FILE
    //THIS RETURNS AN ARRAY OF PROMISES

    const imagesPromises = req.files.map((file) =>
      File.create(file.filename, file.path, productId)
    );

    await Promise.all(imagesPromises);

    console.log(req.files);

    return res.redirect(`/products/${productId}/edit`);
  },

  async edit(req, res) {
    //GET product
    let results = await Product.find(req.params.id);
    let product = results.rows[0];

    if (!product) return res.send("product not found!");

    //GET categories

    results = await Category.all();
    const categories = results.rows;

    product.old_price = formatPricing(product.old_price);
    product.price = formatPricing(product.price);

    //GET images

    results = await File.load(product.id);
    let photos = results.rows;
    photos = photos.map((file) => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("products/edit.njk", { product, categories, photos });
  },

  async put(req, res) {
    const urlEncoded = req.body;

    const keys = Object.keys(urlEncoded);

    for (const key of keys) {
      if (req.body[key] == "" && key != "removed_photos") {
        return res.send("Fill all the fields");
      }
    }

    //REFRESHING OLD PRICE VALUE

    urlEncoded.price = urlEncoded.price.replace(/\D/g, "");

    if (urlEncoded.old_price != urlEncoded.price) {
      const oldProduct = await Product.find(urlEncoded.id);

      urlEncoded.old_price = oldProduct.rows[0].price;
    }

    if (urlEncoded.removed_photos) {
      const files_id = urlEncoded.removed_photos.split(",");
      files_id.pop(); // removing the last index (',')

      //deleting from images folder

      const filesPromises = files_id.map((id) => {
        File.find(id);
      });

      await Promise.all(filesPromises).then((values) => {
        console.log(values);
        /* values.forEach((file) => {
          console.log(file);
          const path = `./public/image/${file.name}`;

          fs.unlinkSync(path);
        }); */
      });

      //Deleting from database
      const deletingFilesPromises = files_id.map((id) => {
        File.deleteOnlyOne(id);
      });

      await Promise.all(deletingFilesPromises);
    }

    //CALLING MODAL UPDATE FUNCTION

    const results = await Product.update(urlEncoded);

    const productID = results.rows[0].id;

    //CALLING THE FUNCTION CREATE FROM MODAL FILE FOR EACH FILE
    //THIS RETURNS AN ARRAY OF PROMISES

    const imagesPromises = req.files.map((file) =>
      File.create(file.filename, file.path, productID)
    );

    await Promise.all(imagesPromises);

    console.log(req.files);

    return res.redirect(`/products/${productID}/edit`);
  },

  async delete(req, res) {
    const { id } = req.body;
    const results = await File.load(product_id);
    const files = results.rows;

    let arrFiles = [];

    for (const file of files) {
      arrFiles.push(file.name);
    }

    arrFiles.forEach((fileName) => {
      const path = `./public/images/${fileName}`;

      fs.unlinkSync(path);
    });

    await Product.delete(id);
    await File.delete(id);

    return res.redirect("/products/create");
  },
};
