const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT * FROM articles
      WHERE article_id = $1;
        `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Invalid id" });
      }
      return rows[0];
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.author, articles.title, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY created_at DESC;
    `
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchComments = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;
    `,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.addVotes = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *
      `,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.addComments = (article_id, username, body) => {
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *",
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.removeComment = (comment_id) => {
  return db.query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
    comment_id,
  ]);
};

exports.sendArticleTopics = (topic) => {
  return db
    .query(`SELECT * FROM articles WHERE topic = $1;`, [topic])
    .then(({ rows }) => {
      return rows;
    });
};
