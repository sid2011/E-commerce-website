# 🛒 E-Commerce Website

A full-stack e-commerce web application built using **Node.js**, **Express.js**, **MongoDB**, and **Handlebars**.

This project was created to learn and practice full-stack web development concepts including authentication, session management, MongoDB aggregation, payment gateway integration, and backend architecture.

---

# ✨ Features

## 👤 User Features

* User Signup & Login
* Secure password hashing using bcrypt
* Session-based authentication
* View products
* Add products to cart
* Remove products from cart
* Dynamic cart item count
* Place orders
* Razorpay online payment integration
* Payment verification using HMAC SHA256
* Order success page

---

## 🛠️ Admin Features

* Admin Login
* Add products
* Edit products
* Delete products
* Upload product images
* Product management dashboard
* Inventory management

---

# 🚀 Tech Stack

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Authentication & Security

* bcrypt
* express-session
* HMAC SHA256 Payment Verification

## Frontend

* Handlebars (HBS)
* HTML
* CSS
* Bootstrap
* JavaScript
* jQuery (AJAX)

## Other Packages

* express-fileupload
* morgan
* cookie-parser
* dotenv
* Razorpay

---

# 📂 Project Structure

```text
config/      -> Database connection & collection configuration
helpers/     -> Business logic & database operations
routes/      -> User & Admin routes
views/       -> Handlebars templates
public/      -> CSS, JavaScript, Images
bin/         -> Server startup files
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone <repository-url>
cd e-commerce-website
```

---

## Install Dependencies

```bash
npm install
```

---

## Create `.env` File

```env
MONGODB_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

---

## Run in Development Mode

```bash
npm run dev
```

---

## Run in Production

```bash
npm start
```

---

# 🗄️ Database Collections

## Users

Stores:

* User details
* Authentication information

---

## Products

Stores:

* Product name
* Category
* Price
* Description
* Product image

---

## Cart

Stores:

* User cart items
* Product quantities

---

## Orders

Stores:

* Ordered products
* Delivery address
* Payment method
* Order status
* Total amount

---

# ✅ Completed Features

* User Authentication
* Admin Authentication
* Session Management
* Product CRUD Operations
* Product Image Upload
* Shopping Cart System
* AJAX-based Add to Cart
* MongoDB Aggregation Pipelines
* Razorpay Payment Integration
* Payment Verification using HMAC SHA256
* Order Placement System
* Order Management
* Cart Total Calculation
* Responsive UI

---

# 🔨 Future Improvements

* User Profile Management
* Product Search & Filtering
* Wishlist
* Email Notifications
* Invoice Generation
* Product Reviews & Ratings
* Dashboard Analytics

---

# 🤝 Contributing

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 📝 Notes

* Keep database operations inside helper files.
* Follow the existing project structure.
* Test changes before pushing.
* Never commit `.env` files or credentials.
* Store sensitive keys using environment variables.

---

# 👨‍💻 Author

## Sidharth

Built to practice and improve:

* Full-stack development
* Backend architecture
* MongoDB aggregation
* Authentication systems
* Payment gateway integration
* Debugging & problem-solving
* Real-world project development
