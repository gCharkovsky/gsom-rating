class UserDatabase:
    def __init__(self):
        with open('tmp/users', 'r') as f:
            self.users = {k: v for [k, v] in map(lambda line: line.rstrip().split(), f.readlines())}

    def add(self, username, password_hash):
        with open('tmp/users', 'a') as f:
            print(username + ' ' + password_hash, file=f)
        self.users[username] = password_hash

    def get_all(self):
        return self.users

    def get(self, username):
        return self.users.get(username)


def get_db():
    return UserDatabase()