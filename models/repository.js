const axios = require('axios');
const db = require('../db');

module.exports.create = async ({ url, user_id }) => {
  return db.query('INSERT INTO repositories (url, user_id) VALUES (?, ?)', [
    url,
    user_id,
  ]);
};

module.exports.getUserRepos = async (github_username) => {
  const response = await axios.get(
    `https://api.github.com/users/${github_username}/repos`
  );
  return response.data;
};

module.exports.exists = async (url) => {
  const rows = await db.query('select * from repositories where url = ?', [
    url,
  ]);
  if (rows[0]) return true;
  return false;
};
