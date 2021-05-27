var express = require("express");
var app = express();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var multer = require("multer"),
    bodyParser = require("body-parser"),
    path = require("path");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/productDB");
var fs = require("fs");
var item = require("./model/item.js");
var user = require("./model/user.js");
var company = require("./model/company.js");

var dir = "./uploads";

var upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            callback(null, "./uploads");
        },
        filename: function(req, file, callback) {
            callback(
                null,
                file.fieldname + "-" + Date.now() + path.extname(file.originalname)
            );
        },
    }),

    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
            return callback( /*res.end('Only images are allowed')*/ null, false);
        }
        callback(null, true);
    },
});
app.use(cors());
app.use(express.static("uploads"));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: false,
    })
);



app.use("/", (req, res, next) => {
    try {
        if (req.path == "/login" || req.path == "/register" || req.path == "/") {
            next();
        } else {
            /* decode jwt token if authorized*/
            jwt.verify(req.headers.token, "shhhhh11111", function(err, decoded) {
                if (decoded && decoded.user) {
                    req.user = decoded;
                    next();
                } else {
                    return res.status(401).json({
                        errorMessage: "User unauthorized!",
                        status: false,
                    });
                }
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: true,
        title: "Apis",
    });
});


//  --------------------------------------------------------  Auth -------------------------------------------------------- 
/* login api */
app.post("/login", (req, res) => {
    try {
        if (req.body && req.body.username && req.body.password) {
            user.find({
                username: req.body.username
            }, (err, data) => {
                if (data.length > 0) {
                    if (bcrypt.compareSync(data[0].password, req.body.password)) {
                        checkUserAndGenerateToken(data[0], req, res);
                    } else {
                        res.status(400).json({
                            errorMessage: "Username or password is incorrect!",
                            status: false,
                        });
                    }
                } else {
                    res.status(400).json({
                        errorMessage: "Username or password is incorrect!",
                        status: false,
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

/* register api */
app.post("/register", (req, res) => {
    try {
        if (req.body && req.body.username && req.body.password) {
            user.find({
                username: req.body.username
            }, (err, data) => {
                if (data.length == 0) {
                    let User = new user({
                        username: req.body.username,
                        password: req.body.password,
                    });
                    User.save((err, data) => {
                        if (err) {
                            res.status(400).json({
                                errorMessage: err,
                                status: false,
                            });
                        } else {
                            res.status(200).json({
                                status: true,
                                title: "Registered Successfully.",
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        errorMessage: `UserName ${req.body.username} Already Exist!`,
                        status: false,
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

function checkUserAndGenerateToken(data, req, res) {
    jwt.sign({
            user: data.username,
            id: data._id
        },
        "shhhhh11111", {
            expiresIn: "1d"
        },
        (err, token) => {
            if (err) {
                res.status(400).json({
                    status: false,
                    errorMessage: err,
                });
            } else {
                res.json({
                    message: "Login Successfully.",
                    token: token,
                    status: true,
                });
            }
        }
    );
}

//  --------------------------------------------------------  item -------------------------------------------------------- 

/* Api to add item */
app.post("/add-item", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.name &&
            req.body.desc &&
            req.body.price &&
            req.body.quantity &&
            // req.body.quote
        ) {
            let new_item = new item();
            new_item.name = req.body.name;
            new_item.desc = req.body.desc;
            new_item.price = req.body.price;
            new_item.image = req.files[0].filename;
            new_item.quantity = req.body.quantity;
            // new_item.quote = req.body.quote;
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
app.post("/update-item", upload.any(), (req, res) => {
    try {
        if (
            req.files &&
            req.body &&
            req.body.name &&
            req.body.desc &&
            req.body.price &&
            req.body.id &&
            req.body.quantity &&
            // req.body.quote
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
                // if (req.body.quote) {
                //     new_item.quote = req.body.quote;
                // }


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
app.post("/delete-item", (req, res) => {
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
app.get("/get-item", (req, res) => {
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
                // quote: 1,
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


//  --------------------------------------------------------  company -------------------------------------------------------- 


/* Api to add company */
app.post("/add-company", upload.any(), (req, res) => {
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
app.post("/update-company", upload.any(), (req, res) => {
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
app.post("/delete-company", (req, res) => {
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
app.get("/get-company", (req, res) => {
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

//  --------------------------------------------------------  contact -------------------------------------------------------- 


/* Api to add contact */
app.post("/add-contact", upload.any(), (req, res) => {
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
            new_contact.name = req.body.firstName;
            new_contact.address = req.body.lastName;
            new_contact.zipCode = req.body.email;

            new_contact.country = req.body.phone;
            new_contact.country = req.body.company;
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
app.post("/update-contact", upload.any(), (req, res) => {
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
app.post("/delete-contact", (req, res) => {
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
app.get("/get-contact", (req, res) => {
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
                date: 1,
                firstName: 1,
                id: 1,
                lastName: 1,
                email: 1,
                company: 1,
                image: 1,
                phone: 1
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


app.listen(2000, () => {
    console.log("Server is Runing On port 2000");
});