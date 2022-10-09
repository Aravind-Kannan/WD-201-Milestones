// models/todo.js
"use strict";
const { Op, Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      let overdueTasks = await Todo.overdue();
      console.log(
        overdueTasks.map((task) => task.displayableString()).join("\n")
      );
      console.log("\n");

      console.log("Due Today");
      let todayTasks = await Todo.dueToday();
      console.log(
        todayTasks.map((task) => task.displayableString()).join("\n")
      );
      console.log("\n");

      console.log("Due Later");
      let dueLaterTasks = await Todo.dueLater();
      console.log(
        dueLaterTasks.map((task) => task.displayableString()).join("\n")
      );
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
        },
      });
    }

    static async dueToday() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
        },
      });
    }

    static async dueLater() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
        },
      });
    }

    static async markAsComplete(id) {
      await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
    }

    displayableString() {
      let today = new Date();
      let isToday =
        today.toDateString() == new Date(this.dueDate).toDateString();
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${
        !isToday ? this.dueDate : ""
      }`.trim();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
