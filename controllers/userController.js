const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const loadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message);
    }
};

const createUser = async (req, res) => {
    try {
        const { email, mno, password } = req.body;

        // Check if a user with the same email or mobile already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile:mno }] });

        if (existingUser) {
            return res.render('registration', { message: 'User with this email or mobile already exists' });
        }

        // Hash the password
        const spassword = await securePassword(password);

        // Create a new user if no duplicates are found
        const user = new User({
            name: req.body.name,
            email: email,
            mobile: mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0
        });

        const userData = await user.save();
        if (userData) {
            return res.render('registration', { message: 'Your registration has been successfully completed.' });
        } else {
            return res.render('registration', { message: 'Your registration has failed.' });
        }
    } catch (error) {
        console.log(error.message);
    }
};

// Login user
const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                // Check if the user is an admin
                if (userData.is_admin === 1) {
                    // Admin trying to login from user page, redirect to admin login page
                    return res.render('login', { message: 'Invalid credentials for user login.' });
                } else {
                    // Normal user login
                    req.session.user_id = userData._id;
                    return res.redirect('/home'); // User home page
                }
            } else {
                return res.render('login', { message: 'Email or password incorrect.' });
            }
        } else {
            return res.render('login', { message: 'Email or password incorrect.' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal Server Error');
    }
};


const userLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/login');
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal Server Error');
    }
};

const loadHome = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/login'); // Redirect to login page if not authenticated
        }

        const userData = await User.findById(req.session.user_id);
        if (!userData) {
            // If user data not found, destroy the session and redirect to login
            return req.session.destroy((err) => {
                if (err) console.log(err.message);
                res.redirect('/login');
            });
        }
        res.render('home', { user: userData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const isUser = async (req, res, next) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const user = await User.findById(userId);
        if (user && user.is_admin === 0) {
            next(); // Proceed if the user is a regular user
        } else {
            return res.redirect('/admin/home'); // Redirect to admin home if user is an admin
        }
    } catch (error) {
        console.error('User authentication error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            return res.render("edit-info", { user: userData });
        } else {
            return res.redirect("/home");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const userData = await User.findByIdAndUpdate(
            { _id: req.body.user_id },
            { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } }
        );
        return res.redirect("/home");
    } catch (error) {
        console.log(error.message);
    }
};
module.exports = {
    loadRegister,
    createUser, // Updated function name
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editUserLoad,
    updateUser,
    isUser
};
