# Creating Users with Approval Permissions

Since you're using Clerk for authentication, here are the methods to create users with APPROVER or FINANCE_OFFICER roles:

## 🚀 Quick Start

### Step 1: User Signs Up Through Clerk
1. User visits your application and clicks "Sign In"
2. User creates account through Clerk (automatically gets REQUESTER role)
3. User is now in your database but can only create requests

### Step 2: Promote User to Approval Role

#### Method A: Command Line (Recommended for Development)
```bash
# Navigate to server directory
cd server

# Promote user to APPROVER role
npm run promote-user user@example.com APPROVER

# Promote user to FINANCE_OFFICER role  
npm run promote-user user@example.com FINANCE_OFFICER
```

#### Method B: User Management Interface (Recommended for Production)
1. Sign in as a FINANCE_OFFICER
2. Navigate to `/users` in your application
3. Find the user in the list
4. Click "Change Role" 
5. Select new role and confirm

#### Method C: Direct Database Update
```sql
-- Connect to your PostgreSQL database and run:
UPDATE "User" 
SET role = 'APPROVER' 
WHERE email = 'user@example.com';

-- Or for Finance Officer:
UPDATE "User" 
SET role = 'FINANCE_OFFICER' 
WHERE email = 'user@example.com';
```

## 🔐 Role Permissions

### REQUESTER (Default)
- ✅ Create service requests
- ✅ View own requests
- ✅ Edit own pending requests
- ❌ Cannot approve requests
- ❌ Cannot manage users

### APPROVER
- ✅ Create service requests
- ✅ View own requests  
- ✅ Edit own pending requests
- ✅ **Approve/reject/request revision on all requests**
- ✅ **Access AprovalsPage at `/approvals`**
- ❌ Cannot manage users
- ❌ Cannot create invoices/payments

### FINANCE_OFFICER (Highest Permissions)
- ✅ Create service requests
- ✅ View own requests
- ✅ Edit own pending requests
- ✅ **Approve/reject/request revision on all requests**
- ✅ **Access ApprovalsPage at `/approvals`**
- ✅ **Manage user roles at `/users`**
- ✅ **Create and manage invoices**
- ✅ **Create and manage payments**
- ✅ **Access finance dashboard**

## 🛠️ Development Workflow

### For Testing Approval Workflow:

1. **Create Test Users:**
   ```bash
   # Sign up 3 different users through Clerk:
   # - requester@test.com (stays as REQUESTER)
   # - approver@test.com (promote to APPROVER)  
   # - finance@test.com (promote to FINANCE_OFFICER)
   ```

2. **Promote Users:**
   ```bash
   cd server
   npm run promote-user approver@test.com APPROVER
   npm run promote-user finance@test.com FINANCE_OFFICER
   ```

3. **Test Workflow:**
   - Sign in as requester@test.com → Create a service request
   - Sign in as approver@test.com → Go to `/approvals` → Approve/reject request
   - Sign in as finance@test.com → Access all features including user management

## 📝 Production Setup

### Creating Your First Admin:
1. Sign up through your application (gets REQUESTER role)
2. Manually promote to FINANCE_OFFICER using database or command line
3. Use that account to promote other users through the UI

### Recommended User Hierarchy:
```
FINANCE_OFFICER (1-2 users)
    ↓ Can promote users to any role
APPROVER (Department heads, managers)
    ↓ Can approve requests but not manage users  
REQUESTER (All other staff)
    ↓ Can create and manage own requests
```

## 🔍 Verification

After promoting a user, verify their permissions:

1. **Check Database:**
   ```sql
   SELECT name, email, role FROM "User" WHERE email = 'user@example.com';
   ```

2. **Check Application:**
   - User should see appropriate navigation items
   - APPROVER: Should see "Approvals" in navbar
   - FINANCE_OFFICER: Should see "Approvals" + "User Management" in navbar

3. **Test Functionality:**
   - Navigate to `/approvals` (should work for APPROVER/FINANCE_OFFICER)
   - Navigate to `/users` (should only work for FINANCE_OFFICER)

## 🚨 Important Notes

- **Users must sign up through Clerk first** before you can assign roles
- **Only FINANCE_OFFICER can manage user roles** through the UI
- **Role changes take effect immediately** (user may need to refresh)
- **Command line tool is safe** - validates roles and shows user info
- **Always test with different user accounts** to verify permissions

## 🤝 Need Help?

If you encounter issues:
1. Check user exists in database: `SELECT * FROM "User" WHERE email = 'user@example.com';`
2. Verify Clerk user ID matches: Check `clerkId` field
3. Test with fresh browser session after role changes
4. Check browser console for any authentication errors

The approval workflow is now fully functional - just need to create the users with proper roles!
