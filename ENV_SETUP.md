# Environment Variables Configuration

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lms
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lms?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Application Configuration
REACT_APP_NAME=AI-Powered LMS
REACT_APP_VERSION=1.0.0

# Optional: Analytics, etc.
# REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

## Production Configuration

### Backend (.env.production)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=use_strong_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_NAME=AI-Powered LMS
REACT_APP_VERSION=1.0.0
```

## Security Notes

1. **Never commit `.env` files to version control**
2. Use strong, unique values for `JWT_SECRET`
3. Rotate secrets regularly in production
4. Use environment-specific configurations
5. Store production secrets in secure vaults (AWS Secrets Manager, Azure Key Vault, etc.)

## Required vs Optional Variables

### Required (Backend)
- ✅ `MONGODB_URI` - Database connection string
- ✅ `JWT_SECRET` - Secret key for JWT signing

### Optional (Backend)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (default: development)
- `JWT_EXPIRE` - Token expiration (default: 30d)
- `FRONTEND_URL` - CORS origin (default: http://localhost:3000)

### Required (Frontend)
- ✅ `REACT_APP_API_URL` - Backend API URL

### Optional (Frontend)
- `REACT_APP_NAME` - Application name
- `REACT_APP_VERSION` - Application version
