# Chatbot Flow

## Entry Points
- Floating chat button (bottom-right, mobile-friendly)
- FAQ page embedded widget
- Article pages: "سوالی دارید؟"

## Widget Layout
```
+---------------------------+
|  🤖  چت‌بات مالیاتی       |  ← header with icon
+---------------------------+
|  Previous messages (scroll) |
|                           |
|  Bot: سلام! من دستیار     |
|  هوشمند آیان تراز هستم.   |
|  می‌توانم به سوالات عمومی  |
|  مالیاتی پاسخ دهم.        |
|  برای مشاوره تخصصی،       |
|  لطفاً با کارشناسان ما    |
|  تماس بگیرید.             |
|                           |
|  User: مالیات بر ارزش     |
|  افزوده چیست؟            |
|                           |
|  Bot: [approved answer]   |
+---------------------------+
|  [Input field] [Send]     |
+---------------------------+
```

## Response Rules

### When match found in knowledge base:
- Return approved answer
- Add: "این پاسخ بر اساس اطلاعات عمومی است. برای موارد خاص، با کارشناس مشورت کنید."
- Optional: link to relevant article

### When no match found:
- "متأسفم، نمی‌توانم به این سوال پاسخ دهم. لطفاً با یک کارشناس انسانی مشورت کنید."
- CTA: "درخواست مشاوره تلفنی"

### When sensitive query detected (tax evasion, fraud, etc.):
- "این موضوع نیاز به مشاوره تخصصی دارد. لطفاً با کارشناسان ما تماس بگیرید."
- Do NOT attempt to answer
- Log query for review

### Safety Disclaimers
- First interaction: always show disclaimer
- Every answer contains: "پاسخ بر اساس اطلاعات عمومی"
- No definitive legal/finance claims
- No personal liability assumptions

## States

### Empty
- Greeting message + disclaimer

### Loading
- Typing indicator: "..."

### Error
- "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید."

### Offline
- "دستیار هوشمند در دسترس نیست. لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید."
