const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const dotenv = require("dotenv");
const Connection = require("mysql2/typings/mysql/lib/Connection");

const PORT = process.env.PORT || 3001;
const { parsed : parsedEnv} = dotenv.config();

const db = mysql.createConnection(
  {
    host: "localhost",
    user: parsedEnv.DB_USER,
    password: parsedEnv.DB_PASSWORD,
    database: parsedEnv.DB_NAME,
  },
  console.log("Connected to " + parsedEnv.DB_NAME +".")
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
    .then((initialChoice) => {
      switch(initialChoice){
        case mainMenuChoices[0]:
          viewEmployees();
          break;
        case mainMenuChoices[1]:
          break;
        case mainMenuChoices[2]:
          break;
        case mainMenuChoices[3]:
          viewRoles();
          break;
        case mainMenuChoices[4]:
          break;
        case mainMenuChoices[5]:
          viewDepartments();
          break;
        case mainMenuChoices[6]:
          break;
        case mainMenuChoices[7]:
          break;
      };
    });
}


function viewEmployees(){
  Connection.createQuery("SELECT * FROM ")

}

function viewRoles(){

}

function viewDepartments(){

}

//Starts the inquirer loop
mainMenu();