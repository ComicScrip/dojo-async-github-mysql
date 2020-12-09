const db = require('../db');
const User = require('../models/user');
const Repository = require('../models/repository');

async function saveUserRepoInDB(repo, user_id) {
  const repoIsAlreadyImported = await Repository.exists(repo.html_url);
  if (!repoIsAlreadyImported) {
    await Repository.create({ url: repo.html_url, user_id });
    console.log(`repo ${repo.name} saved in the database`);
  } else {
    console.log(`repo ${repo.name} was already saved in the database`);
  }
}

async function fetchAndThenSaveUserRepos({ id, github_username }) {
  try {
    console.log(`retrieving repos of ${github_username} from GitHub API`);
    const userRepos = await Repository.getUserRepos(github_username);
    // when we reach that line, userRepos is an array of repository objects
    console.log(`received repos of ${github_username}`);
    // saving all of the repos concurrently into the DB...
    await Promise.all(userRepos.map((repo) => saveUserRepoInDB(repo, id)));
    console.log(`all ${github_username} repos are imported`);
    await User.udpateReposLastSyncDate(id);
  } catch (err) {
    console.error(`repos import failed for ${github_username}`, err);
  }
}

(async function runImports() {
  // we get all users from DB :
  const users = await User.getAll();
  // when we reach that line, users is an array of user objects
  // we map those user obejcts into Promises :
  const usersReposSaved = users.map((user) => fetchAndThenSaveUserRepos(user));
  // notice that we import the repos of the users concurrently, not one user after the other
  // userReposSaved is an array of Promises (one import Promise per user)
  // we need to explicitly wait for all repos of all users to be imported into our DB :
  await Promise.all(usersReposSaved);
  console.log('done !');
  await db.closeConnection();
  console.log('connection to DB closed');
})();
