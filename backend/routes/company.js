const router = require("express").Router();
var company = require("../model/company");

const upload = require('../middlewares/multer');


/* Api to add company */
router.post("/add-company", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.name &&
            req.body.address &&
            req.body.zipCode &&
            req.body.country
        ) {
            let new_company = new company();
            new_company.name = req.body.name;
            new_company.address = req.body.address;
            new_company.zipCode = req.body.zipCode;

            new_company.country = req.body.country;
            new_company.user_id = req.user.id;
            new_company.save((err, data) => {
                if (err) {
                    res.status(400).json({
                        errorMessage: err,
                        status: false,
                    });
                } else {
                    res.status(200).json({
                        status: true,
                        title: "company Added successfully.",
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

/* Api to update company */
router.post("/update-company", upload.any(), (req, res) => {
    try {
        if (
            req.body &&
            req.body.id &&
            req.body.name &&
            req.body.address &&
            req.body.zipCode &&
            req.body.country
        ) {
            company.findById(req.body.id, (err, new_company) => {
                if (req.body.name) {
                    new_company.name = req.body.name;
                }
                if (req.body.address) {
                    new_company.address = req.body.address;
                }
                if (req.body.zipCode) {
                    new_company.zipCode = req.body.zipCode;
                }
                if (req.body.country) {
                    new_company.country = req.body.country;
                }

                new_company.save((err, data) => {
                    if (err) {
                        res.status(400).json({
                            errorMessage: err,
                            status: false,
                        });
                    } else {
                        res.status(200).json({
                            status: true,
                            title: "company updated.",
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

/* Api to delete company */
router.post("/delete-company", (req, res) => {
    try {
        if (req.body && req.body.id) {
            company.findByIdAndUpdate(
                req.body.id, {
                    is_delete: true
                }, {
                    new: true
                },
                (err, data) => {
                    if (data.is_delete) {
                        res.status(200).json({
                            status: true,
                            title: "company deleted.",
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

/*Api to get and search company with pagination and search by name*/
router.get("/get-company", (req, res) => {
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
        company
            .find(query, {
                date: 1,
                name: 1,
                id: 1,
                address: 1,
                zipCode: 1,
                country: 1,
                image: 1,
            })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .then((data) => {
                company
                    .find(query)
                    .count()
                    .then((count) => {
                        if (data && data.length > 0) {
                            res.status(200).json({
                                status: true,
                                title: "company retrived.",
                                companies: data,
                                current_page: page,
                                total: count,
                                pages: Math.ceil(count / perPage),
                            });
                        } else {
                            res.status(400).json({
                                errorMessage: "There is no company!",
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