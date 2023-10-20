const express = require('express');
const bodyParser = require ("body-parser");
const https = require('https');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

const apiURL = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api";
const allJson = "/all.json";
const byId = "/id";
const powerStats = "/powerstats";
const appearance = "/appearance";
const biography = "/biography";
const connections = "/connections";
const work = "/work";

var jsonFile;

app.route("/")
.get((req, res) =>{
    res.render("index");
})
.post((req, res) =>{
    res.redirect("/");
});

app.route("/getAll")
.get((req, res) =>{
  https.get(apiURL + allJson, (response) =>{
    console.log(response.statusCode);
    if (response.statusCode == 200){
        let tmpJson = "";
      response.on("data", (data) => {
        try {
          tmpJson += data;
        } catch (error) {
          console.log(error);
          // Handle the JSON parse error
        }
      }).on("end", (data) => {
        jsonFile = JSON.parse(tmpJson);
        res.status(200).json(jsonFile);
      });
    }
  });
});

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("There was an error in the app");
});

app.listen(3000, () => {
    console.log("Listening Port 3000");
});