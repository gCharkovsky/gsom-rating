class UserDatabase:
    def __init__(self):
        self.f = open('tmp/users', 'a')
        self.users = {k: v for [k, v] in map(lambda line: line.rstrip().split(), self.f.readlines())}

    def add(self, username, password_hash):
        print(username + ' ' + password_hash, file=self.f)
        self.users[username] = password_hash

    def get_all(self):
        return self.users

    def get(self, username):
        return self.users[username]


def get_db():
    return UserDatabase()