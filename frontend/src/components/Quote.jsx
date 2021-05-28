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

export default class Quote extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openQuoteModal: false,
      openQuoteEditModal: false,
      id: "",
      loading: false,
      client: "",
      total: "",
      Reduction: "",
      Status: "",
      page: 1,
      search: "",
      quotes: [],
      pages: 0,
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      this.props.history.push("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getQuotes();
      });
    }
  };

  getQuotes = () => {
    this.setState({ loading: true });

    let data = "?";
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios
      .get(`http://localhost:2000/get-quote${data}`, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          quotes: res.data.quotes,
          pages: res.data.pages,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.setState({ loading: false, quotes: [], pages: 0 }, () => {});
      });
  };

  deleteQuote = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-quote",
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
      this.getQuotes();
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
        this.getQuotes();
      });
    }
  };

  addQuote = () => {
    const file = new FormData();
    file.append("client", this.state.client);
    file.append("total", this.state.total);
    file.append("Reduction", this.state.Reduction);
    file.append("Status", this.state.Status);

    axios
      .post("http://localhost:2000/add-quote", file, {
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

        this.handleQuoteClose();
        this.setState(
          { client: "", total: "", Reduction: "", Status: "", page: 1 },
          () => {
            this.getQuotes();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleQuoteClose();
      });
  };

  updateQuote = () => {
    const file = new FormData();
    file.append("id", this.state.id);
    file.append("client", this.state.client);
    file.append("total", this.state.total);
    file.append("Reduction", this.state.Reduction);
    file.append("Status", this.state.Status);

    axios
      .post("http://localhost:2000/update-quote", file, {
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

        this.handleQuoteEditClose();
        this.setState(
          { client: "", total: "", Reduction: "", Status: "" },
          () => {
            this.getQuotes();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleQuoteEditClose();
      });
  };

  handleQuoteOpen = () => {
    this.setState({
      openQuoteModal: true,
      id: "",
      client: "",
      total: "",
      Reduction: "",
      Status: "",
    });
  };

  handleQuoteClose = () => {
    this.setState({ openQuoteModal: false });
  };

  handleQuoteEditOpen = (data) => {
    this.setState({
      openQuoteEditModal: true,
      id: data._id,
      client: data.client,
      total: data.total,
      Reduction: data.Reduction,
      Status: data.Status,
    });
  };

  handleQuoteEditClose = () => {
    this.setState({ openQuoteEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <Button
            // className="button_style"
            variant="contained"
            // color="primary"
            size="small"
            style={{ color: "red" }}
            onClick={this.handleQuoteOpen}
          >
            Add Quote
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

        {/* Edit Quote */}
        <Dialog
          open={this.state.openQuoteEditModal}
          onClose={this.handleQuoteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Quote</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="client"
              value={this.state.client}
              onChange={this.onChange}
              placeholder=" client"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="total"
              value={this.state.total}
              onChange={this.onChange}
              placeholder="total"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="Reduction"
              value={this.state.Reduction}
              onChange={this.onChange}
              placeholder="Reduction"
              required
            />

            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="Status"
              value={this.state.Status}
              onChange={this.onChange}
              placeholder="Status"
              required
            />
            <br />
            <br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleQuoteEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.client == "" ||
                this.state.total == "" ||
                this.state.Reduction == "" ||
                this.state.Status == ""
              }
              onClick={(e) => this.updateQuote()}
              color="primary"
              autoFocus
            >
              Edit quote
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Quote */}
        <Dialog
          open={this.state.openQuoteModal}
          onClose={this.handleQuoteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Quote</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="client"
              value={this.state.client}
              onChange={this.onChange}
              placeholder="client"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="total"
              value={this.state.total}
              onChange={this.onChange}
              placeholder="total"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="Reduction"
              value={this.state.Reduction}
              onChange={this.onChange}
              placeholder="Reduction"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="Status"
              value={this.state.Status}
              onChange={this.onChange}
              placeholder="Status"
              required
            />
            <br />
            <br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleQuoteClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.client == "" ||
                this.state.total == "" ||
                this.state.Reduction == "" ||
                this.state.Status == ""
              }
              onClick={(e) => this.addQuote()}
              color="primary"
              autoFocus
            >
              Add Quote
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
            placeholder="Search by quote name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Client</TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell align="center">Reduction</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.quotes.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.client}
                  </TableCell>

                  <TableCell align="center">{row.total}</TableCell>
                  <TableCell align="center">{row.Reduction}</TableCell>
                  <TableCell align="center">{row.Status}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleQuoteEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteQuote(row._id)}
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
