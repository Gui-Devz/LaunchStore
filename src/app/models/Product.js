const db = require("../../config/db");

module.exports = {
  create(dataPost) {
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

    const values = [
      dataPost.category_id,
      4,
      dataPost.name,
      dataPost.description,
      dataPost.old_price,
      dataPost.price,
      dataPost.quantity,
      dataPost.status,
    ];

    return db.query(query, values);
  },
};
