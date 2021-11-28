const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const dotenv = require("dotenv");

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
        name: "menuChoice",
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
      switch(initialChoice.menuChoice){
        case mainMenuChoices[0]:
          viewEmployees();
          break;
        case mainMenuChoices[1]:
          addEmployee();
          break;
        case mainMenuChoices[2]:
          //updateEmployeeRole();
          break;
        case mainMenuChoices[3]:
          viewRoles();
          break;
        case mainMenuChoices[4]:
          //addRole();
          break;
        case mainMenuChoices[5]:
          viewDepartments();
          break;
        case mainMenuChoices[6]:
          addDepartment();
          break;
        case mainMenuChoices[7]:
          break;
      };
    });
}


function viewEmployees(){
  db.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee",
    function(err, results) {
      if (err) {
        console.log(err);
      }
      console.table(results);
      mainMenu();
    }
  );
}

function addEmployee(){
  let currentRoles = "";
  let possibleManagers = "";
  db.query("SELECT title, id FROM role;", 
    function(err, result){
      currentRoles = result.map(role => ({name: role.title, value: {id: role.id, name:role.title}}))
    });
  db.query("SELECT first_name, last_name, id FROM employee;",
    function(err, result){
      possibleManagers = result.map(manager => ({name: manager.first_name + " " + manager.last_name, value: {id: manager.id, name:manager.first_name + " " + manager.last_name}}))
    });
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "first_name",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "last_name",
      },
      {
        type: "list",
        message: "What is the employee's role?",
        name: "emp_role",
        choices: currentRoles,
      },
      {
        type: "list",
        message: "What is the employee's managers id?",
        name: "emp_manager",
        choices: possibleManagers,
      },
    ]).then((empData) => {
        db.query("INSERT INTO employee VALUES (" + empData.first_name + ", " + empData.last_name + ", " + empData.emp_role.id + ", " + empData.emp_manager.id + ")" );
        console.log(empData.first_name + " " + empData.last_name + " added to employees.");
        mainMenu();
    });
}

function viewRoles(){

}

function addRole(){

}

function viewDepartments(){

}

function addDepartment(){
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name:"dep_name",
      }
    ]).then((dep_data) => {
      db.query("INSERT INTO department VALUES ("+dep_data.dep_name+")");
      console.log("Added " + dep_data.dep_name + " to departments.");
      mainMenu();
    });
}

//Starts the inquirer loop
mainMenu();