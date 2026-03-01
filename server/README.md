# VAELINSA 3D Print Slicer - Setup Guide

## Quick Start

### 1. Backend Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3001`

### 2. Configure Email (IMPORTANT!)

**For Gmail:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security > App Passwords
4. Generate a new app password for "Mail"
5. Update `server/print-queue.js` line 31-32:

```javascript
auth: {
    user: 'your-actual-email@gmail.com',
    pass: 'your-16-character-app-password'
}
```

**Or use environment variables:**
```bash
export EMAIL_USER=projects@vaelinsa.com
export EMAIL_PASS=your-app-password
export ORDER_EMAIL=orders@vaelinsa.com
npm start
```

### 3. Access the Slicer

Visit: **http://localhost:3000/slicer**

## Features

### Frontend (Three.js)
- ✅ STL file upload with drag-and-drop
- ✅ Interactive 3D preview with orbit controls
- ✅ Real-time material color changes
- ✅ Scale adjustment (25%-400%)
- ✅ Infill density control (0%-100%)
- ✅ Live volume calculation using signed tetrahedron method
- ✅ Instant quote generation
- ✅ Promo code support (SAVE10, SAVE20, PLA15, FIRST20)

### Backend (Node.js/Express)
- ✅ File upload handling with Multer
- ✅ Print job queue system
- ✅ Email notifications (customer + admin)
- ✅ Job tracking API
- ✅ CORS enabled for development

## File Structure

```
d:/veda/web v4/v4/
├── public/slicer/
│   ├── index.html          # Standalone slicer UI
│   └── slicer.js           # Core Three.js logic
├── app/slicer/
│   └── page.tsx            # Next.js wrapper
├── server/
│   ├── package.json        # Backend dependencies
│   └── print-queue.js      # API server
└── print-queue/            # Auto-created job storage
    └── [jobId]/
        ├── model.stl       # Customer's STL file
        └── quote.json      # Quote data
```

## API Endpoints

### POST `/api/receive-print-job`
Receives STL file and quote data, saves to queue, sends emails

**Request:** FormData
- `stl`: STL file
- `email`: Customer email
- `quote`: JSON string of quote data

**Response:**
```json
{
  "success": true,
  "jobId": 1704067200000
}
```

### GET `/api/job/:id`
Get specific job details

### GET `/api/jobs`
List all jobs in queue (newest first)

### GET `/api/health`
Health check endpoint

## Material Pricing

| Material | Density (g/cm³) | Cost (₹/kg) |
|----------|-----------------|-------------|
| PLA      | 1.24            | 160         |
| ABS      | 1.04            | 200         |
| PETG     | 1.27            | 180         |
| TPU      | 1.21            | 280         |

**Machine Time:** ₹50/hour

## Promo Codes

- `SAVE10` - 10% off
- `SAVE20` - 20% off
- `PLA15` - 15% off
- `FIRST20` - 20% off (first-time customers)

## Troubleshooting

### ❌ "Cannot connect to print queue server"
**Solution:** Make sure backend server is running:
```bash
cd server
npm start
```

### ❌ Email not sending
**Solution:** 
1. Check Gmail app password is correct
2. Verify 2FA is enabled
3. Check console logs for specific error

### ❌ STL file not loading
**Solution:**
1. Ensure file is valid STL format
2. Check file size (large files may take time)
3. Open browser console (F12) for errors

## Production Deployment

### Frontend (Vercel)
```bash
# Deploy Next.js app
vercel deploy
```

### Backend (Render.com)
1. Push `server/` to GitHub
2. Create new Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `ORDER_EMAIL`

## Development

### Run in Development Mode
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Test Email Without Actual Sending
Modify `print-queue.js` to use a test SMTP service like [Ethereal](https://ethereal.email/)

## Next Steps

1. ✅ Test STL upload
2. ✅ Verify email delivery
3. ⚠️ Configure production email credentials
4. ⚠️ Set up actual slicer engine (CuraEngine/PrusaSlicer) for real G-code
5. ⚠️ Add payment integration
6. ⚠️ Add job status tracking UI

## Support

For issues or questions:
- Email: projects@vaelinsa.com
- Documentation: See `slicer_implementation_guide.md`
