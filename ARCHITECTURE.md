# 🎨 GeoPram Payment System - Visual Guide & Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│                   (Beautiful Green UI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │   Dashboard  │  │   Reports    │     │
│  │   Screen     │  │   (Stats)    │  │   Download   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Shop       │  │  Transactions│  │   Products   │     │
│  │  (Products)  │  │   (History)  │  │  (Manage)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                            │
│               (Node.js Backend on Port 5000)               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              API Routes & Middleware                 │ │
│  │  ✓ Authentication (JWT)                              │ │
│  │  ✓ CORS, File Upload, JSON Parsing                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Payment    │  │   Products   │  │  Dashboard   │    │
│  │   Routes     │  │   Routes     │  │   Routes     │    │
│  │ /api/pay     │  │ /api/products│  │ /api/stats   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Transaction  │  │   Admin      │  │   Reports    │    │
│  │   Routes     │  │   Routes     │  │   Routes     │    │
│  │ /api/callback│  │ /api/admin/* │  │ /api/download│   │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└──────────────┬──────────────────────────────────────────────┘
               │
     ┌─────────┴──────────┬──────────────────┐
     │                    │                  │
     ▼                    ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
│   M-PESA     │  │  FILE SYSTEM │  │   SAFARICOM     │
│   Sandbox    │  │  (JSON Data) │  │   Gateway       │
│              │  │              │  │                 │
│ • STK Push   │  │ • transactions│  │ • Authenticate │
│ • Callbacks  │  │ • products    │  │ • OAuth Token   │
│ • Verification   │ • uploads    │  │ • Process STK   │
└──────────────┘  └──────────────┘  └─────────────────┘
```

## User Flow Diagram

```
┌─────────────────┐
│   User Visits   │
│   Website       │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │   Logged   │────No────┐
    │    In?     │          │
    └────┬───────┘          │
         │Yes               │
         │                  ▼
         │          ┌─────────────────┐
         │          │  Admin Login    │
         │          │  Screen         │
         │          │  (Green Theme)  │
         │          └────────┬────────┘
         │                   │
         │                   ▼
         │          ┌─────────────────┐
         │          │  Enter Email &  │
         │          │  Password       │
         │          └────────┬────────┘
         │                   │
         │        ┌──────────┴──────────┐
         │        │                     │
         │    ┌───▼───┐           ┌────▼────┐
         │    │Valid? │─No────────│  Error  │
         │    └───┬───┘           │ Message │
         │        │Yes            └─────────┘
         │        │
         └───────┬┘
                 │
                 ▼
        ┌─────────────────────┐
        │   DASHBOARD         │
        │   (Main Page)       │
        ├─────────────────────┤
        │ ✓ Stats Overview    │
        │ ✓ 4 Tabs: Shop,     │
        │   Transactions,     │
        │   Products, Reports │
        └────────┬────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐        ┌──────────┐
    │  Shop  │        │Products  │
    │ Tab    │        │Tab       │
    └────┬───┘        └────┬─────┘
         │                 │
         ▼                 ▼
    ┌────────────┐   ┌──────────────┐
    │View Product│   │Add New       │
    │Cards       │   │Product       │
    └────┬───────┘   ├──────────────┤
         │           │• Name        │
         │           │• Price       │
         ▼           │• Description │
    ┌────────────┐   │• Image       │
    │Buy Now     │   └──────┬───────┘
    │Button      │          │
    └────┬───────┘          ▼
         │          ┌───────────────┐
         │          │Upload Image   │
         │          │From:          │
         │          │• Local File   │
         │          │• GitHub URL   │
         │          └───────┬───────┘
         │                  │
         │                  ▼
         │          ┌───────────────┐
         │          │Click Save     │
         │          └───────┬───────┘
         │                  │
         └──────────┬───────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │ PAYMENT MODAL OPENS     │
        ├─────────────────────────┤
        │ 📱 Enter Phone Number   │
        │ 💰 Amount Display       │
        │ 🔘 Send STK Push        │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ STK Push Request        │
        │ Sent to M-Pesa         │
        └────────────┬───────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │ Success      │   │ Failure      │
    │ ✓ Payment    │   │ ✗ Error      │
    │   Prompt on  │   │   Message    │
    │   Phone      │   │   Shown      │
    └────────┬─────┘   └──────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Transaction          │
    │ Recorded in System   │
    ├──────────────────────┤
    │ ✓ ID                 │
    │ ✓ Phone              │
    │ ✓ Amount             │
    │ ✓ M-Pesa Code        │
    │ ✓ Status             │
    │ ✓ Timestamp          │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ View in:             │
    │ • Transactions Tab   │
    │ • Reports Downloads  │
    │ • Dashboard Stats    │
    └──────────────────────┘
```

## Color Palette

```
Primary Green:      #10b981  ███████████  Main brand color
Dark Green:         #059669  ███████████  Hover states
Light Green:        #d1fae5  ███████████  Backgrounds
Accent Green:       #6ee7b7  ███████████  Highlights
Text Dark:          #1f2937  ███████████  Body text
Background Light:   #f3faf8  ███████████  Page background
White:              #ffffff  ███████████  Cards & surfaces
```

## Component Layout

### Login Page
```
┌──────────────────────────────────┐
│                                  │
│   ┌──────────────────────────┐   │
│   │  🌿 GeoPram             │   │
│   │  Payment System          │   │
│   │                          │   │
│   │  ┌────────────────────┐  │   │
│   │  │ Email              │  │   │
│   │  └────────────────────┘  │   │
│   │                          │   │
│   │  ┌────────────────────┐  │   │
│   │  │ Password           │  │   │
│   │  └────────────────────┘  │   │
│   │                          │   │
│   │  ┌────────────────────┐  │   │
│   │  │  🔐 Login          │  │   │
│   │  └────────────────────┘  │   │
│   │                          │   │
│   │  Demo Credentials:       │   │
│   │  Email: geopram...@... │   │
│   │  Pass: GeoPramTech...   │   │
│   │                          │   │
│   └──────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
```

### Dashboard - Stats Section
```
┌────────────────────────────────────────────────────────────┐
│                    STATS OVERVIEW                          │
├─────────────────┬──────────────┬───────────┬──────────────┤
│  📊 Total       │ 🌞 Today     │ 📅 Month  │ 📈 Success   │
│  Transactions   │              │           │  Rate        │
│                 │              │           │              │
│  1,247          │ 23           │ KES       │ 94.3%        │
│                 │              │ 567,890   │              │
└─────────────────┴──────────────┴───────────┴──────────────┘
```

### Dashboard - Navigation Tabs
```
┌─────────────────────────────────────────────────────────┐
│ 🛍️ Shop  |  📜 Transactions  |  📦 Products  |  📥 Reports│
└─────────────────────────────────────────────────────────┘
```

### Product Card
```
┌──────────────────────────┐
│                          │
│    ┌────────────────┐   │
│    │                │   │
│    │   🖼️ Image     │   │
│    │  (from URL or  │   │
│    │   uploaded)    │   │
│    │                │   │
│    └────────────────┘   │
│                          │
│  💎 Product Name        │
│                          │
│  KES 5,000              │
│                          │
│  Professional package... │
│  Full features with...  │
│                          │
│  ┌────────────────────┐ │
│  │ 🛒 Buy Now         │ │
│  └────────────────────┘ │
│                          │
└──────────────────────────┘
```

### Payment Modal
```
┌──────────────────────────────┐
│  📱 Payment Request          │
│  Enter your M-Pesa details   │
├──────────────────────────────┤
│                              │
│  Phone Number                │
│  ┌──────────────────────────┐│
│  │ 0712345678              ││
│  └──────────────────────────┘│
│                              │
│       KES 2,500              │
│   (Professional Package)     │
│                              │
│  ┌──────────────────────────┐│
│  │ 📱 Send STK Push         ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ Close                    ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Transaction Table
```
┌─────────────────────────────────────────────────────────────────┐
│ Transaction ID | Phone    | Amount   | Status | M-Pesa | Time  │
├─────────────────────────────────────────────────────────────────┤
│ ws_co_1234...  │ 254712.. │ KES 2500 │ ✓ OK   │ ABC123 │ 10:30 │
│ ws_co_5678...  │ 254723.. │ KES 500  │ ✓ OK   │ PPS8K2 │ 11:15 │
│ ws_co_9012...  │ 254734.. │ KES 1500 │ ✗ FAIL │ -      │ 12:00 │
│ ws_co_3456...  │ 254745.. │ KES 10000│ ✓ OK   │ RKT9L2 │ 14:45 │
└─────────────────────────────────────────────────────────────────┘
```

## File Size Breakdown

```
Total Project Size: ~50 KB

├── Backend Code
│   ├── server.js               ~15 KB
│   ├── api/stk_push.js        ~4 KB
│   └── api/callback.js        ~2 KB
│
├── Frontend Code
│   └── public/index.html      ~25 KB
│
├── Configuration
│   ├── package.json           ~1 KB
│   ├── .env                   ~0.5 KB
│   ├── vercel.json            ~0.5 KB
│   └── .gitignore             ~0.2 KB
│
└── Documentation
    ├── README.md              ~8 KB
    ├── QUICKSTART.md          ~5 KB
    └── SAMPLE_DATA.md         ~3 KB
```

## Loading Performance

```
Page Load Timeline:
0ms     ────────── Page Start
100ms   ─────┐ HTML Parse
200ms   ─────┤ CSS Load
300ms   ─────┤ JS Load & Parse
400ms   ─────┤ API Calls
500ms   ─────┤ Dashboard Render
600ms   ┐──── Fully Interactive
        └──── Time to Interactive: ~600ms
```

## Mobile Responsive Breakpoints

```
Desktop:     >= 1024px   (Full layout)
Tablet:      768-1023px  (2-column grid)
Mobile:      < 768px     (1-column layout)

Product Grid:
Desktop:  4 columns
Tablet:   2 columns
Mobile:   1 column
```

## Deployment Timeline

```
Step 1: Setup (5 min)
├── Install Node.js
├── npm install
└── Create .env

Step 2: Configuration (5 min)
├── Set M-Pesa credentials
├── Configure JWT secret
└── Set admin credentials

Step 3: Testing (10 min)
├── Run locally
├── Test login
├── Test payments
└── Test reports

Step 4: Deployment (5 min)
├── Deploy to Vercel/Heroku
├── Set environment variables
└── Configure callback URL

Total Time: ~25 minutes
```

## Security Architecture

```
┌─────────────────┐
│   Client        │ ← HTTPS Only
└────────┬────────┘
         │
         │ JWT Token (localStorage)
         │
┌────────▼────────────────────┐
│  Express Server             │
├─────────────────────────────┤
│ ✓ CORS Validation           │
│ ✓ Token Verification        │
│ ✓ Input Validation          │
│ ✓ Rate Limiting (future)    │
└────────┬────────────────────┘
         │
┌────────▼──────────────────────┐
│  Environment Variables         │
├────────────────────────────────┤
│ ✓ M-Pesa Keys (hidden)         │
│ ✓ Admin Credentials (hashed)   │
│ ✓ JWT Secret                   │
│ ✓ Database URL (future)        │
└────────┬──────────────────────┘
         │
┌────────▼──────────────────────┐
│  External Services            │
├────────────────────────────────┤
│ ✓ Safaricom M-Pesa (OAuth)     │
│ ✓ Database/File Storage        │
│ ✓ Callback Handler             │
└───────────────────────────────┘
```

## Browser Compatibility

```
✅ Chrome      90+
✅ Firefox     88+
✅ Safari      14+
✅ Edge        90+
✅ Mobile      iOS Safari 14+, Chrome Android 90+
⚠️  IE 11      Not Supported (Legacy)
```

---

**Design Philosophy:** Simple, Green, and Powerful! 🌿💚
