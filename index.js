const mysql = require("mysql2");
const inquirer = require("inquirer");
const console_table = require("console.table");

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "rootpass",
    database: "company_db",
  },
  console.log(`Connected to the track database.`)
);

const mainMenuChoices = ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit"];
function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "mainMenu",
        choices: [
          mainMenuChoices[0],
          mainMenuChoices[1],
          mainMenuChoices[2],
          mainMenuChoices[3],
          mainMenuChoices[4],
          mainMenuChoices[5],
          mainMenuChoices[6],
          mainMenuChoices[7],

        ],
      },
    ])
    .then((initialChoice) => {});
}
