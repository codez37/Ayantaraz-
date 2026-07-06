# Functional Requirements

## FR1: Public Site Access
- Site must be publicly visible
- Free content accessible without authentication
- Service pages visible to all visitors

## FR2: Authentication
- Registration only via phone number
- Login only via phone number
- OTP sent via Kavenegar SMS API
- OTP verification endpoint
- Session creation on successful verification
- Logout capability
- OTP attempt limiting (max 5 attempts)
- OTP request rate limiting (max 3 per 10 min)
- OTP expiry (5 minutes)

## FR3: User Profile
- Store: first name, last name, phone number
- Profile update after first login
- View profile

## FR4: Content Management
- Create, read, update, soft-delete articles
- Create, read, update, soft-delete videos
- Create, read, update, soft-delete mini-books
- Content lifecycle: draft → review → published → archived
- Content listing by status
- Content filtering by category
- Slug-based URL routing

## FR5: Courses
- Define course with title, description, price
- Upload course videos with ordering
- Mark videos as sample (free preview)
- Course listing page
- Course detail page with sample videos
- Access control for full course content

## FR6: Manual Payment
- User requests course purchase
- System creates order with pending status
- Admin views and processes order
- Payment verification outside platform
- Manual confirmation by admin
- Access activation after confirmation
- Order status tracking visible to user

## FR7: Consultation Requests
- User submits consultation form
- Form fields: subject, description, preferred time
- Request status tracking: pending → contacted → scheduled → completed → canceled
- Admin view for all requests
- Internal notes for admin

## FR8: Constrained Chatbot
- Answer from approved FAQ/knowledge base
- Redirect to human consultation for complex queries
- Refuse out-of-scope questions
- All queries logged

## FR9: Admin Panel
- Manage articles (CRUD + publish)
- Manage videos (CRUD + publish)
- Manage mini-books (CRUD + publish)
- Manage courses (CRUD + publish)
- Manage users (view, block, role change)
- Manage consultation requests
- Manage orders (verify payment, activate access)
- Manage FAQ/knowledge base
- View audit logs
- Role-based access control

## FR10: Static Pages
- About us
- Services overview
- Contact information
- FAQ page
