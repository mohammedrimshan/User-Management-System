const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const nocache = require('nocache');

const user_route = express();

// Apply nocache middleware to prevent caching
user_route.use(nocache());

user_route.use(express.static('public'));
user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

// Routes
user_route.get('/register', auth.islogout, userController.loadRegister);
user_route.post('/register', upload.single('image'), userController.createUser);
user_route.get('/', auth.islogout, userController.loginLoad);
user_route.get('/login', auth.islogout, userController.loginLoad);
user_route.post('/login', userController.verifyLogin);
user_route.get('/home', auth.islogin, userController.isUser, userController.loadHome);
user_route.get('/logout', auth.islogin, userController.userLogout);
user_route.get('/edit', auth.islogin, userController.editUserLoad);
user_route.post('/edit', upload.single('image'), userController.updateUser);

module.exports = user_route;
