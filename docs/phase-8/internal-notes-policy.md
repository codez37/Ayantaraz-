# Internal Notes Policy

## Purpose
Internal notes track contact attempts, outcomes, and next actions. They are NOT visible to the user.

## Required Content Per Note
- Who contacted (assignee name)
- Contact method (phone / internal message)
- Outcome summary
- User's stated need
- Next action
- Next follow-up time (if applicable)

## Prohibited Content
- Irrelevant personal opinions
- Unnecessary sensitive data
- Speculation without basis

## Storage
Notes are stored as a single `internalNotes` text field on ConsultationRequest, appended with timestamp and author prefix each time.

## Format
```
[1403-01-15 10:30] محمدی:
تماس گرفته شد. کاربر سوال درباره مالیات ارزش افزوده داشت.
اقدام بعدی: ارسال مدارک مورد نیاز.
پیگیری بعدی: 1403/01/20
--- 
[1403-01-20 11:00] محمدی:
کاربر مدارک را دریافت کرد. هماهنگی برای مشاوره تکمیلی.
```

## Audit
Every note addition is logged in audit_logs with action `consultation_note_added`.
