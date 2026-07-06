# User Scenarios

## Scenario 1: Anonymous Visitor
1. User visits site homepage
2. Browses available services
3. Reads educational articles (free)
4. Watches sample course videos
5. Decides to register for consultation or course purchase
6. Initiates phone registration

## Scenario 2: Phone Registration
1. User enters phone number
2. System sends OTP via SMS (Kavenegar)
3. User enters received OTP
4. System verifies OTP
5. User is logged in
6. User completes profile (first name, last name)

## Scenario 3: Returning User Login
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP
4. System verifies and creates session
5. User redirected to dashboard

## Scenario 4: Browse and Read Content
1. User navigates to articles section
2. Browses article list with summaries
3. Clicks article to read full content
4. Can share or bookmark (future feature)
5. Related articles shown at bottom

## Scenario 5: Course Exploration
1. User visits courses page
2. Sees course list with title, description, price
3. Clicks a course for details
4. Watches sample videos (free preview)
5. Decides to purchase
6. Clicks "Request Purchase" button

## Scenario 6: Course Purchase (Manual Payment)
1. User clicks "Request Purchase"
2. System creates order (status: pending)
3. User sees order confirmation with bank account details
4. User transfers payment manually
5. User uploads receipt or waits for admin call
6. Admin verifies payment
7. Access to full course activated
8. User notified of activation

## Scenario 7: Consultation Request
1. User navigates to consultation page
2. Selects consultation type (accounting/tax/general)
3. Fills form: description, preferred contact time
4. Submits request
5. System creates consultation request (status: pending)
6. Admin reviews and contacts user
7. User can track request status

## Scenario 8: Chatbot Interaction
1. User opens chat widget
2. Types a tax/accounting question
3. Bot searches knowledge base
4. If found: returns approved answer
5. If not found: suggests consulting a human expert
6. If unsafe query: refuses and redirects
7. All interactions logged

## Scenario 9: OTP Failure Handling
1. User enters phone number
2. OTP SMS fails to send (Kavenegar error)
3. System logs failure
4. User sees "SMS failed, please try again" message
5. User retries after 60 seconds
6. After 3 failures, user asked to contact support
