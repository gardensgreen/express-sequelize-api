const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");

const db = require("../db/models");
const { User } = db;
const { asyncHandler, handleValidationErrors } = require("../utils");
const { getUserToken } = require("../auth");

const router = express.Router();

const validateUsername = check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username");

const validateEmailAndPassword = [
    check("email")
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email."),
    check("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password."),
];

router.post(
    "/",
    validateUsername,
    validateEmailAndPassword,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        //TODO: Create User in database
        const user = await User.create({
            username,
            email,
            hashedPassword,
        });

        const token = getUserToken(user);
        res.status(201).json({
            user: { id: user.id },
            token,
        });
    })
);

module.exports = router;
