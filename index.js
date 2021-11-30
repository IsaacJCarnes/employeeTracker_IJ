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
  "Delete Employee",
  "View All Roles",
  "Add Role",
  "Delete Role",
  "View All Departments",
  "Add Department",
  "Delete Department",
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
          mainMenuChoices[8],
          mainMenuChoices[9],
          mainMenuChoices[10],
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
          updateEmpRole();
          break;
        case mainMenuChoices[3]:
          deleteEmployee();
          break;
        case mainMenuChoices[4]:
          viewRoles();
          break;
        case mainMenuChoices[5]:
          addRole();
          break;
        case mainMenuChoices[6]:
          deleteRole();
          break;
        case mainMenuChoices[7]:
          viewDepartments();
          break;
        case mainMenuChoices[8]:
          addDepartment();
          break;
        case mainMenuChoices[9]:
          deleteDepartment();
          break;
        case mainMenuChoices[10]:
          console.log("Exiting application, goodbye.");
          process.exit();
      }
    });
}

function viewEmployees() { //Queries all employees and logs them in table //Only shows employees with managers currently
  db.query(
    "SELECT emp.id, emp.first_name, emp.last_name, role.title , department.name AS department, role.salary, CONCAT(man.first_name, ' ', man.last_name) AS manager FROM employee AS emp INNER JOIN role ON emp.role_id=role.id INNER JOIN department ON role.department_id=department.id LEFT JOIN employee AS man ON emp.manager_id = man.id",
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
            if (managerId.id) {
              managerId = managerId.id;
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

function updateEmpRole(){ //Asks for relevant data and then changes employee's role to new role
  let currentEmployees = "";
  let currentRoles = "";
  db.query("SELECT first_name, last_name, id FROM employee;", function (err, result) {
    if (err) {
    }
    currentEmployees = result.map((emp) => ({
      name: emp.first_name + " " + emp.last_name,
      value: {
        id: emp.id,
        name: emp.first_name + " " + emp.last_name,
      },
    }));
    db.query(
      "SELECT title, id FROM role;",
      function (err, result) {
        if (err) {
        }
        currentRoles = result.map((role) => ({
          name: role.title,
          value: { id: role.id, name: role.title },
        }));
      

      inquirer
      .prompt([
      {
        type: "list",
        message: "Which employee's role do you want to update?",
        name: "emp",
        choices: currentEmployees,
      },
      {
        type: "list",
        message: "What is the employee's new role?",
        name: "emp_role",
        choices: currentRoles,
      },
      ]).then((empData) => {
        let empId = empData.emp.id;
        let empRole = empData.emp_role.id;
        db.query("UPDATE employee SET role_id = ? WHERE id = ?;", [empRole, empId], function(err, result){
          if(err){
            console.log(err);
          }
          console.log("Updated " + empData.emp.first_name + "'s role.");
          mainMenu();
        });
      });
    });
  });
}

function deleteEmployee(){ //Asks for employee from list and removes employee from employee table
  let currentEmployees = "";
  db.query("SELECT first_name, last_name, id FROM employee;", function (err, result) {
    if (err) {
    }
    currentEmployees = result.map((emp) => ({
      name: emp.first_name + " " + emp.last_name,
      value: {
        id: emp.id,
        name: emp.first_name + " " + emp.last_name,
      },
    }));
    inquirer.prompt([
      {
        type: "list",
        message: "Which employee do you want to delete?",
        name: "emp",
        choices: currentEmployees,
      },
    ]).then((empData) => {
      let fName = empData.emp.first_name;
      let lName = empData.emp.last_name;
      let empId = empData.emp.id;
      db.query("DELETE FROM employee WHERE id = ?", empId, function(err, result){
        if(err){
          console.log(err);
        }
        console.log("Deleted " + fName + " " + lName + " from employee table.");
        mainMenu();
      });
    });
  });
}

function viewRoles() { //Queries all roles and logs them in table
  db.query(
    "SELECT role.title, role.id, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id=department.id",
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

function deleteRole() { //Asks for role from list and removes role from role table
  let currentRoles = "";
  db.query("SELECT title, id FROM role;", function (err, result) {
    if (err) {
    }
    currentRoles = result.map((role) => ({
      name: role.title,
      value: { id: role.id, name: role.title },
    }));
    inquirer.prompt([
      {
        type: "list",
        message: "Which role do you want to delete?",
        name: "role",
        choices: currentRoles,
      },
    ]).then((roleData) => {
      let roleTitle = roleData.role.title;
      let roleId = roleData.role.id;
      db.query("DELETE FROM role WHERE id = ?", roleId, function(err, result){
        if(err){
          console.log(err);
        }
        console.log("Deleted " + roleTitle + " from role table.");
        mainMenu();
      });
    });
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

function deleteDepartment(){ //Asks for department from list and removes derpartment from derpartment table
  let currentDepartments = "";
  db.query("SELECT name, id FROM department;", function (err, result) {
    if (err) {
    }
    currentDepartments = result.map((department) => ({
      name: department.name,
      value: { id: department.id, name: department.name },
    }));
    inquirer.prompt([
      {
        type: "list",
        message: "Which department do you want to delete?",
        name: "department",
        choices: currentDepartments,
      },
    ]).then((depData) => {
      let depName = depData.department.name;
      let depId = depData.department.id;
      db.query("DELETE FROM department WHERE id = ?", depId, function(err, result){
        if(err){
          console.log(err);
        }
        console.log("Deleted " + depName + " from department table.");
        mainMenu();
      });
    });
  });
}

//Starts the inquirer loop
mainMenu();
