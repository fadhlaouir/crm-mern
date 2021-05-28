const router = require("express").Router();
var item = require("../model/item");
const upload = require('../middlewares/multer');

/* Api to add item */
router.post("/add-item", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.name &&
            req.body.desc &&
            req.body.price &&
            req.body.quantity &&
            req.body.quote
        ) {
            let new_item = new item();
            new_item.name = req.body.name;
            new_item.desc = req.body.desc;
            new_item.price = req.body.price;
            new_item.image = req.files[0].filename;
            new_item.quantity = req.body.quantity;
            new_item.quote = req.body.quote;
            new_item.user_id = req.user.id;
            new_item.save((err, data) => {
                if (err) {
                    res.status(400).json({
                        errorMessage: err,
                        status: false,
                    });
                } else {
                    res.status(200).json({
                        status: true,
                        title: "item Added successfully.",
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

/* Api to update item */
router.post("/update-item", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.name &&
            req.body.desc &&
            req.body.price &&
            req.body.id &&
            req.body.quantity &&
            req.body.quote
        ) {
            item.findById(req.body.id, (err, new_item) => {
                // if file already exist than remove it
                if (
                    req.files &&
                    req.files[0] &&
                    req.files[0].filename &&
                    new_item.image
                ) {
                    var path = `./uploads/${new_item.image}`;
                    fs.unlinkSync(path);
                }

                if (req.files && req.files[0] && req.files[0].filename) {
                    new_item.image = req.files[0].filename;
                }
                if (req.body.name) {
                    new_item.name = req.body.name;
                }
                if (req.body.desc) {
                    new_item.desc = req.body.desc;
                }
                if (req.body.price) {
                    new_item.price = req.body.price;
                }
                if (req.body.quantity) {
                    new_item.quantity = req.body.quantity;
                }
                if (req.body.quote) {
                    new_item.quote = req.body.quote;
                }


                new_item.save((err, data) => {
                    if (err) {
                        res.status(400).json({
                            errorMessage: err,
                            status: false,
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            title: "item updated.",
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

/* Api to delete item */
router.post("/delete-item", (req, res) => {
    try {
        if (req.body && req.body.id) {
            item.findByIdAndUpdate(
                req.body.id, {
                    is_delete: true
                }, {
                    new: true
                },
                (err, data) => {
                    if (data.is_delete) {
                        res.status(200).json({
                            status: true,
                            title: "item deleted.",
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

/*Api to get and search item with pagination and search by name*/
router.get("/get-item", (req, res) => {
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
        item
            .find(query, {
                date: 1,
                name: 1,
                id: 1,
                desc: 1,
                price: 1,
                quantity: 1,
                quote: 1,
                image: 1,
            })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .then((data) => {
                item
                    .find(query)
                    .count()
                    .then((count) => {
                        if (data && data.length > 0) {
                            res.status(200).json({
                                status: true,
                                title: "item retrived.",
                                items: data,
                                current_page: page,
                                total: count,
                                pages: Math.ceil(count / perPage),
                            });
                        } else {
                            res.status(400).json({
                                errorMessage: "There is no item!",
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