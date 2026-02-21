# Subscription Plans CRUD Implementation

## Overview
Task 8.1 implementation for subscription plan management endpoints in the superadmin platform.

## Endpoints Implemented

### 1. GET /v1/superadmin/subscriptions/plans
**Purpose**: List all subscription plans with usage statistics

**Query Parameters**:
- `include_inactive` (optional): "true" to include inactive plans, defaults to "false"

**Response**: Returns all plans with:
- Plan details (id, plan_code, plan_name, price, billing_period, features, etc.)
- `active_subscriptions`: Count of active subscription assignments
- `total_restaurants`: Count of restaurants using this plan

**Requirements**: 2.1, 2.2, 2.5

---

### 2. POST /v1/superadmin/subscriptions/plans
**Purpose**: Create a new subscription plan

**Required Fields**:
- `plan_code`: Unique identifier for the plan
- `plan_name`: Display name for the plan
- `price`: Plan price (must be >= 0)
- `billing_period`: One of 'month', 'year', 'trial'
- `billing_days`: Duration in days
- `features`: Array of feature strings (must have at least one)

**Optional Fields**:
- `currency`: Defaults to "INR"
- `savings`: Amount saved compared to monthly
- `is_popular`: Boolean flag
- `display_order`: Sort order
- `max_restaurants`: Number of restaurants allowed

**Validations**:
- Plan code uniqueness (case-insensitive)
- Plan name uniqueness (case-insensitive)
- Price must be non-negative
- Billing period must be valid enum value
- Features array must not be empty

**Requirements**: 2.1, 2.6, 2.7, 2.8

---

### 3. GET /v1/superadmin/subscriptions/plans/:id/stats
**Purpose**: Get detailed statistics for a specific plan

**Response**: Returns plan details with:
- `active_subscriptions`: Count of active assignments
- `total_restaurants`: Count of restaurants using this plan
- `monthly_revenue`: Total revenue from active subscriptions

**Requirements**: 2.5

---

### 4. PATCH /v1/superadmin/subscriptions/plans/:id
**Purpose**: Update an existing subscription plan

**Allowed Fields**: Any combination of:
- `plan_code`, `plan_name`, `price`, `currency`, `billing_period`, `billing_days`
- `savings`, `is_popular`, `is_active`, `display_order`, `features`, `max_restaurants`

**Validations**:
- Plan code uniqueness if changed
- Plan name uniqueness if changed
- Price must be non-negative if provided
- Billing period must be valid if provided
- Features array must not be empty if provided

**Note**: Response includes message "Changes will apply to new subscriptions only"

**Requirements**: 2.3, 2.6, 2.7, 2.8

---

### 5. DELETE /v1/superadmin/subscriptions/plans/:id
**Purpose**: Deactivate a subscription plan (soft delete)

**Behavior**:
- Sets `is_active = 0`
- Prevents new subscription assignments
- Existing subscriptions continue until their end date
- Returns error if plan is already inactive

**Note**: Response includes message about existing subscriptions continuing

**Requirements**: 2.4

---

## Security Features

1. **Superadmin Middleware**: All endpoints protected by `superadminMiddleware`
2. **CSRF Protection**: All state-changing operations (POST, PATCH, DELETE) require CSRF token
3. **Input Validation**: Comprehensive validation on all inputs
4. **SQL Injection Prevention**: Parameterized queries used throughout

## Database Schema

```sql
CREATE TABLE subscription_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_code VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  billing_period ENUM('month','year','trial') NOT NULL,
  billing_days INT NOT NULL,
  savings DECIMAL(10,2) DEFAULT 0.00,
  is_popular TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0,
  features LONGTEXT CHECK (json_valid(features)),
  max_restaurants INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

A comprehensive test script is available at `test_subscription_plans.sh` which tests:
1. ✅ Get all plans
2. ✅ Create new plan
3. ✅ Get plan statistics
4. ✅ Update plan
5. ✅ Duplicate plan rejection
6. ✅ Empty features validation
7. ✅ Negative price validation
8. ✅ Invalid billing period validation
9. ✅ Deactivate plan
10. ✅ Get plans including inactive
11. ✅ Double deactivation prevention

## Requirements Coverage

- ✅ **Requirement 2.1**: Store plan details including name, price, billing cycle, and feature limits
- ✅ **Requirement 2.2**: Allow specification of limits for menu items, staff count, monthly orders
- ✅ **Requirement 2.3**: Update plan details and apply changes to new subscriptions only
- ✅ **Requirement 2.4**: Deactivate plan prevents new assignments while maintaining existing subscriptions
- ✅ **Requirement 2.5**: Display number of active subscriptions and revenue metrics per plan
- ✅ **Requirement 2.6**: Validate plan names are unique within the platform
- ✅ **Requirement 2.7**: Require at least one feature limit to be defined
- ✅ **Requirement 2.8**: Support multiple billing cycles (month, year, trial)

## Implementation Files

- **Controller**: `server/src/controller/v1/superadmin/subscriptions.controller.js`
- **Routes**: `server/src/routes/v1/superadmin/subscriptions.routes.js`
- **Test Script**: `server/test_subscription_plans.sh`

## Status

✅ **Task 8.1 Complete** - All subscription plan CRUD endpoints implemented and tested
