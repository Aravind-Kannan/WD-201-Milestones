const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    let dateToday = new Date();
    const today = formattedDate(dateToday);
    return all.filter((todo) => {
      return todo.dueDate < today;
    });
  };

  const dueToday = () => {
    let dateToday = new Date();
    const today = formattedDate(dateToday);
    return all.filter((todo) => {
      return todo.dueDate === today;
    });
  };

  const dueLater = () => {
    let dateToday = new Date();
    const today = formattedDate(dateToday);
    return all.filter((todo) => {
      return todo.dueDate > today;
    });
  };

  const toDisplayableList = (list) => {
    let dateToday = new Date();
    const today = formattedDate(dateToday);
    return list
      .map((todo) => {
        return `[${todo.completed ? "x" : " "}] ${todo.title} ${
          todo.dueDate !== today ? todo.dueDate : " "
        }`;
      })
      .join("\n");
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

module.exports = todoList;
