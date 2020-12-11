const { formatPricing, formatBrowser } = require("../../lib/utils");
const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");
const fs = require("fs");

module.exports = {
  index(req, res) {
    return res.render("layout");
  },

  async show(req, res) {
    const { id } = req.params;

    let results = await Product.find(id);
    const product = results.rows[0];

    const { day, month, hours, minutes } = formatBrowser(product.updated_at);

    product.published = {
      day,
      month,
      hours,
      minutes,
    };

    product.price = formatPricing(product.price).replace(".", ",");
    product.old_price = formatPricing(product.old_price).replace(".", ",");

    if (!product) {
      return res.send("Product not found!");
    }

    //NOW WE'LL BE LOADING THE FILES IMG AND SENDING THEM TO THE FRONT.

    results = await File.load(id);
    const files = results.rows;
    const firstFile = files[files.length - 1];

    console.log(files);

    return res.render("products/show", { product, files, firstFile });
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

    //CALLING THE FUNCTION CREATE FROM FILE'S MODAL FOR EACH FILE
    //THIS RETURNS AN ARRAY OF PROMISES

    const imagesPromises = req.files.map((file) =>
      File.create(file.filename, file.path, productId)
    );

    await Promise.all(imagesPromises);

    return res.redirect(`/products/${productId}`);
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
      console.log(files_id);

      files_id.forEach(async (id) => {
        const result = await File.find(id);

        const file = result.rows[0];
        console.log(file);

        //Deleting from Root
        fs.unlinkSync(file.path);

        //Deleting from database
        await File.deleteOnlyOne(id);
      });
    }

    const results = await Product.update(urlEncoded);

    const productID = results.rows[0].id;

    //CALLING THE FUNCTION CREATE FROM MODAL FILE FOR EACH FILE
    //THIS RETURNS AN ARRAY OF PROMISES

    if (req.files != 0) {
      const imagesPromises = req.files.map((file) =>
        File.create(file.filename, file.path, productID)
      );

      await Promise.all(imagesPromises);

      /* console.log(req.files); */
    }

    return res.redirect(`/products/${productID}`);
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
