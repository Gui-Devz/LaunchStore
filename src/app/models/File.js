const db = require("../../config/db");

module.exports = {
  create(name, path, product_id) {
    const query = `
      INSERT INTO files (
        name,
        path,
        product_id
      ) VALUES ($1,$2,$3)
      RETURNING id
    `;

    const values = [name, path, product_id];

    return db.query(query, values);
  },
  load(product_id) {
    const query = `
      SELECT*FROM files WHERE product_id = $1
    `;

    return db.query(query, [product_id]);
  },
};
