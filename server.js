/********************************************************************************
* BTI325 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: ______Ram Grover________________ Student ID: ___158824219_________ Date: ____11/18/2023______
*
LInk = https://super-moccasins-worm.cyclic.app/
********************************************************************************/


const legoData = require("./modules/legoSets");
const authData=require("./modules/auth-service");
const clientSessions = require("client-sessions");
const express = require("express");
const path = require("path");
const app = express();
const Sequelize = require('sequelize');
const PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "top_secret",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
}); 

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    if (req.query.theme) {
      let sets = await legoData.getSetsByTheme(req.query.theme);
      if (sets.length > 0) {
        res.render("sets", { sets: sets });
      }
      else {
        res.render('404', { message: "I'm Sorry, there are no sets with that theme" })
      }
    }
    else {
      let sets = await legoData.getAllSets();
      res.render("sets", { sets: sets });
    }
  } catch (err) {
    res.render('404', { message: err });
  }
});

app.get("/lego/addSet",ensureLogin, async (req, res) => {
  try {
    let themeData = await legoData.getAllThemes();
    res.render("addSet", { theme: themeData });
  } catch (err) {
    res.render('404', { message: err });
  }
});

app.get("/lego/sets/:id", (req, res) => {
  legoData
    .getSetByNum(req.params.id)
    .then((data) => res.render("set", { set: data }))
    .catch((err) =>
      res.status(404).render("404", { message: "I'm sorry, the specified set was not found!" })//sendFile(path.join(__dirname, "/views/404.html"))
    );
});

app.post("/lego/addSet",ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:num",ensureLogin, async (req, res) => {
  try {
    const getSet = await legoData.getSetByNum(req.params.num);
    const getThemes = await legoData.getAllThemes();
    res.render("editSet", { themes: getThemes, set: getSet });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.post("/lego/editSet",ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num",ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (error) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

app.get('/login', (req, res) => {
  const errorMessage = '';
  res.render('login', { userName: '', errorMessage}); 
});

app.get('/register', (req, res) => {
  console.log("GET register route: Rendering register page");
  res.render('register', { errorMessage: '', successMessage: '' });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.post('/register', (req, res) => {
  const userData = req.body;
  authData.registerUser(userData)
    .then(() => {
      console.log("POST register route: User created successfully");
      res.render('register', { successMessage: 'User created', errorMessage: '' });
    })
    .catch((err) => {
      console.error("POST register route error:", err);
      res.render('register', { errorMessage: err, userName: req.body.userName, successMessage: ''});
    });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
})


app.get('/userHistory', ensureLogin, (req, res) =>{
  res.render('userHistory');
})



app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" })//sendFile(path.join(__dirname,"/views/404.html"));
});


// Start the server
legoData.initialize()
  .then(() => authData.initialize)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start the server:', error);
  });
