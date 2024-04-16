const express = require("express");
const router = express.Router();
const User = require('../model/users');
const multer = require('multer');
const users = require("../model/users");

// Image Upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
})

var upload = multer({
    storage: storage,
}).single("image");

// Insert an user into database route
router.post('/add', upload, async (req, res) => {
    try{
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
// Get all users route
router.get("/", (req, res) => {
   User.find().exec()
   .then(users => {
    res.render('index', {
        title: 'Home Page',
        users: users,
    });
   })
   .catch(err => {
        res.json({message: err.message});
   });
});

// edit an user route
router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .then(user => {
            if (!user) {
                return res.redirect("/");
            }
            res.render("edit_users", {
                title: "Edit User",
                user: user,
            });
        })
        .catch(err => {
            console.error(err);
            res.redirect("/");
        });
});


router.get('/add', (req, res) => {
    res.render('add_users', { title: "Add Users" });
});

module.exports = router;