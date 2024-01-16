# Chat Application - Chatterbox

A web application written in React and Node where users can chat about things by creating posts and commenting on them.

## System Requirements

### Your system must meet the following minimum requirements to run the application:
* 4GB of RAM
* 2 CPU Cores
* 10GB of Disk Space

## Prerequisites

### You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [MySQL](http://www.mysql.com/)
* [OpenSSL](https://www.openssl.org/)
* [Chocolatey](https://chocolatey.org/) (if using Windows to install OpenSSL)

### Installing OpenSSL

#### **Windows**

An easy way to install OpenSSL on windows is to install Chocolatey and use it to install OpenSSL. Following the [Chocolatey Installation Process](https://chocolatey.org/install) and running the command
```cmd
choco install openssl
```

#### **Linux**

Most Linux distributions come pre-bundled with OpenSSL. You can use the following command to check if has been installed.
```bash
openssl
```

If it isn't installed, follow the installation process for your distribution.

## Installation

Clone this repository
```bash
git clone https://github.com/D-Mansuclal/Chat-Application.git
```

Install Node dependencies
```bash
npm install ./forum-backend && npm install ./forum-frontend
```

## Application Setup

To run the application, databases need to be created and linked for data to persist in the application. Environment variables need to be created to tune the application for individual use.

To begin setting up the application, you must be at the root of the repository.

### MySQL Database Setup

The application requires a minimum of 3 databases, one for production, one for development and one for testing.

You can create these databases by following [MySQL's documentation on creating databases](https://dev.mysql.com/doc/refman/8.0/en/creating-database.html).

The environment requires the MySQL connection details for the application to connect the the database.
These variables should be stored in `/chat-backend/.env`

You can create these with the command:

#### **Windows**
```cmd
type nul > /chat-backend/.env
```

#### **Linux**
```bash
touch /chat-backend/.env
```

Due to the test suites running in parallel in the backend, the application can use 4 test databases to run test cases. See [the notes on backend testing](#backend-testing) for an explanation.

### Environment Variables

These variables are used to change the application's behaviour to suit the user's need.

```
# Node Environment Type
# The type of environment the application should run in: production, development or test
# These usually get set automatically when starting the application
NODE_ENV=development

# Client URL
# URL to the frontend (localhost:3000 when using React)
CLIENT_URL=http://localhost:3000

# Auth Secret Tokens
# Variables to tune JWT authentication
JWT_SECRET=<JWT Secret (can be any string but should be treated as a password)>
JWT_EXPIRATION=15m     # 15 minutes
REFRESH_TOKEN_EXPIRATION=30     # 30 days

# SMTP
# Variables for the email service being used in the application. I used outlook for the application.
EMAIL_HOST=<email hostname> | smtp-mail.outlook.com
EMAIL_PORT=<email port number> | 587
EMAIL_ADDRESS=<email address>
EMAIL_PASSWORD=<email password>

# Toggle switch for emails. Set to 0 if you do not want emails to be send.
# Testing automatically sets this to 0 to avoid spam.
TOGGLE_EMAILS=1

# Application Ports
# Ports used for the application. If any port clashes with another process, switch the server to a different port.
PROD_SERVER_PORT=8443
DEV_SERVER_PORT=8000
TEST_SERVER_PORT=8888

# Production Database
# The connection to the production database (usually localhost:3306 if running on a local machine)
PROD_DB_HOST=<database host> | localhost
PROD_DB_PORT=<database port number> | 3306
PROD_DB_SCHEMA=<name of the production database>
PROD_DB_USERNAME=<database username>
PROD_DB_PASSWORD=<database password>

# Development Database
# The connection to the development database (usually localhost:3306 if running on a local machine)
DEV_DB_HOST=<database host> | localhost
DEV_DB_PORT=<database port number> | 3306
DEV_DB_SCHEMA=<name of the development database>
DEV_DB_USERNAME=<database username>
DEV_DB_PASSWORD=<database password>

# Testing Database
The connection to the test database (usually localhost:3306 if running on a local machine)
TEST_DB_HOST=<database host> | localhost
TEST_DB_PORT=<database port number> | 3306
TEST_DB_SCHEMA=<name of the testing database>
TEST_DB_USERNAME=<database username>
TEST_DB_PASSWORD=<database password>
```

You can use the [official Nodemailer documentation](https://nodemailer.com/smtp/) to setup SMTP transports within the application.

Since the application uses [TypeORM](https://typeorm.io/) as an Object Relational Mapper, it may be possible to use a different Relation Database Management System (RDBMS) for the application. However, the application was only tested using MySQL, so there may be issues. You can check the connection status to find the variables required in the environment by following [this](https://stackoverflow.com/a/8155601).

### Self-Signed Certificates

A self-signed certificate enables the application to deliver content over HTTPS to keep data secure during transmission. For the application to work, a certificate must be generated for communications to occur over HTTPS.

First, a new directory must be created in the backend to store the certificate. Use the command below to create a directory at the required location.

```bash
mkdir /chat-backend/https
```

To generate a SSL/TLS certificate, you can use the following command:

```bash
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout /chat-backend/https/server.key -out /chat-backend/https/server.crt -subj "/CN=example.com" -addext "subjectAltName=DNS:example.com,DNS:*.example.com,IP:127.0.0.1"
```

This would generate the certificate in the correct location, and allow the application to use it to encrypt HTTP traffic.

## Running / Development

To run these commands, you need to be at the root of the repository.

### Start the production build of the application (requires [building](#build-the-frontend-and-backend) first)

```bash
npm run start
```

### Start the production build of the backend (requires [building](#build-the-frontend-and-backend) first)

```bash
npm run start:backend
```

### Start the frontend

```bash
npm run start:frontend
```

### Build the frontend and backend

```bash
npm run build
```

### Build the backend

```bash
npm run build:backend
```

### Build the frontend

```bash
npm run build:frontend
```

### Start the development build of the application

```bash
npm run dev
```

### Start the development build of the application

```bash
npm run dev:backend
```

### Test the backend

```
npm run test:backend
```

## Notes

### Backend Testing

The test cases in the backend use Jest to run in parallel so tests are done quickly. Therefore creating creating multiple testing databases is encouraged to lower the time spent running all the test cases. To make use of this, you must create databases that the application can access.

The name of the testing databases should be suffixed with _x. Where x is the index of the database. For example, if the name of the test database unsuffixed is `chat_test`
the names of the suffixed database should be `chat_test_1`, `chat_test_2`, `chat_test_3` and `chat_test_4`.