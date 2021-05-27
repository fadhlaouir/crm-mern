import React, { Component } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  LinearProgress,
  DialogTitle,
  DialogContent,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import swal from "sweetalert";
const axios = require("axios");

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openContactModal: false,
      openContactEditModal: false,
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      file: "",
      fileName: "",
      page: 1,
      search: "",
      contacts: [],
      pages: 0,
      loading: false,
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      this.props.history.push("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getContacts();
      });
    }
  };

  getContacts = () => {
    this.setState({ loading: true });

    let data = "?";
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios
      .get(`http://localhost:2000/get-contact${data}`, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          contacts: res.data.contacts,
          pages: res.data.pages,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.setState({ loading: false, contacts: [], pages: 0 }, () => {});
      });
  };

  deleteContact = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-contact",
        {
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: this.state.token,
          },
        }
      )
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.setState({ page: 1 }, () => {
          this.pageChange(null, 1);
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
      });
  };

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getContacts();
    });
  };

  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => {});
    }
    this.setState({ [e.target.name]: e.target.value }, () => {});
    if (e.target.name == "search") {
      this.setState({ page: 1 }, () => {
        this.getContacts();
      });
    }
  };

  addContact = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("file", fileInput.files[0]);
    file.append("firstName", this.state.firstName);
    file.append("lastName", this.state.lastName);
    file.append("email", this.state.email);
    file.append("phone", this.state.phone);
    file.append("company", this.state.company);

    axios
      .post("http://localhost:2000/add-contact", file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.handleContactClose();
        this.setState(
          {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            file: null,
            page: 1,
          },
          () => {
            this.getContacts();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleContactClose();
      });
  };

  updateContact = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("id", this.state.id);
    file.append("file", fileInput.files[0]);
    file.append("firstName", this.state.firstName);
    file.append("lastName", this.state.lastName);
    file.append("email", this.state.email);
    file.append("phone", this.state.phone);
    file.append("company", this.state.company);

    axios
      .post("http://localhost:2000/update-contact", file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.handleContactEditClose();
        this.setState(
          {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            file: null,
          },
          () => {
            this.getContacts();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleContactEditClose();
      });
  };

  handleContactOpen = () => {
    this.setState({
      openContactModal: true,
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      fileName: "",
    });
  };

  handleContactClose = () => {
    this.setState({ openContactModal: false });
  };

  handleContactEditOpen = (data) => {
    this.setState({
      openContactEditModal: true,
      id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      fileName: data.image,
    });
  };

  handleContactEditClose = () => {
    this.setState({ openContactEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleContactOpen}
          >
            Add Contact
          </Button>
        </div>

        {/* Edit Contact */}
        <Dialog
          open={this.state.openContactEditModal}
          onClose={this.handleContactClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Contact</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="firstName"
              value={this.state.firstName}
              onChange={this.onChange}
              placeholder="Contact firstName"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="lastName"
              value={this.state.lastName}
              onChange={this.onChange}
              placeholder="lastName"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="email"
              autoComplete="off"
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              placeholder="Email"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="phone"
              value={this.state.phone}
              onChange={this.onChange}
              placeholder="phone"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="company"
              value={this.state.company}
              onChange={this.onChange}
              placeholder="company"
              required
            />
            <br />
            <Button variant="contained" component="label">
              {" "}
              Upload
              <input
                id="standard-basic"
                type="file"
                accept="image/*"
                name="file"
                value={this.state.file}
                onChange={this.onChange}
                id="fileInput"
                placeholder="File"
                hidden
              />
            </Button>
            &nbsp;
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleContactEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.firstName == "" ||
                this.state.lastName == "" ||
                this.state.email == "" ||
                this.state.phone == "" ||
                this.state.company == ""
              }
              onClick={(e) => this.updateContact()}
              color="primary"
              autoFocus
            >
              Edit Contact
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Contact */}
        <Dialog
          open={this.state.openContactModal}
          onClose={this.handleContactClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Contact</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="firstName"
              value={this.state.firstName}
              onChange={this.onChange}
              placeholder="firstName"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="lastName"
              value={this.state.lastName}
              onChange={this.onChange}
              placeholder="lastName"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="email"
              autoComplete="off"
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              placeholder="email"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="phone"
              value={this.state.phone}
              onChange={this.onChange}
              placeholder="phone"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="company"
              value={this.state.company}
              onChange={this.onChange}
              placeholder="company"
              required
            />
            <br />
            <Button variant="contained" component="label">
              {" "}
              Upload
              <input
                id="standard-basic"
                type="file"
                accept="image/*"
                // inputProps={{
                //   accept: "image/*"
                // }}
                name="file"
                value={this.state.file}
                onChange={this.onChange}
                id="fileInput"
                placeholder="File"
                hidden
                required
              />
            </Button>
            &nbsp;
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleContactClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.firstName == "" ||
                this.state.lastName == "" ||
                this.state.email == "" ||
                this.state.phone == "" ||
                this.state.company == "" ||
                this.state.file == null
              }
              onClick={(e) => this.addContact()}
              color="primary"
              autoFocus
            >
              Add Contact
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by Contact name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">firstName</TableCell>
                <TableCell align="center">lastName</TableCell>
                <TableCell align="center">email</TableCell>
                <TableCell align="center">phone</TableCell>
                <TableCell align="center">company</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.contacts.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.firstName}
                  </TableCell>
                  <TableCell align="center">
                    <img
                      src={`http://localhost:2000/${row.image}`}
                      width="70"
                      height="70"
                    />
                  </TableCell>
                  <TableCell align="center">{row.lastName}</TableCell>
                  <TableCell align="center">{row.email}</TableCell>
                  <TableCell align="center">{row.phone}</TableCell>
                  <TableCell align="center">{row.company}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleContactEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteContact(row._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination
            count={this.state.pages}
            page={this.state.page}
            onChange={this.pageChange}
            color="primary"
          />
        </TableContainer>
      </div>
    );
  }
}
