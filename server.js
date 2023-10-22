const express = require('express');
const bodyParser = require ("body-parser");
const https = require('https');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

//URLS for different requests to the API
const apiURL = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api";
const allJson = "/all.json";
const byId = "/id";
const powerStats = "/powerstats";
const appearance = "/appearance";
const biography = "/biography";
const connections = "/connections";
const work = "/work";

let superArr = [];
var supName;
var limit = 0;
var index = 1, indexIndiv = 1;

function getByName(){
  if (!superArr) {
    getAllJson(getByName);
    return;
  }

  superArr.forEach((sup, index) => {
    if (sup.name === supName) {
      return;
    }
  });
}

function getAllJson(callback) {
  if (superArr.length > 0) {
    if (typeof callback === "function") {
      callback();
    }
    return;
  }

  https.get(apiURL + allJson, (response) => {
    if (response.statusCode === 200) {
      let tmpJson = "";
      response.on("data", (data) => {
        tmpJson += data;
      }).on("end", () => {
        superArr = JSON.parse(tmpJson);
        limit = superArr.length;
        if (typeof callback === "function") {
          callback();
        }
      });
    }
  });
}

app.route("/")
  .get((req, res) => {
    getAllJson(() => {
      var sup1 = index, sup2 = index + 1;
      if (index >= limit && limit % 2 != 0) {
        sup2 = 1;
      }

      res.render("index", {
        currPage: "Index",
        sup1: superArr[sup1 - 1],
        index1: sup1 - 1,
        sup2: superArr[sup2 - 1],
        index2: sup2 - 1
      });
    });
  });

app.route("/next")
.get((req, res) =>{
  index += 2;
  if(index > limit){
    index = 1;
  }
  res.redirect("/");
});

app.route("/previous")
.get((req, res) =>{
  index -= 2;
  if(index < 1){
    index = limit;
  }
  res.redirect("/");
});

app.route("/nextIndiv")
.get((req, res) =>{
  indexIndiv++;
  if(indexIndiv > limit){
    indexIndiv = 1;
  }
  res.redirect("/superhero");
});

app.route("/previousIndiv")
.get((req, res) =>{
  indexIndiv -= 1;
  if(indexIndiv < 1){
    indexIndiv = limit;
  }
  res.redirect("/superhero");
});

app.route("/catalog")
.get((req, res) =>{
  getAllJson(() => {
    res.render("catalog", {currPage: "Catalog", superArr: superArr});
  });
});

app.route("/superhero")
.get((req, res) =>{
  getAllJson(() => {
    res.render("superhero", {currPage: "Individual", sup: superArr[indexIndiv - 1]});
  });
});

app.route("/showSup")
.get((req, res) =>{
  indexIndiv = req.query.index;
  indexIndiv++;
  res.redirect("/superhero");
});

app.route("/search").get((req, res) => {
  var found = false;
  supName = req.query.name;

  superArr.forEach((sup, index) => {
    if (sup.name.toLowerCase() == supName.toLowerCase()) {
      indexIndiv = index + 1;
      found = true;
      return; // End the loop
    }
  });

  if (found) {
    res.redirect("/superhero");
  } else {
    res.redirect("/error");
  }
});


app.route("/random")
.get((req, res) =>{
    indexIndiv = Math.floor(Math.random() * limit) + 1;
    res.redirect("/superhero");
});

app.route("/error")
.get((req, res) =>{
    res.render("error", {currPage: "Error"});
});

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("There was an error in the app");
});

app.listen(3000, () => {
    console.log("Listening Port 3000");
});