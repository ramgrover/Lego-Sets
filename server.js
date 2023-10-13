/********************************************************************************
* BTI325 – Assignment 02
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: ______Ram Grover________________ Student ID: ___158824219___________ Date: ____27/09/2023______
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require("express");
const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
  });

  app.get("/about",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });
  
  app.get("/lego/sets", (req, res) => {
    if(req.query.theme){
      legoData.getSetsByTheme(req.query.theme)
      .then((data)=>res.status(200).json(data))
      .catch((err)=>res.status(404).sendFile(path.join(__dirname,"/views/404.html"))
      );

    }

    legoData.getAllSets().then((data)=>res.json(data))
    .catch((err)=>
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"))
    );
  });
  
  app.get("/lego/sets/:id", (req, res) => {
    legoData
      .getSetByNum(req.params.id)
      .then((data) => res.json(data))
      .catch((err) =>
        res.status(404).sendFile(path.join(__dirname, "/views/404.html"))
      );
  });
  
/*app.get("/lego/sets/theme-demo", (req, res) => {
    const theme = "tech"; 
    legoData
      .getSetsByTheme(theme)
      .then(sets => res.json(sets))
      .catch(error => {res.json(error)});
  });*/
  app.use((req,res)=>{
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
  });


  // Start the server
  legoData.initialize().then(()=>{
  app.listen(HTTP_PORT,()=>{
    console.log(`Server listening on: ${HTTP_PORT}`);
  });
  })
  