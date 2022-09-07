const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
};

module.exports = { getUserByEmail }
