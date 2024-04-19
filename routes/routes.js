const express = require("express");
const router = express.Router();
const User = require('../model/users');
const multer = require('multer');
const users = require("../model/users");
const fs = require("fs");

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

// Edit an user route
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

// Update user route
router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!updatedUser) {
            res.json({ message: "User not found", type: "danger" });
            return;
        }

        req.session.message = {
            type: "success",
            message: "User updated successfully",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

module.exports = router;