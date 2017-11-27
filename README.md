# Grocerx API


**Install**

```
npm install -g gulp
npm install
```

**Install MariaDB**

OSX
https://mariadb.com/kb/en/library/installing-mariadb-on-macos-using-homebrew/
```
brew install mariadb
mysql.server start
brew services start mariadb
mysql -u grocerx -p xxxxx
```

Ubuntu
```
sudo apt update -y
sudo apt install -y mariadb-server
mysql -V
sudo systemctl start mariadb.service
sudo systemctl enable mariadb.service

sudo /usr/bin/mysql_secure_installation
Enter current password for root (enter for none): <Enter>
Set root password? [Y/n]: Y
New password: <your-MariaDB-root-password>
Re-enter new password: <your-MariaDB-root-password>
Remove anonymous users? [Y/n]: Y
Disallow root login remotely? [Y/n]: Y
Remove test database and access to it? [Y/n]: Y
Reload privilege tables now? [Y/n]: Y

mysql -u root -p
```

**Add local environment variables**
```
touch .env
vi .env
```
`.env`
```
DB_HOSTNAME=localhost
DB_USERNAME=root
DB_PASSWORD=
```

**API calls**

**Login**

Request
```
POST
/v1/user/account/login
{
  "username":"norbs.knight@gmail.com",
  "password":"password"
}
```
Response
```
{
  "authorize": true,
  "roles": [
    "customer",
    "limited"
  ],
  "dateAuthenticated": 1511642959692,
  "dateAuthorized": 1511642959692,
  "authenticated": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5vcmJzLmtuaWdodEBnbWFpbC5jb20iLCJpYXQiOjE1MTE2NDI5NTl9.Q1wFGBrx0xcxo7huZ_ufHipI1vRyWegYxwTcUIPZXqsUegf-G79f53mg7QhHHRJnbwcK5OorS8nZ4TgFah_9G6Vg5iwPXb0x90ZJPY8XMwA916bW_NZ1-Ro-CD6FHhRwCr228HAYaLjsZvGn2K0nN9YGWx8S4_o74kwyyK3P81lT5OtXCCOJFMAw6f_VxsV6HWs_ZvccpbaYwgS0cYGwnMmKWkTcqPEwlzjk-n3MHFSRqdtPJrQ9Qe0jZ_ICWQbXRa7C-CB0jbZiRR_mQGrb-xLvmFrGNbuQv6MX9YnhEKWuSWmfm7WuCbpiZvNCicr9nfMaBHKm4uHSyqx7g_GPlg",
  "dateTime": 1511642959692,
  "id": "2",
  "username": "norbs.knight@gmail.com",
  "email": "norbs.knight@gmail.com",
  "dateBirth": 1511635231997,
  "dateCreated": "1511635231997",
  "dateUpdated": "1511635231997",
  "uiid": "",
  "message": "Found"
  }
```

**Account register**

Request
```
POST
/v1/user/account/save
{
  "username":"norbs.knight@gmail.com",
  "password":"password",
  "uiid": ""
},
```
Response
```
{
  "id": 5,
  "message": "Saved"
}
```
**Account update**

Request
```
POST
/v1/user/account/1/save
{
  "username":"norbs.knight@gmail.com",
  "password":"password",
  "uiid": "12312312"
},
```
Response
```
{
  "status": "Rows matched: 1 Changed: 1 Warnings: 0",
  "message": "Updated"
}
```

**View profile**

Request
```
GET
/v1/user/profile/1
```
Response
```
{
  "id": 1,
  "username": "norbs.kngiht@gmail.com",
  "email": "norbs.kngiht@gmail.com",
  "dateBirth": 1511635130349,
  "dateCreated": 1511635130349,
  "dateUpdated": 1511635130349,
  "uiid": "",
  "message": "Found"
}
```
