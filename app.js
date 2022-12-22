const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const flash = require("connect-flash");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message.includes("Did not get a valid CSRF token")) {
    res.status(403).json({ message: "Invalid CSRF token!" });
  }
});

app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.use(flash());
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "super-secret-key",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      console.log({ username, password, done });
      console.log(done);
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          if (user !== null) {
            const result = await bcrypt.compare(password, user.password);
            console.log(user);
            if (result) return done(null, user);
            else return done(null, false, { message: "Invalid password" });
          } else {
            return done(null, false, { message: "Invalid email" });
          }
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => done(null, user))
    .catch((error) => done(error, null));
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

const { Todo, User } = require("./models");

app.get("/", async (request, response) => {
  if (request.user) {
    response.redirect("/todos");
  } else {
    response.render("index", {
      title: "Todo application",
      csrfToken: request.csrfToken(),
    });
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);

  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    if (error.errors[0].validatorKey === "len") {
      request.flash(
        "error",
        error.errors[0].path + " is less than 3 characters"
      );
    } else {
      request.flash("error", error.errors[0].message);
    }
    console.log(error);
    response.redirect("/signup");
  }
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const overdue = await Todo.overdue(loggedInUser);
    const dueToday = await Todo.dueToday(loggedInUser);
    const dueLater = await Todo.dueLater(loggedInUser);
    const completed = await Todo.completed(loggedInUser);
    if (request.accepts("html")) {
      response.render("todos", {
        overdue,
        dueToday,
        dueLater,
        completed,
        csrfToken: request.csrfToken(),
        user: request.user,
      });
    } else {
      response.json({
        overdue,
        dueToday,
        dueLater,
        completed,
        user: request.user,
      });
    }
  }
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      request.flash("error", error.message);
      return response.redirect("/todos");
      // return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const todo = await Todo.findByPk(request.params.id);
    try {
      if ("completed" in request.body) {
        let updatedTodo = await todo.setCompletionStatus(
          request.body.completed
        );
        return response.json(updatedTodo);
      }
      return response
        .status(422)
        .json({ message: "Missing completed property" });
    } catch (error) {
      console.log(error);
      return response.status(422).json({ success: false, error });
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const count = await Todo.remove(request.params.id, request.user.id);
      if (count === 0) return response.json({ success: false });
      return response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json({ error });
    }
  }
);

module.exports = app;
