import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Items from "../components/Items";
import Companies from "../components/Companies";
import Contacts from "../components/Contacts";
import { useHistory } from "react-router-dom";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export default function VerticalTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
      >
        <Tab label="Item" {...a11yProps(0)} />
        <Tab label="Companies" {...a11yProps(1)} />
        <Tab label="Contact" {...a11yProps(2)} />
        <Tab label="Quote" {...a11yProps(3)} />
        <Tab
          label={
            <Button
              className="button_style"
              variant="contained"
              size="small"
              // onClick={logOut()}
            >
              Log Out
            </Button>
          }
          {...a11yProps(4)}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Items />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Companies />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Contacts />
      </TabPanel>
      <TabPanel value={value} index={3}>
        Quote
      </TabPanel>
    </div>
  );
}
