const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.json());
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

const { Todo } = require("./models");

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  const today = new Date().toISOString().split("T")[0];
  const overdue = allTodos.filter((todo) => {
    return todo.dueDate < today;
  });
  const dueToday = allTodos.filter((todo) => {
    return todo.dueDate === today;
  });
  const dueLater = allTodos.filter((todo) => {
    return todo.dueDate > today;
  });
  if (request.accepts("html")) {
    response.render("index", {
      overdue,
      dueToday,
      dueLater,
    });
  } else {
    response.json({
      allTodos,
    });
  }
});

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  try {
    const deletedTodo = await Todo.destroy({
      where: {
        id: request.params.id,
      },
    });
    return response.json(deletedTodo === 1);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
