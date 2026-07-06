# Chatbot Scope

## Purpose
A constrained tax-assistance chatbot that answers from approved knowledge only, refuses unsafe questions, and escalates to human consultants when needed.

## In Scope
- Approved knowledge base querying
- Risk classification of every question
- Controlled answer templates
- Refusal for high-risk / unsafe questions
- Human escalation path
- Full conversation logging and audit
- Admin management of knowledge + approved answers
- Chatbot UI with guardrails

## Out of Scope
- General-purpose AI agent
- Autonomous tax decision making
- Legal advisor replacement
- Open web scraping / uncontrolled RAG
- Self-learning from conversations
- Multi-turn legal reasoning

## Operating Principles
1. Chatbot is NOT a legal authority
2. Answers only from approved sources
3. Sensitive questions → escalate
4. No free generation / guesses
5. Everything is traceable
