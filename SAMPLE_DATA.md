# Sample Data for Testing

## Sample Products

```json
[
  {
    "id": "prod_001",
    "name": "Basic Service",
    "price": 500,
    "description": "Get started with our basic service package. Includes essential features and support.",
    "image": "https://via.placeholder.com/300x300?text=Basic+Service&bg=10b981&fg=fff",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  {
    "id": "prod_002",
    "name": "Professional Package",
    "price": 2500,
    "description": "Our most popular package. Full features with priority support included.",
    "image": "https://via.placeholder.com/300x300?text=Professional&bg=059669&fg=fff",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  {
    "id": "prod_003",
    "name": "Enterprise Solution",
    "price": 10000,
    "description": "Complete enterprise solution with dedicated support and custom integration.",
    "image": "https://via.placeholder.com/300x300?text=Enterprise&bg=10b981&fg=fff",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  {
    "id": "prod_004",
    "name": "Premium Support",
    "price": 1500,
    "description": "24/7 priority support for all your needs. Email, phone, and chat support.",
    "image": "https://via.placeholder.com/300x300?text=Support&bg=6ee7b7&fg=1f2937",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  {
    "id": "prod_005",
    "name": "Consultation Services",
    "price": 3000,
    "description": "One-on-one consultation with our expert team. 2-hour session included.",
    "image": "https://via.placeholder.com/300x300?text=Consultation&bg=d1fae5&fg=059669",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

## Sample Transactions

```json
[
  {
    "id": "ws_co_2024010112345600001",
    "phone": "254712345678",
    "amount": 2500,
    "resultCode": 0,
    "resultDesc": "The service was successful",
    "mpesaCode": "QRF7J7N8X0",
    "timestamp": "2024-01-01 10:30:45",
    "status": "SUCCESS",
    "items": ["Professional Package"]
  },
  {
    "id": "ws_co_2024010112345600002",
    "phone": "254723456789",
    "amount": 500,
    "resultCode": 0,
    "resultDesc": "The service was successful",
    "mpesaCode": "PPS8K2L9Y1",
    "timestamp": "2024-01-01 11:15:20",
    "status": "SUCCESS",
    "items": ["Basic Service"]
  },
  {
    "id": "ws_co_2024010112345600003",
    "phone": "254734567890",
    "amount": 1500,
    "resultCode": 1032,
    "resultDesc": "Request cancelled by user",
    "mpesaCode": "",
    "timestamp": "2024-01-01 12:00:10",
    "status": "FAILED",
    "items": ["Premium Support"]
  },
  {
    "id": "ws_co_2024010112345600004",
    "phone": "254745678901",
    "amount": 10000,
    "resultCode": 0,
    "resultDesc": "The service was successful",
    "mpesaCode": "RKT9L2M3Z4",
    "timestamp": "2024-01-01 14:45:30",
    "status": "SUCCESS",
    "items": ["Enterprise Solution"]
  },
  {
    "id": "ws_co_2024010112345600005",
    "phone": "254756789012",
    "amount": 3000,
    "resultCode": 0,
    "resultDesc": "The service was successful",
    "mpesaCode": "TUV5N6O7P8",
    "timestamp": "2024-01-01 16:20:15",
    "status": "SUCCESS",
    "items": ["Consultation Services"]
  },
  {
    "id": "ws_co_2024010112345600006",
    "phone": "254767890123",
    "amount": 2500,
    "resultCode": 0,
    "resultDesc": "The service was successful",
    "mpesaCode": "QWE1R2T3Y4",
    "timestamp": "2024-01-02 09:30:00",
    "status": "SUCCESS",
    "items": ["Professional Package"]
  }
]
```

## Testing Scenarios

### Scenario 1: Successful Payment
**Phone:** 0712345678
**Amount:** 2500
**Expected:** STK prompt appears, payment successful

### Scenario 2: User Cancels
**Phone:** 0723456789
**Amount:** 1500
**Expected:** Payment failed, user cancelled

### Scenario 3: Invalid Phone
**Phone:** 123
**Expected:** Validation error

### Scenario 4: Zero Amount
**Amount:** 0
**Expected:** Amount validation error

## Test Products to Add

1. **Name:** Quick Start Kit
   **Price:** 1000
   **Description:** Everything you need to get started in one affordable package
   **Image:** https://via.placeholder.com/300x300?text=Quick+Start&bg=10b981

2. **Name:** Analytics Dashboard
   **Price:** 5000
   **Description:** Real-time analytics and reporting tools for your business
   **Image:** https://via.placeholder.com/300x300?text=Analytics&bg=059669

3. **Name:** API Access
   **Price:** 7500
   **Description:** Full REST API access with documentation and support
   **Image:** https://via.placeholder.com/300x300?text=API&bg=6ee7b7

## How to Import Sample Data

### Option 1: Manual Entry
1. Go to Products tab in admin dashboard
2. Add each product one by one
3. Fill in name, price, description
4. Use placeholder images from URLs above

### Option 2: Direct Database
1. Create `data/products.json` with sample products
2. Create `data/transactions.json` with sample transactions
3. Restart server

### Option 3: API Calls
```bash
# Add product via cURL
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "price": 1000,
    "description": "Description",
    "image": "image_url"
  }'
```

## Performance Testing

### Load Test Transactions
Run this to generate test data:

```javascript
// Run in browser console
const apiUrl = 'http://localhost:5000/api';

for (let i = 0; i < 100; i++) {
  const phone = `254${7}${Math.floor(Math.random() * 10000000)}`;
  const amount = Math.floor(Math.random() * 9000) + 1000;
  
  fetch(`${apiUrl}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, amount })
  });
}
```

## Dashboard Metrics Calculation

**Total Transactions:** Sum of all records
**Today:** Count of records where date = today
**Today Amount:** Sum of amounts where date = today
**Monthly Amount:** Sum of amounts in current month
**Success Rate:** (Successful / Total) × 100

## Report Testing

Generate reports for different periods:
- **Day:** Today's transactions
- **Week:** Mon-Sun of current week
- **Month:** All of current month
- **Year:** All of current year

## Screenshots for Documentation

Key areas to capture:
1. Login screen
2. Dashboard overview
3. Shop tab with products
4. Transactions table
5. Product management
6. Payment modal
7. Report downloads
