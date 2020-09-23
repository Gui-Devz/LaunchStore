const db = require("../../config/db");

module.exports = {
  create(dataPut) {
    const query = `
      INSERT INTO products (
        category_id,
        user_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    dataPut.price = dataPut.price.replace(/\D/g, "");

    const values = [
      dataPut.category_id,
      dataPut.user_id || 4,
      dataPut.name,
      dataPut.description,
      dataPut.old_price || dataPut.price,
      dataPut.price,
      dataPut.quantity,
      dataPut.status || 1,
    ];

    return db.query(query, values);
  },

  find(id) {
    const query = `
      SELECT * FROM products WHERE id = $1
    `;

    return db.query(query, [id]);
  },

  update(dataPut) {
    const query = `
      UPDATE products SET
        category_id = $1,
        user_id = $2,
        name = $3,
        description = $4,
        old_price = $5,
        price = $6,
        quantity = $7,
        status = $8
      WHERE products.id = $9
      RETURNING id
    `;

    const values = [
      dataPut.category_id,
      dataPut.user_id || 4,
      dataPut.name,
      dataPut.description,
      dataPut.old_price || dataPut.price,
      dataPut.price,
      dataPut.quantity,
      dataPut.status || 1,
      dataPut.id,
    ];

    return db.query(query, values);
  },
};
