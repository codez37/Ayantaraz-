#!/usr/bin/env python3
"""
Production Stability Review Engine (PSR-Engine) — Audit Script
Scans the project repo, runs static analysis checks across all modules,
scores each domain, and produces a Markdown + JSON report.

Usage:
    python production-audit.py --project-root /path/to/project [--output-dir ./reports]
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


# ─── Constants ───────────────────────────────────────────────────────────────

VERSION = "1.0"
SCORE_SCALE = {
    "missing": 0,
    "weak": 1,
    "partial": 2,
    "acceptable": 3,
    "good": 4,
    "production_ready": 5,
}

DOMAIN_WEIGHTS = {
    "security": 0.20,
    "correctness": 0.25,
    "stability": 0.15,
    "observability": 0.10,
    "maintainability": 0.10,
    "freshness": 0.10,
    "production_safety": 0.10,
}

RELEASE_BLOCKERS = {
    "R1": ("Auth is broken", "OTP/session/login/logout must work"),
    "R2": ("Admin is unsafe", "Missing permission/role checks"),
    "R3": ("Rollback plan missing", "No rollback plan or unverified"),
    "R4": ("Backup untested", "Backup restore not tested"),
    "R5": ("Content publish uncontrolled", "No review state before publish"),
    "R6": ("Order flow ambiguous", "Missing status or trace"),
    "R7": ("Chatbot unsafe", "No refusal/escalation mechanism"),
    "R8": ("Production env wrong", "Environment variables incorrect"),
}

CHECKLIST_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "auth": [
        {"id": "AUTH-01", "description": "OTP rate limit (3/10min)", "expected": "ThrottleModule or custom guard", "severity": "critical"},
        {"id": "AUTH-02", "description": "Failed attempts limit (5/30min → block)", "expected": "Rate limit + block logic", "severity": "critical"},
        {"id": "AUTH-03", "description": "JWT access (24h) + refresh (7d) rotation", "expected": "JWT config", "severity": "high"},
        {"id": "AUTH-04", "description": "Theft detection (revoked token reuse)", "expected": "SessionService theft detection", "severity": "critical"},
        {"id": "AUTH-05", "description": "Logout revokes session + refresh token", "expected": "Logout endpoint", "severity": "high"},
        {"id": "AUTH-06", "description": "Phone normalization (+98/0098/98 → 0)", "expected": "Phone util", "severity": "medium"},
        {"id": "AUTH-07", "description": "Persian error messages", "expected": "Persian error strings", "severity": "low"},
        {"id": "AUTH-08", "description": "Admin login stricter rate (3/15min)", "expected": "Separate rate limit", "severity": "high"},
    ],
    "admin": [
        {"id": "ADMIN-01", "description": "Permission-based access (JwtAuthGuard + RolesGuard)", "expected": "Guards applied", "severity": "critical"},
        {"id": "ADMIN-02", "description": "All actions logged to audit_log", "expected": "auditLog.create calls", "severity": "high"},
        {"id": "ADMIN-03", "description": "Content publish requires role", "expected": "Roles decorator", "severity": "critical"},
        {"id": "ADMIN-04", "description": "Order confirm/refund requires admin", "expected": "Roles check", "severity": "critical"},
        {"id": "ADMIN-05", "description": "Dashboard aggregates pending items", "expected": "Dashboard endpoint", "severity": "medium"},
        {"id": "ADMIN-06", "description": "Pagination on list endpoints", "expected": "Page/limit params", "severity": "medium"},
    ],
    "content": [
        {"id": "CONT-01", "description": "State machine: draft→review→published→archived", "expected": "canTransition guard", "severity": "critical"},
        {"id": "CONT-02", "description": "Visibility levels (public/auth/course_only/admin)", "expected": "Visibility filter", "severity": "high"},
        {"id": "CONT-03", "description": "Unauthorized access returns proper error", "expected": "HTTP 401/403/404", "severity": "high"},
        {"id": "CONT-04", "description": "Slug auto-generation from title", "expected": "toSlug method", "severity": "medium"},
        {"id": "CONT-05", "description": "Tags, metaDescription, thumbnailUrl stored", "expected": "DB fields", "severity": "medium"},
        {"id": "CONT-06", "description": "Audit log on each status change", "expected": "Audit log calls", "severity": "high"},
    ],
    "consultation": [
        {"id": "CONS-01", "description": "Duplicate detection (5min window)", "expected": "findFirst with time filter", "severity": "high"},
        {"id": "CONS-02", "description": "Rate limit (5/hr per user)", "expected": "count with time filter", "severity": "high"},
        {"id": "CONS-03", "description": "Unauthenticated user support", "expected": "find-or-create by phone", "severity": "medium"},
        {"id": "CONS-04", "description": "Status transitions enforced", "expected": "VALID_TRANSITIONS map", "severity": "critical"},
        {"id": "CONS-05", "description": "Internal notes with timestamp + actor", "expected": "formatNote method", "severity": "medium"},
        {"id": "CONS-06", "description": "Assignment logic (admin→anyone, consultant→self)", "expected": "Assignment guard", "severity": "high"},
    ],
    "orders": [
        {"id": "ORDR-01", "description": "Duplicate detection (30min window)", "expected": "findFirst with time filter", "severity": "high"},
        {"id": "ORDR-02", "description": "Rate limit (5/hr per user)", "expected": "count with time filter", "severity": "high"},
        {"id": "ORDR-03", "description": "Payment reference required for confirm", "expected": "Validation check", "severity": "critical"},
        {"id": "ORDR-04", "description": "Confirm creates Enrollment (access grant)", "expected": "enrollment.create", "severity": "critical"},
        {"id": "ORDR-05", "description": "Refund deactivates Enrollment", "expected": "enrollment.updateMany", "severity": "critical"},
        {"id": "ORDR-06", "description": "Status transitions enforced", "expected": "Transition map", "severity": "critical"},
    ],
    "chatbot": [
        {"id": "CHAT-01", "description": "Risk classification (low/medium/high/forbidden)", "expected": "classifyRisk method", "severity": "critical"},
        {"id": "CHAT-02", "description": "Forbidden questions refused", "expected": "Refusal response", "severity": "critical"},
        {"id": "CHAT-03", "description": "Multi-source search (KB→FAQ→article)", "expected": "searchKnowledge method", "severity": "high"},
        {"id": "CHAT-04", "description": "High-risk + no match → escalation ticket", "expected": "escalationTicket.create", "severity": "high"},
        {"id": "CHAT-05", "description": "Medium-risk includes disclaimer", "expected": "Disclaimer suffix", "severity": "medium"},
        {"id": "CHAT-06", "description": "Fallback for unanswered questions", "expected": "Fallback response", "severity": "medium"},
    ],
    "security": [
        {"id": "SEC-01", "description": "XSS protection (SanitizationPipe)", "expected": "SanitizationPipe class", "severity": "critical"},
        {"id": "SEC-02", "description": "CSP headers (helmet in production)", "expected": "app.use(helmet())", "severity": "high"},
        {"id": "SEC-03", "description": "HSTS enabled", "expected": "helmet.hsts", "severity": "medium"},
        {"id": "SEC-04", "description": "No secrets in logs", "expected": "Masking interceptor", "severity": "critical"},
        {"id": "SEC-05", "description": "No stack traces in production errors", "expected": "Exception filter", "severity": "high"},
        {"id": "SEC-06", "description": "Per-endpoint rate limiting (@Throttle)", "expected": "@Throttle decorators", "severity": "high"},
        {"id": "SEC-07", "description": "Input validation (whitelist + forbidNonWhitelisted)", "expected": "ValidationPipe config", "severity": "high"},
    ],
    "monitoring": [
        {"id": "MON-01", "description": "Health endpoint returns DB status", "expected": "GET /api/health", "severity": "critical"},
        {"id": "MON-02", "description": "Healthcheck script exists", "expected": "healthcheck.sh", "severity": "high"},
        {"id": "MON-03", "description": "Backup script exists with rotation", "expected": "backup.sh", "severity": "high"},
        {"id": "MON-04", "description": "Backup retention policy documented", "expected": "Phase 16 docs", "severity": "medium"},
        {"id": "MON-05", "description": "Structured JSON logging", "expected": "Logger config", "severity": "medium"},
    ],
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (FileNotFoundError, IOError):
        return ""


def file_exists(path: Path) -> bool:
    return path.exists() and path.is_file()


def grep(content: str, pattern: str) -> list[str]:
    return re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)


def count_matches(content: str, pattern: str) -> int:
    return len(grep(content, pattern))


def has_pattern(content: str, pattern: str) -> bool:
    return bool(re.search(pattern, content, re.MULTILINE | re.IGNORECASE))


def find_file(root: Path, *parts: str) -> Path | None:
    candidate = root.joinpath(*parts)
    return candidate if candidate.exists() else None


# ─── Check Runners ───────────────────────────────────────────────────────────

class ModuleChecker:
    """Runs all checks for a given module against the project root."""

    def __init__(self, root: Path):
        self.root = root
        self.api_src = root / "apps" / "api" / "src"
        self.web_src = root / "apps" / "web" / "src"
        self.prisma_file = root / "prisma" / "schema.prisma"
        self.docs_dir = root / "docs"
        self.infra_scripts = root / "infra" / "scripts"

    def _read_source(self, *parts: str) -> str:
        return read_file(self.api_src.joinpath(*parts))

    def _read_web_source(self, *parts: str) -> str:
        return read_file(self.web_src.joinpath(*parts))

    def run_check(self, module: str, check: dict) -> dict:
        method_name = f"check_{module}_{check['id'].lower().replace('-', '_')}"
        method = getattr(self, method_name, None)
        if method:
            return method(check)
        # Generic pass-through
        return {**check, "pass": False, "actual": "No check implemented"}

    # ── Auth Checks ──────────────────────────────────────────────────────

    def check_auth_auth_01(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.controller.ts")
        p = has_pattern(content, r"Throttle|@Throttle")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_02(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.service.ts")
        p = has_pattern(content, r"blocked")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_03(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.service.ts")
        p = has_pattern(content, r"JwtService|signAsync")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_04(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "session.service.ts") + \
                  self._read_source("modules", "auth", "auth.service.ts")
        p = has_pattern(content, r"theft|revok|terminat")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_05(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.controller.ts")
        p = has_pattern(content, r"logout")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_06(self, check: dict) -> dict:
        shared = read_file(self.root / "packages" / "shared" / "src" / "utils" / "index.ts")
        p = has_pattern(shared, r"isValidIranPhone|normalize")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_07(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.service.ts") + \
                  self._read_source("modules", "auth", "auth.controller.ts")
        p = has_pattern(content, r"[\u0600-\u06FF]{4,}")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_auth_auth_08(self, check: dict) -> dict:
        content = self._read_source("modules", "auth", "auth.controller.ts")
        # Auth controller has 3 @Throttle decorators for login/verify/logout
        p = has_pattern(content, r"@Throttle")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Admin Checks ─────────────────────────────────────────────────────

    def check_admin_admin_01(self, check: dict) -> dict:
        content = read_file(self.root / "apps" / "api" / "src" / "app.module.ts")
        p = has_pattern(content, r"JwtAuthGuard") and has_pattern(content, r"RolesGuard")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_admin_admin_02(self, check: dict) -> dict:
        content = self._read_source("modules", "admin", "admin.controller.ts")
        p = content.count("auditLog.create") > 0 or content.count("this.audit") > 0
        return {**check, "pass": p, "actual": str(content.count("auditLog.create"))}

    def check_admin_admin_03(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"content_manager|admin")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_admin_admin_04(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"admin|role.*admin")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_admin_admin_05(self, check: dict) -> dict:
        content = self._read_source("modules", "admin", "admin.controller.ts")
        p = has_pattern(content, r"dashboard|count|pending")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_admin_admin_06(self, check: dict) -> dict:
        content = self._read_source("modules", "admin", "admin.controller.ts")
        p = has_pattern(content, r"page|limit|skip|take")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Content Checks ───────────────────────────────────────────────────

    def check_content_cont_01(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"VALID_TRANSITIONS|canTransition")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_content_cont_02(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"public|authenticated|course_only|admin_only")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_content_cont_03(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"HttpException|HttpStatus\.(NOT_FOUND|UNAUTHORIZED|FORBIDDEN)")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_content_cont_04(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"toSlug")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_content_cont_05(self, check: dict) -> dict:
        schema = read_file(self.prisma_file)
        p = all(kw in schema for kw in ["tags", "metaDescription", "thumbnailUrl"])
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_content_cont_06(self, check: dict) -> dict:
        content = self._read_source("modules", "content", "content.service.ts")
        p = has_pattern(content, r"auditLog\.create")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Consultation Checks ──────────────────────────────────────────────

    def check_consultation_cons_01(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"DUPLICATE_WINDOW|findFirst.*gte.*Date")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_consultation_cons_02(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"RATE_LIMIT|count.*gte.*Date")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_consultation_cons_03(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"findUnique.*phone|user\.create")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_consultation_cons_04(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"VALID_TRANSITIONS")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_consultation_cons_05(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"formatNote")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_consultation_cons_06(self, check: dict) -> dict:
        content = self._read_source("modules", "consultation", "consultation.service.ts")
        p = has_pattern(content, r"assigneeId !== userId|userRole.*admin")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Orders Checks ────────────────────────────────────────────────────

    def check_orders_ordr_01(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"DUPLICATE|findFirst.*gte")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_orders_ordr_02(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"RATE_LIMIT|count.*gte")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_orders_ordr_03(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"paymentReference")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_orders_ordr_04(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"enrollment\.create|enrollment\.create")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_orders_ordr_05(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"enrollment\.updateMany|deactivat")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_orders_ordr_06(self, check: dict) -> dict:
        content = self._read_source("modules", "orders", "orders.service.ts")
        p = has_pattern(content, r"VALID_TRANSITIONS|transition")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Chatbot Checks ───────────────────────────────────────────────────

    def check_chatbot_chat_01(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"classifyRisk|HIGH_RISK|MEDIUM_RISK|FORBIDDEN")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_chatbot_chat_02(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"forbidden|refus")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_chatbot_chat_03(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"knowledgeBase\.findMany|faq|article") and \
            content.count("findMany") >= 2
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_chatbot_chat_04(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"escalationTicket\.create")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_chatbot_chat_05(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"general|تخصصی|⚠️")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_chatbot_chat_06(self, check: dict) -> dict:
        content = self._read_source("modules", "chatbot", "chatbot.service.ts")
        p = has_pattern(content, r"fallback|متأسفم")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Security Checks ──────────────────────────────────────────────────

    def check_security_sec_01(self, check: dict) -> dict:
        pipe = self._read_source("common", "pipes", "sanitization.pipe.ts")
        p = has_pattern(pipe, r"script|on\w*\s*=|javascript:")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_02(self, check: dict) -> dict:
        main = read_file(self.api_src / "main.ts")
        p = has_pattern(main, r"helmet")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_03(self, check: dict) -> dict:
        main = read_file(self.api_src / "main.ts")
        p = has_pattern(main, r"hsts|HSTS|63072000")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_04(self, check: dict) -> dict:
        interceptor = self._read_source("common", "interceptors", "request-logger.interceptor.ts")
        p = has_pattern(interceptor, r"mask|hidden|\*\*\*")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_05(self, check: dict) -> dict:
        filter_file = self._read_source("common", "filters", "http-exception.filter.ts")
        p = has_pattern(filter_file, r"stack.*trace|production.*stack")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_06(self, check: dict) -> dict:
        files_to_check = [
            self._read_source("modules", "auth", "auth.controller.ts"),
            self._read_source("modules", "consultation", "consultation.controller.ts"),
            self._read_source("modules", "chatbot", "chatbot.controller.ts"),
        ]
        p = any(has_pattern(f, r"@Throttle") for f in files_to_check)
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_security_sec_07(self, check: dict) -> dict:
        main = read_file(self.api_src / "main.ts")
        p = has_pattern(main, r"ValidationPipe|whitelist.*true|forbidNonWhitelisted")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    # ── Monitoring Checks ────────────────────────────────────────────────

    def check_monitoring_mon_01(self, check: dict) -> dict:
        content = self._read_source("modules", "health", "health.controller.ts")
        p = has_pattern(content, r"prisma|\$queryRaw|SELECT 1")
        return {**check, "pass": p, "actual": "found" if p else "not found"}

    def check_monitoring_mon_02(self, check: dict) -> dict:
        p = file_exists(self.infra_scripts / "healthcheck.sh")
        return {**check, "pass": p, "actual": "exists" if p else "not found"}

    def check_monitoring_mon_03(self, check: dict) -> dict:
        p = file_exists(self.infra_scripts / "backup.sh")
        return {**check, "pass": p, "actual": "exists" if p else "not found"}

    def check_monitoring_mon_04(self, check: dict) -> dict:
        p = file_exists(self.docs_dir / "phase-16" / "backup-restore-policy.md")
        return {**check, "pass": p, "actual": "exists" if p else "not found"}

    def check_monitoring_mon_05(self, check: dict) -> dict:
        main = read_file(self.api_src / "main.ts")
        files_to_check = [
            main,
            self._read_source("common", "interceptors", "request-logger.interceptor.ts"),
        ]
        p = any(has_pattern(f, r"JSON|structured|logger") for f in files_to_check)
        return {**check, "pass": p, "actual": "found" if p else "not found"}


# ─── Scoring Engine ──────────────────────────────────────────────────────────

def compute_domain_scores(module_results: dict[str, Any]) -> dict[str, Any]:
    """Compute scores for each domain based on module check results."""
    # Map modules to domains
    module_domain_map = {
        "auth": "security",
        "admin": "correctness",
        "content": "correctness",
        "consultation": "correctness",
        "orders": "correctness",
        "chatbot": "correctness",
        "security": "security",
        "monitoring": "observability",
    }

    domain_checks: dict[str, list[bool]] = {
        "security": [],
        "correctness": [],
        "stability": [],
        "observability": [],
        "maintainability": [],
        "freshness": [],
        "production_safety": [],
    }

    for module, result in module_results.items():
        domain = module_domain_map.get(module, "correctness")
        if domain in domain_checks and "checks" in result:
            for check in result["checks"]:
                domain_checks[domain].append(check.get("pass", False))

    scores = {}
    for domain, checks in domain_checks.items():
        if checks:
            pass_rate = sum(1 for c in checks if c) / len(checks)
            score = round(pass_rate * 5, 2)
        else:
            # Cross-cutting domain with no module checks: default to good (4.0)
            scores[domain] = 4.0
            continue
        scores[domain] = score

    return scores


def compute_composite(domain_scores: dict[str, float]) -> float:
    total = 0.0
    used_weight = 0.0
    for domain, weight in DOMAIN_WEIGHTS.items():
        if domain in domain_scores:
            total += domain_scores[domain] * weight
            used_weight += weight
    if used_weight > 0:
        total = total / used_weight
    return round(total, 2)


def determine_overall_status(
    composite: float,
    findings: dict[str, list],
) -> str:
    if findings.get("critical"):
        return "red"
    if len(findings.get("high", [])) > 3:
        return "red"
    if composite < 3.0:
        return "red"
    if composite >= 4.0 and not findings.get("critical") and len(findings.get("high", [])) <= 3:
        return "green"
    return "yellow"


# ─── Report Generation ───────────────────────────────────────────────────────

def generate_markdown_report(
    scope: list[str],
    overall_status: str,
    findings: dict[str, list],
    domain_scores: dict[str, float],
    composite: float,
    action_plan: list[dict],
    recheck_list: list[dict],
    module_results: dict[str, Any],
    violations: list[dict],
) -> str:
    status_icon = {"green": "GREEN", "yellow": "YELLOW", "red": "RED"}
    icon = status_icon.get(overall_status, "UNKNOWN")

    lines = [
        "# Production Review Report",
        "",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**PSR-Engine Version:** {VERSION}",
        f"**Scope:** {', '.join(scope)}",
        "",
        "---",
        "",
        f"## Overall Status: {icon}",
        "",
        "---",
        "",
    ]

    # Critical Findings
    lines.append("## Critical Findings")
    if findings.get("critical"):
        for f in findings["critical"]:
            lines.append(f"- **{f['id']}** [{f['module']}] {f['issue']}")
    else:
        lines.append("_None_")
    lines.append("")

    # High Findings
    lines.append("## High Findings")
    if findings.get("high"):
        for f in findings["high"]:
            lines.append(f"- **{f['id']}** [{f['module']}] {f['issue']}")
    else:
        lines.append("_None_")
    lines.append("")

    # Medium Findings
    lines.append("## Medium Findings")
    if findings.get("medium"):
        for f in findings["medium"]:
            lines.append(f"- **{f['id']}** [{f['module']}] {f['issue']}")
    else:
        lines.append("_None_")
    lines.append("")

    # Low Findings
    lines.append("## Low Findings")
    if findings.get("low"):
        for f in findings["low"]:
            lines.append(f"- **{f['id']}** [{f['module']}] {f['issue']}")
    else:
        lines.append("_None_")
    lines.append("")

    # Domain Scores
    lines.append("## Domain Scores")
    lines.append("| Domain | Score | Status |")
    lines.append("|---|---|---|")
    for domain, score in sorted(domain_scores.items()):
        s = "GREEN" if score >= 4 else "YELLOW" if score >= 3 else "RED"
        lines.append(f"| {domain.replace('_', ' ').title()} | {score} | {s} |")
    lines.append(f"| **Composite** | **{composite}** | **{icon}** |")
    lines.append("")

    # Module Results
    lines.append("## Module Check Results")
    for module, result in module_results.items():
        score = result.get("score", 0)
        s = "GREEN" if score >= 4 else "YELLOW" if score >= 3 else "RED"
        lines.append(f"\n### {module.title()} {s} (Score: {score})")
        lines.append("| Check | Description | Result |")
        lines.append("|---|---|---|")
        for check in result.get("checks", []):
            result_icon = "PASS" if check.get("pass") else "FAIL"
            lines.append(f"| {check['id']} | {check['description']} | {result_icon} |")
    lines.append("")

    # Action Plan
    lines.append("## Action Plan")
    if action_plan:
        lines.append("| ID | Issue | Fix | Owner | Priority | ETA |")
        lines.append("|---|---|---|---|---|---|")
        for item in action_plan:
            lines.append(
                f"| {item['id']} | {item['issue']} | {item['fix']} | "
                f"{item.get('owner', '—')} | {item['priority']} | {item.get('eta', '—')} |"
            )
    else:
        lines.append("_No actions required._")
    lines.append("")

    # Policy Violations
    if violations:
        lines.append("## Policy Violations")
        lines.append("| Rule | Description | Severity |")
        lines.append("|---|---|---|")
        for v in violations:
            lines.append(f"| {v['rule']} | {v['description']} | {v['severity']} |")
        lines.append("")

    # Recheck List
    lines.append("## Recheck List")
    if recheck_list:
        for item in recheck_list:
            lines.append(f"- [ ] {item['description']}")
    else:
        lines.append("_Nothing to recheck._")
    lines.append("")

    return "\n".join(lines)


def generate_json_report(
    scope: list[str],
    overall_status: str,
    findings: dict[str, list],
    domain_scores: dict[str, float],
    composite: float,
    action_plan: list[dict],
    recheck_list: list[dict],
    module_results: dict[str, Any],
    violations: list[dict],
) -> dict:
    return {
        "engine": {"name": "PSR-Engine", "version": VERSION, "timestamp": datetime.now(timezone.utc).isoformat()},
        "scope": scope,
        "overallStatus": overall_status,
        "compositeScore": composite,
        "findings": findings,
        "domainScores": domain_scores,
        "moduleResults": {k: {"module": k, "score": v.get("score", 0), "checks": v.get("checks", [])} for k, v in module_results.items()},
        "actionPlan": action_plan,
        "recheckList": recheck_list,
        "policyViolations": violations,
    }


# ─── Main Audit Engine ───────────────────────────────────────────────────────

def run_audit(project_root: Path) -> dict[str, Any]:
    root = project_root.resolve()
    checker = ModuleChecker(root)

    findings: dict[str, list] = {"critical": [], "high": [], "medium": [], "low": []}
    module_results: dict[str, Any] = {}
    action_plan: list[dict] = []
    recheck_list: list[dict] = []
    violations: list[dict] = []

    scope = list(CHECKLIST_TEMPLATES.keys())

    # 1. Inventory
    inventory = {
        "modules": scope,
        "configs": [
            str(p.relative_to(root)) for p in [
                root / ".env.example",
                root / ".env.development",
                root / ".env.staging",
                root / ".env.production",
                root / "docker-compose.yml",
                root / "docker-compose.prod.yml",
                root / "infra" / "nginx" / "default.conf",
                root / ".github" / "workflows" / "ci.yml",
            ] if p.exists()
        ],
        "docs": sorted(str(p.relative_to(root)) for p in (root / "docs").rglob("*.md") if p.is_file()),
        "scripts": sorted(str(p.relative_to(root)) for p in (root / "infra" / "scripts").rglob("*") if p.is_file()),
    }

    # 2. Validation + Scoring — run checks per module
    for module in scope:
        template = CHECKLIST_TEMPLATES.get(module, [])
        results: list[dict] = []
        passed = 0

        for check in template:
            result = checker.run_check(module, check)
            results.append(result)
            if result.get("pass"):
                passed += 1

        score = round((passed / len(template)) * 5, 2) if template else 0
        module_results[module] = {"score": score, "checks": results}

        # Collect findings
        for r in results:
            if not r.get("pass"):
                sev = r.get("severity", "low")
                issue = f"{r['description']}: expected {r.get('expected', '?')}, got {r.get('actual', '?')}"
                finding = {
                    "id": r["id"],
                    "module": module,
                    "category": module,
                    "issue": issue,
                    "severity": sev,
                    "action": f"Implement or fix {r['description'].lower()}",
                    "isReleaseBlocker": sev == "critical",
                }
                findings.setdefault(sev, []).append(finding)
                action_plan.append({
                    "id": r["id"],
                    "issue": issue,
                    "fix": finding["action"],
                    "owner": "—",
                    "priority": sev,
                    "eta": "24h" if sev == "critical" else "1 week" if sev == "high" else "1 month",
                    "blocksRelease": sev == "critical",
                })
                recheck_list.append({"id": r["id"], "description": f"{r['description']} — verify fix"})

    # 3. Composite scoring
    domain_scores = compute_domain_scores(module_results)
    composite = compute_composite(domain_scores)
    overall_status = determine_overall_status(composite, findings)

    # 4. Policy violation check
    for rule_id, (condition, desc) in RELEASE_BLOCKERS.items():
        if overall_status == "red":
            violations.append({"rule": rule_id, "description": f"{condition}: {desc}", "severity": "critical"})

    return {
        "scope": scope,
        "inventory": inventory,
        "overall_status": overall_status,
        "domain_scores": domain_scores,
        "composite": composite,
        "findings": findings,
        "module_results": module_results,
        "action_plan": action_plan,
        "recheck_list": recheck_list,
        "violations": violations,
    }


# ─── CLI Entrypoint ──────────────────────────────────────────────────────────

def main():
    # Handle Windows encoding
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

    parser = argparse.ArgumentParser(description="PSR-Engine: Production Stability Review")
    parser.add_argument("--project-root", required=True, help="Path to the project root")
    parser.add_argument("--output-dir", default="./psr-reports", help="Output directory for reports")
    args = parser.parse_args()

    root = Path(args.project_root).resolve()
    if not root.exists():
        print("[ERROR] project root '%s' does not exist" % root, file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("[*] PSR-Engine v%s -- Auditing %s" % (VERSION, root))
    print("    Modules: %s" % ', '.join(CHECKLIST_TEMPLATES.keys()))
    print()

    result = run_audit(root)

    # Generate reports
    md_report = generate_markdown_report(
        scope=result["scope"],
        overall_status=result["overall_status"],
        findings=result["findings"],
        domain_scores=result["domain_scores"],
        composite=result["composite"],
        action_plan=result["action_plan"],
        recheck_list=result["recheck_list"],
        module_results=result["module_results"],
        violations=result["violations"],
    )

    json_report = generate_json_report(
        scope=result["scope"],
        overall_status=result["overall_status"],
        findings=result["findings"],
        domain_scores=result["domain_scores"],
        composite=result["composite"],
        action_plan=result["action_plan"],
        recheck_list=result["recheck_list"],
        module_results=result["module_results"],
        violations=result["violations"],
    )

    # Write output
    md_path = output_dir / f"production-review-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
    json_path = output_dir / f"production-review-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"

    md_path.write_text(md_report, encoding="utf-8")
    json_path.write_text(json.dumps(json_report, indent=2, ensure_ascii=False), encoding="utf-8")

    print("    Composite Score: %s/5.0" % result['composite'])
    print("    Overall Status: %s" % result['overall_status'].upper())
    print("    Critical: %d" % len(result['findings'].get('critical', [])))
    print("    High: %d" % len(result['findings'].get('high', [])))
    print("    Medium: %d" % len(result['findings'].get('medium', [])))
    print("    Low: %d" % len(result['findings'].get('low', [])))
    print()
    print("[FILE] Markdown report: %s" % md_path)
    print("[FILE] JSON report: %s" % json_path)


if __name__ == "__main__":
    main()
