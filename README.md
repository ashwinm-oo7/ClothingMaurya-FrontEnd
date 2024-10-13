# Maurya.in E-Commerce Project

Welcome to the Maurya.in E-Commerce Project repository! This project is built using React.js for the frontend.

## Description

This project aims to create an e-commerce platform specialized in selling clothing and related services. It provides functionalities for both customers and vendors to browse products, make purchases, and manage accounts. Additionally, the platform offers instant service for customers based on their live location.

## Features

### User Authentication

- **Sign Up and Login**: Customers and vendors can register and log in to their accounts securely.

### Product Management

- **Add, Edit, and Delete Products**: Vendors can manage their product inventory by adding new products, editing existing ones, and deleting outdated ones.

### Live Location Service

- **Instant Service**: Customers can access instant services such as puncture repair based on their live location.

### Admin Panel

- **Puncture Repair List**: Admin users have access to a specific feature to view the puncture repair list.

## Installation

To run this project locally, follow these steps:

1. Clone the repository: `git clone <repository_url>`
2. Navigate to the project directory: `cd <project_directory>`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open [http://localhost:3000](http://localhost:3000) in your web browser.

## Project Structure

The project structure is organized as follows:

- `src/`: Contains the source code for the React application.
  - `components/`: Contains React components for different pages and UI elements.
  - `icons/`: Contains icon images used in the application.
  - `css/`: Contains CSS files for styling the application.
  - `App.js`: Main component rendering the application routes.
- `public/`: Contains static assets and the `index.html` file.



- `src/`: Contains the source code for the React application.
  - `components/`: Contains React components for different pages and UI elements.
    - `Login.js`
    - `SignUp.js`
    - `Home.js`
    - `HomePage.js`
    - `About.js`
    - `Categories.js`
    - `Subcategories.js`
    - `CategoryList.js`
    - `ProductCreation.js`
    - `AddBrand.js`
    - `AddProduct.js`
    - `ProductList.js`
    - `PunctureRepair.js`
    - `PunctureRepairList.js`
  - `icons/`: Contains icon images used in the application.
  - `css/`: Contains CSS files for styling the application.
  - `App.js`: Main component rendering the application routes.
- `public/`: Contains static assets and the `index.html` file.

## File Documentation

### 1. Login.js
- **Purpose**: Handles user authentication and login functionality.
- **Components**: 
  - `Login`: Renders the login form.
- **Functions**:
  - `handleForgotPassword()`: Displays the forgot password form.
  - `handleSendOTP()`: Sends OTP for password reset.
  - `handleResetPassword()`: Resets user password using OTP.

### 2. SignUp.js
- **Purpose**: Handles user registration and sign-up functionality.
- **Components**: 
  - `SignUp`: Renders the sign-up form.
- **Functions**:
  - `signUp()`: Handles user registration and sends data to the backend API.

### 3. Home.js
- **Purpose**: Renders the home page of the application.
- **Components**: 
  - `Home`: Renders the main content of the home page.

### 4. HomePage.js
- **Purpose**: Renders the homepage of the application.
- **Components**: 
  - `HomePage`: Renders the main content of the homepage.

### 5. About.js
- **Purpose**: Renders the About Us page of the application.
- **Components**: 
  - `About`: Renders the content of the About Us page.

### 6. Categories.js
- **Purpose**: Renders the categories page of the application.
- **Components**: 
  - `Categories`: Renders the list of product categories.

### 7. Subcategories.js
- **Purpose**: Renders the subcategories page of the application.
- **Components**: 
  - `Subcategories`: Renders the list of subcategories for a selected category.

### 8. CategoryList.js
- **Purpose**: Renders the list of products for a selected category.
- **Components**: 
  - `CategoryList`: Renders the list of products based on the selected category.

### 9. ProductCreation.js
- **Purpose**: Allows vendors to create new products.
- **Components**: 
  - `ProductCreation`: Renders a form for vendors to input product details.
- **Functionality**:
  - Access restricted to authenticated vendors.
  - Form validation ensures data integrity.
  - Integration with backend API to save product data.

### 10. AddBrand.js
- **Purpose**: Allows vendors to add new brands.
- **Components**: 
  - `AddBrand`: Renders a form for vendors to add new brands.

### 11. AddProduct.js
- **Purpose**: Allows vendors to add new products.
- **Components**: 
  - `AddProduct`: Renders a form for vendors to add new products.

### 12. ProductList.js
- **Purpose**: Renders the list of products.
- **Components**: 
  - `ProductList`: Renders the list of products available in the store.

### 13. PunctureRepair.js
- **Purpose**: Allows customers to request puncture repair services.
- **Components**: 
  - `PunctureRepair`: Renders a form for customers to request puncture repair services.
- **Functionality**:
  - Captures customer's live location using geolocation API.
  - Sends repair request to the nearest service center.
  - Confirmation message with estimated arrival time.

### 14. PunctureRepairList.js
- **Purpose**: Allows admin users to view the list of puncture repair requests.
- **Components**: 
  - `PunctureRepairList`: Renders the list of puncture repair requests.
- **Functionality**:
  - Access restricted to admin users only.
  - Displays detailed information about each repair request.
  - Admins can track the status of repair requests and take necessary actions.



## Instant Service with Live Location

- **Puncture Repair Service**:
  - Enables customers to request puncture repair services.
  - Captures customer's live location using geolocation API.
  - Sends repair request to the nearest service center.
  - Confirmation message with estimated arrival time.

- **Live Location Tracking**:
  - Provides real-time tracking of service vehicles.
  - Accessible to both customers and service center staff.
  - Service vehicles equipped with GPS trackers.
  - Updates vehicle locations in real-time on the map.
## Product Management by Vendors

- **Product Creation**: 
  - Allows vendors to create new products.
  - Access restricted to authenticated vendors.
  - Form validation ensures data integrity.
  - Integration with backend API to save product data.

- **Edit Product**:
  - Enables vendors to edit existing product details.
  - Access restricted to product owners.
  - Pre-filled form with current product data.
  - Updates product information via backend API.

- **Delete Product**:
  - Allows vendors to remove products from the platform.
  - Access restricted to product owners.
  - Confirmation dialog to prevent accidental deletions.
  - Deletes product from backend database upon confirmation.

## Dependencies

The project uses the following dependencies:

- React: JavaScript library for building user interfaces.
- React Icons: Library providing a set of popular icons as React components.
- React Toastify: Library for toast notifications in React applications.
- Axios: Library for making HTTP requests.
- Other dependencies listed in the `package.json` file.

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run eject`: Ejects from Create React App, providing full control over configuration.

## Technologies Used

- **Backend Technologies**: Node.js 
- **Database**: MongoDB.
- **APIs**: ().


## Additional Features

- **Responsive Design**: The application is designed to be responsive and accessible across various devices and screen sizes.
- **Error Handling**: Errors and exceptions are handled gracefully, with appropriate error messages displayed to users.
- **Validation**: Form validation mechanisms are implemented to ensure data integrity and prevent submission of invalid data.
- **User Roles and Permissions**: Different user roles (e.g., admin, customer, vendor) are implemented with corresponding permissions.


## Future Enhancements

- **Feature Roadmap**: (Describe any planned features or enhancements for future releases).
- **Feedback and Suggestions**: Users and contributors are encouraged to provide feedback and suggestions for improving the project.

## Testing

- **Unit Tests**: Unit tests are implemented using the Jest testing framework. Run `npm test` to execute the tests.
- **Integration Tests**: Integration tests cover the interaction between different components or modules.


## Database Connection

The project uses MongoDB as the database. To connect to the database, a `Database` class is implemented in the `database.js` file. This class provides methods to establish a connection to the MongoDB database and retrieve the database instance.

### Code Snippet

```javascript
const { MongoClient } = require("mongodb");

class Database {
  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(this.uri);
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getDb() {
    if (!this.db) {
      throw new Error("Database connection has not been established.");
    }
    return this.db;
  }
}

const uri = "mongodb+srv://<username>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority";
const dbName = "<dbname>";

const database = new Database(uri, dbName);

// Export a function to connect to the database and return the database instance
async function connectDatabase() {
  await database.connect();
  return database;
}

module.exports = { connectDatabase };


