/* eslint-disable no-unused-vars */
"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    static getTodos() {
      return this.findAll();
    }
    static overdue(userId) {
      return this.findAll({
        where: {
          [Op.and]: [
            {
              dueDate: {
                [Op.lt]: new Date(),
              },
            },
            {
              completed: false,
            },
            {
              userId,
            },
          ],
        },
      });
    }
    static dueToday(userId) {
      return this.findAll({
        where: {
          [Op.and]: [
            {
              dueDate: {
                [Op.eq]: new Date(),
              },
            },
            {
              completed: false,
            },
            {
              userId,
            },
          ],
        },
      });
    }
    static dueLater(userId) {
      return this.findAll({
        where: {
          [Op.and]: [
            {
              dueDate: {
                [Op.gt]: new Date(),
              },
            },
            {
              completed: false,
            },
            {
              userId,
            },
          ],
        },
      });
    }
    static completed(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }
    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
    setCompletionStatus(status) {
      return this.update({ completed: status });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
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
