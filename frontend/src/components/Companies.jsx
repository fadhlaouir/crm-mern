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

export default class Companies extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openCompanyModal: false,
      openCompanyEditModal: false,
      id: "",
      loading: false,
      name: "",
      address: "",
      zipCode: "",
      country: "",
      page: 1,
      search: "",
      companies: [],
      pages: 0,
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      this.props.history.push("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getCompanies();
      });
    }
  };

  getCompanies = () => {
    this.setState({ loading: true });

    let data = "?";
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios
      .get(`http://localhost:2000/get-company${data}`, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          companies: res.data.companies,
          pages: res.data.pages,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.setState({ loading: false, companies: [], pages: 0 }, () => {});
      });
  };

  deleteCompany = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-company",
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
      this.getCompanies();
    });
  };

  logOut = () => {
    localStorage.setItem("token", null);
    this.props.history.push("/");
  };

  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => {});
    }
    this.setState({ [e.target.name]: e.target.value }, () => {});
    if (e.target.name == "search") {
      this.setState({ page: 1 }, () => {
        this.getCompanies();
      });
    }
  };

  addCompany = () => {
    const file = new FormData();
    file.append("name", this.state.name);
    file.append("address", this.state.address);
    file.append("zipCode", this.state.zipCode);
    file.append("country", this.state.address);

    axios
      .post("http://localhost:2000/add-company", file, {
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

        this.handleCompanyClose();
        this.setState(
          { name: "", address: "", zipCode: "", country: "", page: 1 },
          () => {
            this.getCompanies();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleCompanyClose();
      });
  };

  updateCompany = () => {
    const file = new FormData();
    file.append("id", this.state.id);
    file.append("name", this.state.name);
    file.append("address", this.state.address);
    file.append("zipCode", this.state.zipCode);
    file.append("country", this.state.address);

    axios
      .post("http://localhost:2000/update-company", file, {
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

        this.handleCompanyEditClose();
        this.setState(
          { name: "", address: "", zipCode: "", country: "" },
          () => {
            this.getCompanies();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleCompanyEditClose();
      });
  };

  handleCompanyOpen = () => {
    this.setState({
      openCompanyModal: true,
      id: "",
      name: "",
      address: "",
      zipCode: "",
      country: "",
    });
  };

  handleCompanyClose = () => {
    this.setState({ openCompanyModal: false });
  };

  handleCompanyEditOpen = (data) => {
    this.setState({
      openCompanyEditModal: true,
      id: data._id,
      name: data.name,
      address: data.address,
      zipCode: data.zipCode,
      country: data.country,
    });
  };

  handleCompanyEditClose = () => {
    this.setState({ openCompanyEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2>Companies</h2>
          <Button
            // className="button_style"
            variant="contained"
            // color="primary"
            size="small"
            style={{ color: "red" }}
            onClick={this.handleCompanyOpen}
          >
            Add Company
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Company */}
        <Dialog
          open={this.state.openCompanyEditModal}
          onClose={this.handleCompanyClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Company</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Company Name"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="address"
              value={this.state.address}
              onChange={this.onChange}
              placeholder="Address"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="zipCode"
              value={this.state.zipCode}
              onChange={this.onChange}
              placeholder="zipCode"
              required
            />

            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="country"
              value={this.state.country}
              onChange={this.onChange}
              placeholder="country"
              required
            />
            <br />
            <br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleCompanyEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.name == "" ||
                this.state.address == "" ||
                this.state.zipCode == "" ||
                this.state.country == ""
              }
              onClick={(e) => this.updateCompany()}
              color="primary"
              autoFocus
            >
              Edit Company
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Compnay */}
        <Dialog
          open={this.state.openCompanyModal}
          onClose={this.handleCompanyClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Company</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Company Name"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="address"
              value={this.state.address}
              onChange={this.onChange}
              placeholder="address"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="zipCode"
              value={this.state.zipCode}
              onChange={this.onChange}
              placeholder="zipCode"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="country"
              value={this.state.country}
              onChange={this.onChange}
              placeholder="country"
              required
            />
            <br />
            <br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleCompanyClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.name == "" ||
                this.state.address == "" ||
                this.state.zipCode == "" ||
                this.state.country == ""
              }
              onClick={(e) => this.addCompany()}
              color="primary"
              autoFocus
            >
              Add Company
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
            placeholder="Search by Company name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">address</TableCell>
                <TableCell align="center">zipCode</TableCell>
                <TableCell align="center">country</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.companies.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.name}
                  </TableCell>

                  <TableCell align="center">{row.address}</TableCell>
                  <TableCell align="center">{row.zipCode}</TableCell>
                  <TableCell align="center">{row.country}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleCompanyEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteCompany(row._id)}
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
