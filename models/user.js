const db = require('../db');

module.exports.getAll = async () => {
  return db.query('select * from users');
};

module.exports.udpateReposLastSyncDate = async (user_id) => {
  return db.query(
    'update users set repos_last_sync_date = NOW() WHERE id = ?',
    [user_id]
  );
};
