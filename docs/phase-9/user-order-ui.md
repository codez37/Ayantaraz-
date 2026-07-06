# User Order UI

## Pages

### Course Detail `/courses/:slug`
- Title, description, price info
- Sample video
- "درخواست خرید" button
- Note: "پرداخت آنلاین وجود ندارد. پس از ثبت درخواست با شما تماس می‌گیریم."

### Purchase Request `/courses/:slug/request`
- Short form (pre-filled if authenticated)
- Submit button
- Post-submit: tracking ID + status

### My Orders `/dashboard/orders`
| فیلد | توضیح |
|------|-------|
| نام دوره | Course title |
| وضعیت | Persian badge |
| تاریخ ثبت | 1403/01/15 |
| آخرین بروزرسانی | 1403/01/20 |

### Order Detail `/dashboard/orders/:id`
- Course name
- Status (Persian)
- Timeline of changes
- Contact info for follow-up
