# 🎂 CakeHub — Artisanal Bakery E-Commerce & Kitchen Operations Platform

**CakeHub** is a full-stack e-commerce web application built for a 100% eggless artisanal bakery operating across Delhi NCR. It provides customers with a smooth cake customization and ordering experience while giving bakers and administrators a live kitchen fulfillment and inventory management dashboard.

---

## ✨ Key Features

### 🛍️ Customer Storefront & Ordering
* **Smart Catalog & Filtering:** Browse cakes by category, flavour, occasion, search keyword, and 100% pure-veg/eggless status.
* **Rich Cake Customization:** Select weight variants (`0.5 kg`, `0.75 kg`, `1.0 kg`), add custom cake inscriptions, upload edible sugar-print photos, and pick complimentary party add-ons (sparkle candles, cake knife, greeting card).
* **Real-Time Cake Box (Cart Drawer):** Slide-over cart drawer with live quantity updates, customization badges, and instant price recalculation.
* **Seamless Checkout & Coupons:** Save multiple delivery addresses, validate promotional discount codes (`FIRST100`, etc.), choose daytime delivery slots, and select payment modes (`COD`, `UPI`, `CARD`).
* **Order Tracking & Cancellation:** View order history with clean customization tags, real-time kitchen status updates, and self-service order cancellation before delivery.

### 👨‍🍳 Baker & Admin Operations Dashboard
* **Live Kitchen Order Board:** View incoming customer orders with full delivery addresses, clickable customer phone numbers, delivery instructions, cake messages, and direct links to view/print uploaded edible cake photos.
* **Real-Time Fulfillment Workflow:** Progress orders across kitchen stages (`CONFIRMED` → `BAKING_IN_PROGRESS` → `DECORATING` → `READY_FOR_PICKUP` → `OUT_FOR_DELIVERY` → `DELIVERED`).
* **Catalog & Stock Management (Admin):** Create/edit categories, add or update cakes, manage weight variants, and monitor live stock levels.

### 🔐 Security & Architecture
* **Stateless JWT Authentication:** Role-Based Access Control (`ROLE_CUSTOMER`, `ROLE_BAKER`, `ROLE_ADMIN`) powered by Spring Security and Axios request interceptors.
* **Immutable Order Snapshots:** Product names, weights, prices, and customizations are snapshotted at checkout so historical orders remain accurate.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, React Router, Tailwind CSS, Zustand, Axios, Lucide Icons |
| **Backend** | Java, Spring Boot, Spring Security (JWT), Spring Data JPA, Hibernate |
| **Mapping & Validation** | MapStruct, Lombok, Jakarta Bean Validation |
| **Database** | MySQL |

---

## 📁 Project Structure

    cakehub/
    ├── backend/                     # Spring Boot REST API
    │   └── src/main/java/com/cakehub/
    │       ├── config/              # CORS, WebMvc & static resource configuration
    │       ├── security/            # JWT filter, token provider & Spring Security rules
    │       ├── controller/          # Versioned REST controllers (/api/v1/*)
    │       ├── dto/                 # Validated Request & Response DTOs
    │       ├── entity/              # JPA entities & Order/Payment status enums
    │       ├── mapper/              # MapStruct entity-to-DTO mappers
    │       ├── repository/          # Spring Data JPA repositories
    │       └── service/             # Transactional business logic
    │
    └── frontend/                    # React + Vite SPA
        └── src/
            ├── api/                 # Axios client with JWT interceptor
            ├── components/          # Navbar, CartDrawer, Footer
            ├── pages/               # Storefront, ProductDetail, Checkout, Orders, AdminDashboard, Auth
            └── store/               # Zustand global stores (authStore, cartStore)

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
* **Java 17+** & **Maven**
* **Node.js 18+** & **npm**
* **MySQL 8.0+**

### 1. Backend Setup (Spring Boot)
1. Create a MySQL database and update `src/main/resources/application.properties`:

       spring.datasource.url=jdbc:mysql://localhost:3306/cakehub_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
       spring.datasource.username=YOUR_MYSQL_USERNAME
       spring.datasource.password=YOUR_MYSQL_PASSWORD
       spring.jpa.hibernate.ddl-auto=update

2. Build and run the Spring Boot server:

       mvn clean install
       mvn spring-boot:run

   The backend API will start at `http://localhost:8080`.

### 2. Frontend Setup (React)
1. Navigate to the frontend directory and install dependencies:

       npm install

2. Start the Vite development server:

       npm run dev

   Open `http://localhost:5173` in your browser.

---

## 🔌 Core API Endpoints (`/api/v1`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` & `/auth/login` | Public | User registration and JWT login |
| `GET` | `/products` & `/products/{slug}` | Public | Browse/filter cakes and view variant details |
| `POST` | `/uploads/cake-photo` | Authenticated | Upload custom photo for edible sugar print |
| `GET` / `POST` | `/cart` & `/cart/items` | Authenticated | Fetch cart and add customized cake variants |
| `GET` / `POST` | `/addresses` | Authenticated | Manage customer delivery addresses |
| `POST` | `/coupons/validate` | Authenticated | Validate promo code and calculate discount |
| `POST` | `/orders/checkout` | Authenticated | Place order with GST, delivery fee & stock deduction |
| `GET` | `/orders/my-orders` | Authenticated | Fetch customer order history |
| `GET` / `PATCH` | `/orders/admin/all` & `/orders/admin/{id}/status` | `BAKER`, `ADMIN` | View all orders with delivery details & update kitchen status |

---

## 👤 Author

**Mohd Aamir**  
GitHub: [@aamir-cse](https://github.com/aamir-cse)
