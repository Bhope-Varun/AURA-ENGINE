# Inventory Management & Analytics System

A full-stack inventory management application built with **React, Node.js, Express.js, and MongoDB**, designed to efficiently handle **50,000+ products** with server-side search, pagination, filtering, analytics, and validation.

## 🚀 Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Validation:** Zod
* **Seeding:** Faker.js
* **Testing:** Postman
* **Deployment:** Vercel / Render / MongoDB Atlas

## 📁 Project Structure

```text
inventory-management/
├── client/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── services/
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── scripts/
│   └── server.js
├── Prompts.md
└── README.md
```

## 🗄️ Product Schema

```text
productName
sku
category
price
cost
stockQuantity
reorderLevel
lastUpdated
```

Indexes are created on:

```text
sku
category
productName
```

## 🌱 Database Seeding

Generates and inserts **50,000 realistic products** using Faker.js.

```bash
npm run seed
```

## 🔌 API Endpoints

### Inventory

```http
GET /api/inventory
```

Supports:

```text
?page=1&limit=50&search=audio&category=electronics&sort=-price
```

Returns:

```text
data
totalRecords
totalPages
currentPage
hasNextPage
```

### Analytics

```http
GET /api/analytics
```

Uses MongoDB aggregation with:

```text
$match
$group
$project
```

to calculate category-wise inventory valuation using:

```text
price × stockQuantity
```

### Create Product

```http
POST /api/inventory
```

### Update Product

```http
PUT /api/inventory/:id
```

## 🛡️ Validation

Zod middleware enforces:

* `price >= cost`
* `stockQuantity >= 0`

Invalid requests return:

```http
400 Bad Request
```

with a specific validation message.

## ⚡ Performance

The application uses:

* Server-side pagination
* Indexed database queries
* Server-side search/filtering
* MongoDB aggregation
* Limited API response sizes

Only the requested records are sent to the frontend instead of loading all 50,000 products.

## 🧪 Postman Testing

Example:

```http
GET /api/inventory?search=laptop&limit=5
```

Analytics:

```http
GET /api/analytics
```

Validation and API response times can be verified using Postman.

## 📊 Frontend Features

* Inventory table
* Search
* Category filtering
* Sorting
* Pagination
* CSV export
* Interactive analytics charts

## 🔐 Environment Variables

Create `.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

Never commit `.env` to GitHub.

## ▶️ Run Locally

### Backend

```bash
cd server
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 📦 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

Configure production environment variables on the deployment platform.

## 🤖 AI Transparency

AI-assisted development is documented in:

```text
Prompts.md
```

## 🎥 Demo

The 3–5 minute demo covers:

* Inventory pagination
* Network requests
* Search/filtering
* CSV export
* Analytics charts
* Postman API testing
* Server-side aggregation performance

## 👨‍💻 Author

**Varun Bhope**
Full Stack Developer
