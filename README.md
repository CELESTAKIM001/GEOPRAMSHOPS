# 🌿 GeoPram Payment System

A modern, beautiful payment dashboard with M-Pesa STK Push integration, admin management, and comprehensive reporting.

## Features

✨ **Admin Dashboard**
- 🔐 Secure login authentication
- 📊 Real-time transaction statistics
- 🛍️ Product management (add, edit, delete)
- 📱 Image upload (local files or GitHub URLs)
- 💳 M-Pesa STK Push payment integration
- 📈 Transaction monitoring and filtering
- 📥 Excel report generation (daily, weekly, monthly, yearly)

🎨 **Beautiful UI**
- 🟢 Vibrant green color theme
- 📱 Fully responsive design
- ⚡ Smooth animations and transitions
- 🎯 Intuitive user experience

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- M-Pesa Sandbox credentials (from Safaricom)

### Setup Steps

1. **Clone/Download the project**
```bash
cd geopram-payment-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# M-Pesa Configuration
CONSUMER_KEY=your_consumer_key_from_safaricom
CONSUMER_SECRET=your_consumer_secret_from_safaricom
SHORTCODE=4574727
PASSKEY=your_passkey_from_safaricom
CALLBACK_URL=https://yourdomain.com/api/callback

# Admin Credentials
ADMIN_EMAIL=geopramtech@gmail.com
ADMIN_PASSWORD=GeoPramTech72222
ADMIN_PHONE=0702781490
VERIFY_EMAIL=celestakim018@gmail.com
ALT_PHONE=0101370035

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

4. **Get M-Pesa Credentials**
   - Go to https://developer.safaricom.co.ke
   - Sign up for a developer account
   - Create a new app for "Lipa Na M-Pesa Sandbox"
   - Copy your Consumer Key and Consumer Secret
   - Get your passkey
   - Set up callback URL in your app settings

5. **Run the application**

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Admin Login Credentials

📧 **Email:** geopramtech@gmail.com  
🔑 **Password:** GeoPramTech72222  
📱 **Phone:** 0702781490

These credentials are stored in the `.env` file and should be changed in production.

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Payments
- `POST /api/pay` - Initiate STK Push
- `POST /api/callback` - M-Pesa callback handler
- `GET /api/status/:checkoutRequestID` - Check payment status

### Transactions
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/transactions/filter/:period` - Filter by period (day/week/month/year)
- `GET /api/admin/download/:period` - Download Excel report

### Products
- `POST /api/admin/products` - Add/Update product
- `GET /api/products` - Get all products
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/upload-image` - Upload product image

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

## Usage

### Admin Dashboard
1. Open `http://localhost:5000` in your browser
2. Login with admin credentials
3. View dashboard statistics
4. Manage products
5. Monitor transactions
6. Download reports

### Adding Products
1. Go to **Products** tab
2. Fill in product details
3. Upload image from:
   - Local file (drag & drop or browse)
   - GitHub URL or any image URL
4. Click **Add Product**

### Making Payments (Customer)
1. Go to **Shop** tab
2. Browse and select a product
3. Click **Buy Now**
4. Enter phone number (format: 0712345678 or +254712345678)
5. Click **Send STK Push**
6. Check phone for M-Pesa prompt
7. Enter M-Pesa PIN to complete payment

### Generating Reports
1. Go to **Reports** tab
2. Select report period:
   - **Daily** - Today's transactions
   - **Weekly** - This week's transactions
   - **Monthly** - This month's transactions
   - **Yearly** - This year's transactions
3. Click download button
4. Excel file will be generated automatically

## File Structure

```
geopram-payment-system/
├── server.js                 # Main Express server
├── api/
│   ├── stk_push.js          # M-Pesa STK Push logic
│   └── callback.js          # Payment callback handler
├── public/
│   ├── index.html           # Frontend dashboard
│   └── uploads/             # Product images folder
├── data/
│   ├── transactions.json    # Transaction storage
│   └── products.json        # Products storage
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables** in Vercel dashboard:
   - Go to your project settings
   - Add all variables from `.env`

### Deploy to Heroku

1. **Install Heroku CLI**
2. **Login and deploy**
```bash
heroku login
heroku create your-app-name
git push heroku main
```

3. **Set config vars**
```bash
heroku config:set CONSUMER_KEY=xxx CONSUMER_SECRET=xxx ...
```

## Security Notes

⚠️ **Important Security Measures:**

1. **Change Default Credentials**
   - Always change the admin email and password in production
   - Use strong, unique passwords

2. **Environment Variables**
   - Never commit `.env` file to git
   - Use a `.env.example` file for documentation
   - Rotate JWT secret regularly

3. **API Keys**
   - Keep M-Pesa credentials secure
   - Don't expose them in frontend code
   - Use HTTPS in production

4. **Database**
   - Migrate to proper database (MongoDB, PostgreSQL) in production
   - Implement proper data encryption
   - Regular backups

5. **CORS Configuration**
   - Update CORS settings for production domain
   - Only allow trusted origins

## Troubleshooting

### STK Push not working
- ✅ Check M-Pesa credentials in `.env`
- ✅ Verify phone number format (254712345678)
- ✅ Ensure callback URL is accessible
- ✅ Check M-Pesa sandbox status

### Payment not recorded
- ✅ Check if callback URL is correct
- ✅ Verify server is running and accessible
- ✅ Check server logs for errors

### Image upload failing
- ✅ Check file size (max 5MB)
- ✅ Verify image format (JPEG, PNG, WebP, GIF)
- ✅ Ensure `/public/uploads` directory exists

### Login not working
- ✅ Verify credentials in `.env`
- ✅ Check if server is running
- ✅ Clear browser cache and cookies

## Technologies Used

**Backend:**
- Node.js & Express
- Axios (HTTP client)
- JWT (Authentication)
- XLSX (Excel generation)
- Moment.js (Date handling)

**Frontend:**
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Font Awesome Icons
- Vanilla JS (no framework)

## Support & Contact

For issues and support:
- 📧 Email: geopramtech@gmail.com
- 📧 Verify Email: celestakim018@gmail.com
- 📱 Phone: 0702781490
- 📱 Alt Phone: 0101370035

## License

This project is licensed under the MIT License.

## Credits

🔧 Built with ❤️ for GeoPram Technologies

---

**Happy Coding! 🚀**
