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

export default class Item extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openItemModal: false,
      openItemEditModal: false,
      id: "",
      name: "",
      desc: "",
      price: "",
      quantity: "",
      file: "",
      fileName: "",
      page: 1,
      search: "",
      items: [],
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
        this.getItem();
      });
    }
  };

  getItem = () => {
    this.setState({ loading: true });

    let data = "?";
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios
      .get(`http://localhost:2000/get-item${data}`, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          items: res.data.items,
          pages: res.data.pages,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.setState({ loading: false, items: [], pages: 0 }, () => {});
      });
  };

  deleteItem = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-item",
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
      this.getItem();
    });
  };

  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => {});
    }
    this.setState({ [e.target.name]: e.target.value }, () => {});
    if (e.target.name == "search") {
      this.setState({ page: 1 }, () => {
        this.getItem();
      });
    }
  };

  addItem = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("file", fileInput.files[0]);
    file.append("name", this.state.name);
    file.append("desc", this.state.desc);
    file.append("quantity", this.state.quantity);
    file.append("price", this.state.price);

    axios
      .post("http://localhost:2000/add-item", file, {
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

        this.handleItemClose();
        this.setState(
          { name: "", desc: "", quantity: "", price: "", file: null, page: 1 },
          () => {
            this.getItem();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleItemClose();
      });
  };

  updateItem = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("id", this.state.id);
    file.append("file", fileInput.files[0]);
    file.append("name", this.state.name);
    file.append("desc", this.state.desc);
    file.append("quantity", this.state.quantity);
    file.append("price", this.state.price);

    axios
      .post("http://localhost:2000/update-item", file, {
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

        this.handleItemEditClose();
        this.setState(
          { name: "", desc: "", quantity: "", price: "", file: null },
          () => {
            this.getItem();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleItemEditClose();
      });
  };

  handleItemOpen = () => {
    this.setState({
      openItemModal: true,
      id: "",
      name: "",
      desc: "",
      price: "",
      quantity: "",
      fileName: "",
    });
  };

  handleItemClose = () => {
    this.setState({ openItemModal: false });
  };

  handleItemEditOpen = (data) => {
    this.setState({
      openItemEditModal: true,
      id: data._id,
      name: data.name,
      desc: data.desc,
      price: data.price,
      quantity: data.quantity,
      fileName: data.image,
    });
  };

  handleItemEditClose = () => {
    this.setState({ openItemEditModal: false });
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
            onClick={this.handleItemOpen}
          >
            Add Item
          </Button>
        </div>

        {/* Edit Item */}
        <Dialog
          open={this.state.openItemEditModal}
          onClose={this.handleItemClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Item</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Item Name"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="quantity"
              value={this.state.quantity}
              onChange={this.onChange}
              placeholder="quantity"
              required
            />
            <br />
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
            <Button onClick={this.handleItemEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.name == "" ||
                this.state.desc == "" ||
                this.state.quantity == "" ||
                this.state.price == ""
              }
              onClick={(e) => this.updateItem()}
              color="primary"
              autoFocus
            >
              Edit Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Item */}
        <Dialog
          open={this.state.openItemModal}
          onClose={this.handleItemClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Item</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Item Name"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              required
            />
            <br />
            <TextField
              id="standard-basic"
              type="number"
              autoComplete="off"
              name="quantity"
              value={this.state.quantity}
              onChange={this.onChange}
              placeholder="quantity"
              required
            />
            <br />
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
            <Button onClick={this.handleItemClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={
                this.state.name == "" ||
                this.state.desc == "" ||
                this.state.quantity == "" ||
                this.state.price == "" ||
                this.state.file == null
              }
              onClick={(e) => this.addItem()}
              color="primary"
              autoFocus
            >
              Add Item
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
            placeholder="Search by Item name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">quantity</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.items.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">
                    <img
                      src={`http://localhost:2000/${row.image}`}
                      width="70"
                      height="70"
                    />
                  </TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                  <TableCell align="center">{row.quantity}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleItemEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteItem(row._id)}
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
