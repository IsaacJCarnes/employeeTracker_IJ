const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const dotenv = require("dotenv");

const PORT = process.env.PORT || 3001;
const { parsed: parsedEnv } = dotenv.config();

const db = mysql.createConnection(
  {
    host: "localhost",
    user: parsedEnv.DB_USER,
    password: parsedEnv.DB_PASSWORD,
    database: parsedEnv.DB_NAME,
  },
  console.log("Connected to " + parsedEnv.DB_NAME + ".")
);

const mainMenuChoices = [
  "View All Employees",
  "Add Employee",
  "Update Employee Role",
  "View All Roles",
  "Add Role",
  "View All Departments",
  "Add Department",
  "Quit",
];
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
      switch (initialChoice.menuChoice) {
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
          addRole();
          break;
        case mainMenuChoices[5]:
          viewDepartments();
          break;
        case mainMenuChoices[6]:
          addDepartment();
          break;
        case mainMenuChoices[7]:
          break;
      }
    });
}

function viewEmployees() { //Queries all employees and logs them in table //WORK TODO
  db.query(
    "SELECT employee.id, employee.first_name, employee.last_name FROM employee",
    function (err, results) {
      if (err) {
        console.log(err);
      }
      console.table(results);
      mainMenu();
    }
  );
}

function addEmployee() { //Asks for relevant data and then adds new employee to employee table
  let currentRoles = "";
  let possibleManagers = "";
  db.query("SELECT title, id FROM role;", function (err, result) {
    if (err) {
    }
    currentRoles = result.map((role) => ({
      name: role.title,
      value: { id: role.id, name: role.title },
    }));
    db.query(
      "SELECT first_name, last_name, id FROM employee;",
      function (err, result) {
        if (err) {
        }
        possibleManagers = result.map((manager) => ({
          name: manager.first_name + " " + manager.last_name,
          value: {
            id: manager.id,
            name: manager.first_name + " " + manager.last_name,
          },
        }));
        possibleManagers = possibleManagers.concat({
          name: "No Manager",
          value: {
            id: null,
            name: null,
          },
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
          ])
          .then((empData) => {
            let managerId = empData.emp_manager;
            console.log(managerId);
            if (managerId.id) {
              managerId = managerID.id;
            } else {
              managerId = null;
            }
            db.query(
              "INSERT INTO employee SET ?",
              {
                first_name: empData.first_name,
                last_name: empData.last_name,
                role_id: empData.emp_role.id,
                manager_id: managerId,
              },
              (err, results) => {
                if (err) {
                  console.log(err);
                }
                console.log(
                  "Added " +
                    empData.first_name +
                    " " +
                    empData.last_name +
                    " to employee table."
                );
                mainMenu();
              }
            );
          });
      }
    );
  });
}

function viewRoles() { //Queries all roles and logs them in table //WORK TODO
  db.query(
    "SELECT role.id, role.title, role.salary FROM role", //Needs department name
    function (err, results) {
      if (err) {
        console.log(err);
      }
      console.table(results);
      mainMenu();
    }
  );
}

function addRole() { //Asks for relevant data and then adds new role to role table
  let currentDepartments = "";
  db.query("SELECT * FROM department", function (err, result) {
    if (err) {
    } else {
      currentDepartments = result.map((department) => ({
        name: department.name,
        value: { id: department.id, name: department.name },
      }));
      inquirer
        .prompt([
          {
            type: "input",
            message: "What is the title of the role?",
            name: "role_title",
          },
          {
            type: "input",
            message: "What is the salary of the role?",
            name: "role_salary",
          },
          {
            type: "list",
            message: "What is the department of the role?",
            name: "role_department",
            choices: currentDepartments,
          },
        ])
        .then((role_data) => {
          db.query(
            "INSERT INTO role SET ?",
            {
              title: role_data.role_title,
              salary: role_data.role_salary,
              department_id: role_data.role_department.id,
            },
            (err, results) => {
              if (err) {
                console.log(err);
              }
              console.log("Added " + role_data.role_title + " to role table.");
              mainMenu();
            }
          );
        });
    }
  });
}

function viewDepartments() { //Queries all departments and logs them in table
  db.query(
    "SELECT department.id, department.name FROM department",
    function (err, results) {
      if (err) {
        console.log(err);
      }
      console.table(results);
      mainMenu();
    }
  );
}

function addDepartment() { //Asks for relevant data and then adds new department to deparment table
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "dep_name",
      },
    ])
    .then((dep_data) => {
      db.query(
        "INSERT INTO department SET name = ?",
        dep_data.dep_name,
        (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log("Added " + dep_data.dep_name + " to department table.");
          mainMenu();
        }
      );
    });
}

//Starts the inquirer loop
mainMenu();
