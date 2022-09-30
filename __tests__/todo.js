/* eslint-disable no-undef */
const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todolist Test Suite", () => {
  const formattedDate = (d) => {
    return d.toISOString().split("T")[0];
  };

  let dateToday = new Date();
  const today = formattedDate(dateToday);
  const yesterday = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() - 1))
  );
  const tomorrow = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() + 1))
  );

  beforeAll(() => {
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
  });

  test("Should add new todo", () => {
    let todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: today,
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should check retrival of overdue items", () => {
    let overdueCount = overdue().length;
    add({
      title: "Overdue item",
      completed: false,
      dueDate: yesterday,
    });
    expect(overdue().length).toBe(overdueCount + 1);
  });

  test("Should check retrival of due today items", () => {
    let todayItemsCount = dueToday().length;
    add({
      title: "Due today item",
      completed: false,
      dueDate: today,
    });
    expect(dueToday().length).toBe(todayItemsCount + 1);
  });

  test("Should check retrival of due later items", () => {
    let dueLaterItemsCount = dueLater().length;
    add({
      title: "Due later item",
      completed: false,
      dueDate: tomorrow,
    });
    expect(dueLater().length).toBe(dueLaterItemsCount + 1);
  });
});
