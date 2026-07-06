# Admin Scenarios

## Scenario A1: Content Creation and Publishing
1. Admin logs into admin panel
2. Creates new article with title, body, category
3. Saves as draft
4. Reviews content for accuracy
5. Submits for publication
6. System changes status to published
7. Article visible on public site
8. Audit log records: actor, action, timestamp

## Scenario A2: Content Review Workflow
1. Content manager creates article (status: draft)
2. Submits for review (status: review)
3. Senior admin reviews content
4. If approved: status changes to published
5. If rejected: status reverts to draft with notes
6. Author notified of decision

## Scenario A3: Manual Payment Verification
1. Admin views pending orders
2. Sees order details: user, course, amount
3. Contacts user to confirm payment
4. Verifies payment receipt
5. Confirms payment in system
6. System activates course access for user
7. Audit log records verification

## Scenario A4: Consultation Management
1. Admin views consultation requests
2. Sees new request with subject and description
3. Reviews and approves request
4. Assigns consultant or contacts user directly
5. Updates status to contacted
6. After consultation: marks as completed
7. Adds internal notes if needed

## Scenario A5: User Management
1. Admin views user list
2. Can search by phone number or name
3. Can view user details and order history
4. Can block suspicious users
5. Can change user role (limited to content_manager/consultant)
6. Cannot delete users (soft block only)

## Scenario A6: Chatbot Knowledge Management
1. Admin views knowledge base entries
2. Adds new Q&A pairs
3. Edits existing entries
4. Deactivates outdated entries (soft)
5. Reviews flagged queries from users
6. Updates responses based on common questions

## Scenario A7: Audit Log Review
1. Admin navigates to audit log section
2. Filters by action type, date range, actor
3. Views detailed log entries
4. Cannot modify or delete log entries
5. Can export log for compliance review

## Scenario A8: Content Archival
1. Admin selects published content
2. Changes status to archived
3. Content removed from public listing
4. Content remains in database for audit
5. Can restore from archive if needed
6. Audit log records archival action
