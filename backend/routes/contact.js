const router = require("express").Router();
var contact = require("../model/contact");
const upload = require('../middlewares/multer');

/* Api to add contact */
router.post("/add-contact", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.firstName &&
            req.body.lastName &&
            req.body.email &&
            req.body.phone &&
            req.body.company
        ) {
            let new_contact = new contact();
            new_contact.firstName = req.body.firstName;
            new_contact.lastName = req.body.lastName;
            new_contact.email = req.body.email;

            new_contact.phone = req.body.phone;
            new_contact.company = req.body.company;
            new_contact.user_id = req.user.id;
            new_contact.save((err, data) => {
                if (err) {
                    res.status(400).json({
                        errorMessage: err,
                        status: false,
                    });
                } else {
                    res.status(200).json({
                        status: true,
                        title: "contact Added successfully.",
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

/* Api to update contact */
router.post("/update-contact", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.firstName &&
            req.body.lastName &&
            req.body.email &&
            req.body.phone &&
            req.body.company
        ) {
            contact.findById(req.body.id, (err, new_contact) => {
                if (req.body.firstName) {
                    new_contact.firstName = req.body.firstName;
                }
                if (req.body.lastName) {
                    new_contact.lastName = req.body.lastName;
                }
                if (req.body.email) {
                    new_contact.email = req.body.email;
                }
                if (req.body.phone) {
                    new_contact.phone = req.body.phone;
                }
                if (req.body.company) {
                    new_contact.company = req.body.company;
                }

                new_contact.save((err, data) => {
                    if (err) {
                        res.status(400).json({
                            errorMessage: err,
                            status: false,
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            title: "contact updated.",
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

/* Api to delete contact */
router.post("/delete-contact", (req, res) => {
    try {
        if (req.body && req.body.id) {
            contact.findByIdAndUpdate(
                req.body.id, {
                    is_delete: true
                }, {
                    new: true
                },
                (err, data) => {
                    if (data.is_delete) {
                        res.status(200).json({
                            status: true,
                            title: "contact deleted.",
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

/*Api to get and search contact with pagination and search by name*/
router.get("/get-contact", (req, res) => {
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
        contact
            .find(query, {
                id: 1,
                date: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                company: 1,
                image: 1,
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
                                contacts: data,
                                current_page: page,
                                total: count,
                                pages: Math.ceil(count / perPage),
                            });
                        } else {
                            res.status(400).json({
                                errorMessage: "There is no contact!",
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