# Backend Startup Guide

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd inv-flow-backend
   ```

2. **Start the backend:**
   ```bash
   dotnet run
   ```

   Or use a specific profile:
   ```bash
   dotnet run --launch-profile https
   ```

## Available Ports

The backend runs on:
- **HTTP**: `http://localhost:5104`
- **HTTPS**: `https://localhost:7291`

## Frontend Configuration

The frontend is configured to use `http://localhost:5104/api` by default.

To change the API URL, create a `.env` file in the `inv-flow` folder:
```env
VITE_API_URL=http://localhost:5104/api
```

Or for HTTPS:
```env
VITE_API_URL=https://localhost:7291/api
```

## Troubleshooting Connection Issues

### Issue: ERR_CONNECTION_REFUSED

**Solution 1: Check if backend is running**
- Open a terminal and run: `cd inv-flow-backend && dotnet run`
- Wait for the message: "Now listening on: http://localhost:5104" or "https://localhost:7291"

**Solution 2: Verify the port**
- Check `Properties/launchSettings.json` for the correct port
- Update frontend `.env` file to match

**Solution 3: Check firewall**
- Ensure Windows Firewall isn't blocking the port
- Try temporarily disabling firewall to test

### Issue: CORS Errors

If you see CORS errors in the browser console:
1. Verify CORS is configured in `Program.cs`
2. Check that your frontend URL is in the allowed origins list
3. Ensure `app.UseCors()` is called before `app.UseAuthorization()`

### Issue: HTTPS Certificate Errors

If using HTTPS and getting certificate errors:
1. **Option A**: Use HTTP instead (port 5104) - easier for development
2. **Option B**: Accept the self-signed certificate in your browser
   - Click "Advanced" → "Proceed to localhost (unsafe)"

### Issue: Database Connection Errors

If you see database connection errors:
1. Ensure PostgreSQL is running
2. Check connection string in `appsettings.json`
3. Verify database `invflow` exists
4. Run migrations: `dotnet ef database update`

## Verifying Backend is Running

1. **Check Swagger UI:**
   - Open: `https://localhost:7291/swagger` or `http://localhost:5104/swagger`
   - You should see the API documentation

2. **Test an endpoint:**
   ```bash
   curl http://localhost:5104/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
   ```

3. **Check console output:**
   - Look for: "Now listening on: http://localhost:5104"
   - Look for: "Application started"

## Development Tips

- Use HTTP (port 5104) for easier development
- Use HTTPS (port 7291) if you need to test SSL features
- Keep the backend terminal open to see logs
- Check the browser console for detailed error messages

