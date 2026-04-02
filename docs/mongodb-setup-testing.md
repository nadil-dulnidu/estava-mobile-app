# MongoDB Atlas Setup & Backend Testing Guide

## Step 1: Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up or log in with your account
3. Click **Create** → **Build a Database** → **M0 (Free)** tier
4. Choose region closest to you
5. Click **Create Deployment**

## Step 2: Configure Network Access

1. In Atlas, go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Choose **Allow Access from Anywhere** (for development; restrict in production)
4. Click **Confirm**

## Step 3: Create Database User

1. In Atlas, go to **Database Access** (left sidebar)
2. Click **Add Database User**
3. Choose **Username/Password** auth method
4. Enter username (e.g., `estava_dev`)
5. Enter a strong password (save it!)
6. Click **Add User**

## Step 4: Get Connection String

1. Go to **Databases** in Atlas
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials
6. Replace `myFirstDatabase` with `estava`

Example:
```
mongodb+srv://estava_dev:your_password@estava-cluster.mongodb.net/estava?retryWrites=true&w=majority
```

---

## Step 5: Add to Backend .env

Open `backend/.env` and update:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://estava_dev:PASSWORD@cluster.mongodb.net/estava?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

---

## Step 6: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 7: Test Backend Auth Endpoints

### Option A: Using Postman (Visual GUI)

1. Download [Postman](https://postman.com/downloads)
2. Create a new **POST** request
3. URL: `http://localhost:5000/api/auth/register`
4. Body (JSON):
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```
5. Send and check response

### Option B: Using cURL (Command Line)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "password": "password456",
    "role": "seller"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password456"
  }'

# Get current user (with token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Health check
curl http://localhost:5000/api/health
```

### Option C: Using Thunder Client (VS Code extension)

1. Install **Thunder Client** extension in VS Code
2. Create new request
3. Set method to **POST**
4. URL: `http://localhost:5000/api/auth/register`
5. Go to **Body** tab, select **JSON**, paste:
```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password789",
  "role": "buyer"
}
```
6. Click **Send**

---

## Step 8: Run Full Test Suite

In the `backend/` directory, run the development server:

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### Test These Endpoints

| Test | Method | Endpoint | Expected |
|------|--------|----------|----------|
| Health | GET | `/api/health` | 200 OK |
| Register valid | POST | `/api/auth/register` | 201 Created, token + user |
| Register duplicate email | POST | `/api/auth/register` | 409 Conflict |
| Register missing name | POST | `/api/auth/register` | 400 Bad Request |
| Login valid | POST | `/api/auth/login` | 200 OK, token + user |
| Login wrong password | POST | `/api/auth/login` | 401 Unauthorized |
| Get current user (with token) | GET | `/api/auth/me` | 200 OK, user data |
| Get current user (no token) | GET | `/api/auth/me` | 401 Unauthorized |

---

## Step 9: Verify MongoDB Data

1. Return to MongoDB Atlas
2. Go to **Databases** → **Browse Collections**
3. Navigate to `estava` → `users`
4. You should see the registered users

---

## Troubleshooting

### "Failed to connect to MongoDB"
- Check MongoDB URI in `.env` is correct
- Verify IP is whitelisted in Atlas Network Access
- Ensure database user password is correct

### "MongoDB connection timed out"
- Verify you're connected to the internet
- Check firewall settings
- Try removing `?retryWrites=true` from URI temporarily

### "Email already in use"
- Try a different email address (emails must be unique)
- Or delete the user from MongoDB Atlas and try again

### "Invalid token" on `/auth/me`
- Make sure the token from login response is included
- Format: `Authorization: Bearer <token>`

---

## Next: Mobile Testing

Once backend auth is verified, test the mobile app:

1. Update `mobile/.env` with a dev API URL or use emulator fallback
2. Run `npm start` in `mobile/`
3. Test login/register screens against your live backend

---

## Production Checklist

Before deploying to production:

- [ ] Update JWT_SECRET to a long, random, unique string
- [ ] Restrict CORS_ORIGIN to your app domain only
- [ ] Enable IP whitelist in MongoDB Atlas (not "Allow from Anywhere")
- [ ] Use environment variables for all secrets
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS on your hosting platform
- [ ] Test auth flow on production URL before final demo
