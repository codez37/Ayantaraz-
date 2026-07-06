# Site Map

## Public Pages
```
/                           Homepage
/services                   Services overview
/about                      About Us
/articles                   Articles list
/articles/[slug]            Article detail
/videos                     Videos gallery
/video/[slug]               Video detail
/minibooks                  Mini-books list
/minibook/[slug]            Mini-book detail
/courses                    Courses list
/courses/[slug]             Course detail
/course-video/[id]          Course video (sample or enrolled)
/faq                        Frequently asked questions
/contact                    Contact us
/consultation               Consultation request form
/auth                       Login / Registration
```

## User Pages (authenticated)
```
/dashboard                  User dashboard
/dashboard/profile          Profile edit
/dashboard/orders           My orders
/dashboard/consultations    My consultation requests
/dashboard/courses          My enrolled courses
```

## Admin Pages
```
/admin                      Admin dashboard
/admin/contents             Content management (articles, videos, minibooks)
/admin/contents/create      Create content
/admin/contents/[id]/edit   Edit content
/admin/courses              Course management
/admin/courses/create       Create course
/admin/courses/[id]/edit    Edit course
/admin/users                User management
/admin/consultations        Consultation requests
/admin/orders               Order management
/admin/chatbot              Knowledge base management
/admin/audit-logs           Audit log viewer
```

## API Routes
```
POST /api/auth/otp
POST /api/auth/verify
POST /api/auth/refresh
GET  /api/users/profile
PATCH /api/users/profile
GET  /api/users (admin)
GET  /api/content
GET  /api/content/:slug
POST /api/content (admin)
PATCH /api/content/:id (admin)
PATCH /api/content/:id/status (admin)
GET  /api/courses
GET  /api/courses/:slug
POST /api/courses (admin)
GET  /api/courses/video/:id
POST /api/consultation
GET  /api/consultation
GET  /api/consultation/:id
PATCH /api/consultation/:id/status (admin)
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
PATCH /api/orders/:id/status (admin)
POST /api/chatbot/query
GET  /api/chatbot/knowledge (admin)
POST /api/chatbot/knowledge (admin)
GET  /api/audit (admin)
GET  /api/admin/dashboard (admin)
```
