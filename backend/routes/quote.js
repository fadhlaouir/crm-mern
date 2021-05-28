const router = require("express").Router();
var quote = require("../model/quote");
const upload = require('../middlewares/multer');


/* Api to add quote */
router.post("/add-quote", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.client &&
            req.body.total &&
            req.body.Reduction &&
            req.body.Status
        ) {
            let new_quote = new quote();
            new_quote.client = req.body.client;
            new_quote.total = req.body.total;
            new_quote.Reduction = req.body.Reduction;

            new_quote.Status = req.body.Status;
            new_quote.user_id = req.user.id;
            new_quote.save((err, data) => {
                if (err) {
                    res.status(400).json({
                        errorMessage: err,
                        status: false,
                    });
                } else {
                    res.status(200).json({
                        status: true,
                        title: "quote Added successfully.",
                    });
                }
            });
        } else {
            res.status(400).json({
                errorMessage: "Add proper parameter first!",
                status: false,
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});

/* Api to update quote */
router.post("/update-quote", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.client &&
            req.body.total &&
            req.body.Reduction &&
            req.body.Status
        ) {
            quote.findById(req.body.id, (err, new_quote) => {
                if (req.body.client) {
                    new_quote.client = req.body.client;
                }
                if (req.body.total) {
                    new_quote.total = req.body.total;
                }
                if (req.body.Reduction) {
                    new_quote.Reduction = req.body.Reduction;
                }
                if (req.body.Status) {
                    new_quote.Status = req.body.Status;
                }


                new_quote.save((err, data) => {
                    if (err) {
                        res.status(400).json({
                            errorMessage: err,
                            status: false,
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            title: "Quote updated.",
                        });
                    }
                });
            });
        } else {
            res.status(400).json({
                errorMessage: "Add proper parameter first!",
                status: false,
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});

/* Api to delete quote */
router.post("/delete-quote", (req, res) => {
    try {
        if (req.body && req.body.id) {
            quote.findByIdAndUpdate(
                req.body.id, {
                    is_delete: true
                }, {
                    new: true
                },
                (err, data) => {
                    if (data.is_delete) {
                        res.status(200).json({
                            status: true,
                            title: "Quote deleted.",
                        });
                    } else {
                        res.status(400).json({
                            errorMessage: err,
                            status: false,
                        });
                    }
                }
            );
        } else {
            res.status(400).json({
                errorMessage: "Add proper parameter first!",
                status: false,
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});

/*Api to get and search quote with pagination and search by name*/
router.get("/get-quote", (req, res) => {
    try {
        var query = {};
        query["$and"] = [];
        query["$and"].push({
            is_delete: false,
            user_id: req.user.id,
        });
        if (req.query && req.query.search) {
            query["$and"].push({
                name: {
                    $regex: req.query.search
                },
            });
        }
        var perPage = 5;
        var page = req.query.page || 1;
        quote
            .find(query, {
                id: 1,
                date: 1,
                client: 1,
                total: 1,
                Reduction: 1,
                Status: 1,
            })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .then((data) => {
                contact
                    .find(query)
                    .count()
                    .then((count) => {
                        if (data && data.length > 0) {
                            res.status(200).json({
                                status: true,
                                title: "contact retrived.",
                                quotes: data,
                                current_page: page,
                                total: count,
                                pages: Math.ceil(count / perPage),
                            });
                        } else {
                            res.status(400).json({
                                errorMessage: "There is no quotes!",
                                status: false,
                            });
                        }
                    });
            })
            .catch((err) => {
                res.status(400).json({
                    errorMessage: err.message || err,
                    status: false,
                });
            });
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});


module.exports = router;