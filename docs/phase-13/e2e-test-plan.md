# E2E / UI Test Plan

## User Flows
1. Visit home → browse articles → read article
2. Visit /auth → enter phone → enter OTP → see dashboard
3. Visit /consultation → fill form → submit → see success
4. Visit /courses → select course → request purchase → see order
5. Visit /faq → chatbot → ask question → get answer

## Admin Flows
1. Login → see dashboard → see stats
2. Content → create article → submit review → publish
3. Consultations → view pending → assign → update status
4. Orders → view pending → confirm with payment reference
5. Chatbot → view KB → edit answer → verify update
6. Users → search → block → verify blocked

## Edge Cases
- Submit consultation without auth (with phone)
- Submit order without auth
- Chatbot forbidden question
- Access protected content without auth
