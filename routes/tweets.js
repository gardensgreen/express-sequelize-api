const express = require("express");
const { check, validationResult } = require("express-validator");

const db = require("../db/models");

const { Tweet } = db;
const router = express.Router();

const asyncHandler = (handler) => (req, res, next) =>
    handler(req, res, next).catch(next);

const tweetNotFoundError = (tweetId) => {
    let error = new Error(`${tweetId} could not be found`);
    error.title = "Tweet not found";
    error.status = 404;
    return error;
};

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((e) => e.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad Request.";
        return next(err);
    }

    next();
};

const tweetValidators = [
    check("message")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a value for message.")
        .isLength({ max: 280 })
        .withMessage("Message cannot be over 280 characters."),
];

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const tweets = await Tweet.findAll();
        res.json({ tweets });
    })
);

router.post(
    "/",
    tweetValidators,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const tweet = await Tweet.create({
            message: req.body.message,
        });

        res.json({ tweet });
    })
);

router.get(
    "/:id(\\d+)",
    asyncHandler(async (req, res, next) => {
        const tweetId = parseInt(req.params.id, 10);
        const tweet = await Tweet.findByPk(tweetId);

        if (tweet) {
            res.json({ tweet });
        } else {
            next(tweetNotFoundError(tweetId));
        }
    })
);

router.put('/:id(\\d+)', tweetValidators, handleValidationErrors, asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);

    if(tweet) {
        await tweet.update({ message: req.body.message });
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

router.delete('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        await tweet.destroy();
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}));

module.exports = router;
