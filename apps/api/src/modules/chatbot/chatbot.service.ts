import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const DIACRITICS = /[\u064B-\u0652\u0670]/g;
const PERSIAN_NORMALIZE: Record<string, string> = {
  ك: 'ک',
  ي: 'ی',
  ة: 'ه',
  ۀ: 'ه',
  ھ: 'ه',
  'َ': '',
  'ُ': '',
  'ِ': '',
  'ً': '',
  'ٌ': '',
  'ٍ': '',
  'ّ': '',
  'ْ': '',
  'ٓ': '',
  'ٔ': '',
  'ٕ': '',
  'ٰ': '',
};

function removeDiacritics(s: string): string {
  return s.replace(DIACRITICS, '');
}

function normalizePersian(s: string): string {
  return s.replace(/[^\w\s\d]/g, (c) => PERSIAN_NORMALIZE[c] ?? c);
}

function extractPersianNumbers(s: string): string {
  const digitMap: Record<string, string> = {};
  for (let i = 0; i < 10; i++) {
    digitMap[PERSIAN_DIGITS[i]] = String(i);
    digitMap[ARABIC_DIGITS[i]] = String(i);
  }
  return s.replace(/[۰-۹٠-٩]/g, (c) => digitMap[c] ?? c);
}

const HIGH_RISK_KEYWORDS = [
  'فرار مالیاتی',
  'دور زدن',
  'جعل',
  'تخلف',
  'راه فرار',
  'پنهان کردن درآمد',
  'سوری',
  'کاهش غیرقانونی',
  'سندسازی',
];
const MEDIUM_RISK_KEYWORDS = [
  'محاسبه مالیات',
  'نرخ مالیات',
  'معافیت',
  'ارزش افزوده',
  'اظهارنامه',
  'مشمول',
  'ضریب',
  'مالیات بر درآمد',
];
const FORBIDDEN_PHRASES = ['دور زدن', 'فرار', 'جعل', 'سندسازی', 'پنهان'];

const TOPIC_CATEGORIES: Record<string, string[]> = {
  مالیات: [
    'مالیات',
    'مالیاتی',
    'ارزش افزوده',
    'اظهارنامه',
    'جریمه',
    'دیرکرد',
    'معافیت',
  ],
  حسابداری: ['حسابداری', 'حساب', 'ترازنامه', 'صورت مالی', 'حسابرس', 'دفتر'],
  'ثبت شرکت': ['ثبت شرکت', 'شرکت', 'سهامی', 'برند', 'ثبت نام'],
  'تامین اجتماعی': [
    'تامین اجتماعی',
    'بیمه',
    'کارگر',
    'کارفرما',
    'حقوق',
    'مزایا',
  ],
  قرارداد: ['قرارداد', 'پیمان', 'مالیات بر درآمد', 'حق تمبر'],
};

const SUB_TOPIC_MAP: Record<string, string[]> = {
  مالیات: [
    'مالیات بر ارزش افزوده',
    'معافیت‌های مالیاتی',
    'جرایم و دیرکرد',
    'اظهارنامه',
  ],
  حسابداری: ['حسابداری صنعتی', 'حسابداری مالی', 'حسابداری پیمانکاری'],
  قرارداد: ['قرارداد اجاره', 'قرارداد پیمانکاری', 'حق تمبر'],
};

class RiskResult {
  level!: RiskLevel;
  matchedKeyword?: string;
}

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  private normalizePersian(text: string): string {
    if (!text) return '';
    let normalized = text;
    // Remove diacritics (harakat)
    normalized = removeDiacritics(normalized);
    // Normalize Persian characters
    normalized = normalizePersian(normalized);
    // Convert Persian numbers to English
    normalized = extractPersianNumbers(normalized).toString();
    // Remove extra spaces and special chars
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  private expandTerms(text: string): string[] {
    const normalized = this.normalizePersian(text);
    const words = normalized.split(/\s+/).filter((w) => w.length > 1);
    const expanded = new Set<string>();
    for (const w of words) {
      expanded.add(w);
      if (w.startsWith('می')) expanded.add(w.slice(2));
      if (w.endsWith('های')) expanded.add(w.slice(0, -2));
      if (w.endsWith('ها')) expanded.add(w.slice(0, -2));
      if (w.endsWith('ان')) expanded.add(w.slice(0, -2));
      if (w.endsWith('ات')) expanded.add(w.slice(0, -2));
    }
    return [...expanded];
  }

  private extractBigrams(words: string[]): string[] {
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(words[i] + ' ' + words[i + 1]);
    }
    return bigrams;
  }

  private getFallbackAnswer(topic: string | null): string {
    const fallbackMap: Record<string, string> = {
      مالیات:
        'برای سوالات مالیاتی، می‌توانید از بخش مقالات مالیاتی یا فرم مشاوره استفاده کنید.',
      حسابداری:
        'برای سوالات حسابداری، دوره‌های آموزشی ما را بررسی کنید یا درخواست مشاوره ثبت کنید.',
      'ثبت شرکت':
        'برای ثبت شرکت، می‌توانید از راهنمای ثبت شرکت در سایت استفاده کنید یا با کارشناسان ما تماس بگیرید.',
      'تامین اجتماعی':
        'برای سوالات تامین اجتماعی، لطفاً با کارشناسان ما تماس بگیرید یا از فرم مشاوره استفاده کنید.',
      قرارداد:
        'برای سوالات قراردادها، می‌توانید از مقالات مرتبط استفاده کنید یا درخواست مشاوره حقوقی ثبت کنید.',
    };
    return (
      fallbackMap[topic || ''] ||
      'متاسفانه پاسخ مناسبی برای این سوال پیدا نشد. لطفاً با کارشناسان ما تماس بگیرید یا از فرم مشاوره استفاده کنید.'
    );
  }

  private classifyRisk(question: string): RiskResult {
    const q = this.normalizePersian(question);
    for (const keyword of FORBIDDEN_PHRASES) {
      if (q.includes(keyword))
        return { level: 'forbidden', matchedKeyword: keyword };
    }
    for (const keyword of HIGH_RISK_KEYWORDS) {
      if (q.includes(keyword))
        return { level: 'high', matchedKeyword: keyword };
    }
    for (const keyword of MEDIUM_RISK_KEYWORDS) {
      if (q.includes(keyword))
        return { level: 'medium', matchedKeyword: keyword };
    }
    return { level: 'low' };
  }

  private detectTopic(question: string): string | null {
    const q = this.normalizePersian(question);
    let bestTopic: string | null = null;
    let bestScore = 0;
    for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
      const score = keywords.filter((kw) => q.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }
    return bestScore > 0 ? bestTopic : null;
  }

  private buildTopicSuggestions(question: string): string {
    const q = this.normalizePersian(question);
    const matchedTopics: string[] = [];
    for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
      if (keywords.some((kw) => q.includes(kw))) {
        matchedTopics.push(topic);
      }
    }
    if (matchedTopics.length === 0) return '';

    const subTopics = matchedTopics.flatMap((t) => SUB_TOPIC_MAP[t] || []);
    if (subTopics.length === 0) return '';

    const sample = subTopics
      .slice(0, 3)
      .map((st) => `• ${st}`)
      .join('\n');
    return `\n\n💡 می‌توانید سوال خود را دقیق‌تر بپرسید، مثلاً:\n${sample}`;
  }

  private async searchKnowledge(
    question: string,
    contextQuestions?: string[],
  ): Promise<{
    answer: string;
    source: string;
    confidence: number;
    relatedTopics?: string[];
  } | null> {
    const allTexts = [question, ...(contextQuestions || [])].join(' ');
    const terms = this.expandTerms(allTexts);
    const bigrams = this.extractBigrams(terms);

    const matches = await this.prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [
          ...terms.map((word) => ({
            question: { contains: word, mode: 'insensitive' as const },
          })),
          ...bigrams.map((phrase) => ({
            question: { contains: phrase, mode: 'insensitive' as const },
          })),
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    if (matches.length > 0) {
      const scored = matches.map((m) => {
        const q = this.normalizePersian(m.question);
        const a = this.normalizePersian(m.answer);
        let score = terms.filter((t) => q.includes(t)).length * 2;
        score += bigrams.filter((b) => q.includes(b)).length * 3;
        score += terms.filter((t) => a.includes(t)).length;
        score +=
          this.normalizePersian(question)
            .split(/\s+/)
            .filter((w) => q.includes(w)).length * 1.5;
        return { match: m, score };
      });
      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];

      let answer = best.match.answer;
      const source = `knowledge_base:${best.match.id}`;

      if (scored.length > 1 && scored[1].score > 0) {
        const related = scored.slice(1, 3).filter((s) => s.score > 0);
        if (related.length > 0) {
          answer += '\n\n---\n📌 مطالب مرتبط:\n';
          answer += related.map((r) => `• ${r.match.question}`).join('\n');
        }
      }

      return {
        answer,
        source,
        confidence: best.score,
        relatedTopics: scored
          .slice(1, 3)
          .filter((s) => s.score > 0)
          .map((s) => s.match.question),
      };
    }

    const faqMatches = await this.prisma.content.findMany({
      where: {
        contentType: 'faq',
        status: 'published',
        visibility: 'public',
        OR: [
          ...terms.map((word) => ({
            title: { contains: word, mode: 'insensitive' as const },
          })),
          ...bigrams.map((phrase) => ({
            title: { contains: phrase, mode: 'insensitive' as const },
          })),
        ],
      },
      take: 3,
    });

    if (faqMatches.length > 0) {
      const scored = faqMatches
        .map((m) => {
          const title = this.normalizePersian(m.title);
          const score =
            terms.filter((t) => title.includes(t)).length * 2 +
            bigrams.filter((b) => title.includes(b)).length * 3;
          return { match: m, score };
        })
        .sort((a, b) => b.score - a.score);

      return {
        answer: scored[0].match.body,
        source: `faq:${scored[0].match.id}`,
        confidence: scored[0].score,
      };
    }

    const articleMatches = await this.prisma.content.findMany({
      where: {
        contentType: 'article',
        status: 'published',
        visibility: 'public',
        OR: [
          ...terms.map((word) => ({
            OR: [
              { title: { contains: word, mode: 'insensitive' as const } },
              { summary: { contains: word, mode: 'insensitive' as const } },
            ],
          })),
          ...bigrams.map((phrase) => ({
            OR: [
              { title: { contains: phrase, mode: 'insensitive' as const } },
              { summary: { contains: phrase, mode: 'insensitive' as const } },
            ],
          })),
        ],
      },
      take: 3,
    });

    if (articleMatches.length > 0) {
      const scored = articleMatches
        .map((m) => {
          const title = this.normalizePersian(m.title || '');
          const summary = this.normalizePersian(m.summary || '');
          const score =
            terms.filter((t) => title.includes(t)).length * 2 +
            terms.filter((t) => summary.includes(t)).length;
          return { match: m, score };
        })
        .sort((a, b) => b.score - a.score);

      const article = scored[0].match;
      return {
        answer: article.summary || article.title,
        source: `article:${article.id}`,
        confidence: scored[0].score,
      };
    }

    return null;
  }

  private buildFallback(question: string, riskLevel: string): string {
    const topic = this.detectTopic(question);
    const suggestions = this.buildTopicSuggestions(question);

    if (topic && suggestions) {
      return `متوجه شدم سوال شما درباره "${topic}" است، اما پاسخ دقیقی در دانشنامه خود ندارم.${suggestions}\n\n🔄 همچنین می‌توانید سوال را به صورت دیگری مطرح کنید یا از بخش پرسش و پاسخ مالیاتی استفاده نمایید.`;
    }

    if (riskLevel === 'high') {
      return 'برای این موضوع، مشاوره انسانی توصیه می‌شود. لطفاً از طریق فرم مشاوره درخواست خود را ثبت کنید.\n\n💡 می‌توانید به صفحه "سوالات مالیاتی" نیز مراجعه کنید.';
    }

    return 'متأسفم، پاسخ دقیقی برای سوال شما پیدا نکردم.\n\n💡 نکات مفید:\n• سوال خود را دقیق‌تر و با جزییات بیشتر بپرسید\n• از کلمات کلیدی مرتبط با موضوع استفاده کنید\n• می‌توانید از سامانه پرسش و پاسخ مالیاتی کمک بگیرید\n• یا از طریق فرم مشاوره با کارشناسان ما تماس بگیرید';
  }

  async query(question: string, userId?: number) {
    const sessionId = userId ? `session_${userId}` : this.generateSessionId();
    const conversation = await this.getOrCreateConversation(sessionId, userId);

    await this.logMessage(conversation.id, sessionId, userId, 'user', question);

    const risk = this.classifyRisk(question);

    if (risk.level === 'forbidden') {
      const refusal =
        'این سوال خارج از حوزه راهنمایی مجاز است. لطفاً با مشاور حقوقی رسمی مشورت کنید.';
      await this.logMessage(conversation.id, sessionId, userId, 'bot', refusal);
      return { answer: refusal, riskLevel: risk.level, source: 'refused' };
    }

    const kbResult = await this.searchKnowledge(question, []);

    if (kbResult && kbResult.confidence >= 0.3) {
      let answer = kbResult.answer;
      if (risk.level === 'medium') {
        answer +=
          '\n\n⚠️ این پاسخ عمومی است و برای تصمیم نهایی نیاز به بررسی تخصصی دارد.';
      }
      if (kbResult.relatedTopics && kbResult.relatedTopics.length > 0) {
        answer += '\n\n💡 همچنین می‌توانید درباره این موضوعات بپرسید:\n';
        answer += kbResult.relatedTopics.map((t) => `• ${t}`).join('\n');
      }

      await this.logMessage(conversation.id, sessionId, userId, 'bot', answer);
      return {
        answer,
        riskLevel: risk.level,
        source: kbResult.source,
        confidence: kbResult.confidence,
      };
    }

    if (risk.level === 'high') {
      await this.prisma.escalationTicket.create({
        data: {
          conversationId: conversation.id,
          userId: userId ?? undefined,
          reason: `High risk question with no KB match: ${question}`,
          status: 'open',
        },
      });
      const escalationMsg =
        'برای این موضوع، مشاوره انسانی توصیه می‌شود. لطفاً از طریق فرم مشاوره درخواست خود را ثبت کنید.';
      await this.logMessage(
        conversation.id,
        sessionId,
        userId,
        'bot',
        escalationMsg,
      );
      return {
        answer: escalationMsg,
        riskLevel: risk.level,
        source: 'escalated',
      };
    }

    const fallback = this.buildFallback(question, risk.level);
    await this.logMessage(conversation.id, sessionId, userId, 'bot', fallback);
    return { answer: fallback, riskLevel: risk.level, source: 'fallback' };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private async getOrCreateConversation(sessionId: string, userId?: number) {
    let conversation = await this.prisma.chatConversation.findUnique({
      where: { sessionId },
    });
    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: { sessionId, userId, status: 'active' },
      });
    }
    return conversation;
  }

  private async logMessage(
    conversationId: number,
    sessionId: string,
    userId: number | undefined,
    role: string,
    content: string,
  ) {
    return this.prisma.chatMessage.create({
      data: { conversationId, sessionId, userId, role, content },
    });
  }

  async getKnowledgeBase(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.knowledgeBase.count(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createKnowledgeEntry(
    data: {
      question: string;
      answer: string;
      category?: string;
      riskLevel?: RiskLevel;
    },
    userId: number,
  ) {
    const entry = await this.prisma.knowledgeBase.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category || '',
        riskLevel: data.riskLevel || 'low',
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'knowledge_base_create',
        entityType: 'knowledge_base',
        entityId: entry.id,
        newValue: { question: data.question, riskLevel: data.riskLevel },
      },
    });
    return entry;
  }

  async updateKnowledgeEntry(
    id: number,
    data: {
      question?: string;
      answer?: string;
      category?: string;
      riskLevel?: RiskLevel;
      isActive?: boolean;
    },
    userId: number,
  ) {
    const existing = await this.prisma.knowledgeBase.findUnique({
      where: { id },
    });
    if (!existing)
      throw new HttpException('مورد دانش یافت نشد', HttpStatus.NOT_FOUND);
    const entry = await this.prisma.knowledgeBase.update({
      where: { id },
      data,
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'knowledge_base_update',
        entityType: 'knowledge_base',
        entityId: id,
        oldValue: {
          question: existing.question,
          riskLevel: existing.riskLevel,
        },
        newValue: data,
      },
    });
    return entry;
  }

  async getConversation(sessionId: string, userId?: number, userRole?: string) {
    const where: { sessionId: string; userId?: number } = { sessionId };
    if (userRole === 'user') where.userId = userId;
    const conversation = await this.prisma.chatConversation.findFirst({
      where,
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation)
      throw new HttpException('مکالمه یافت نشد', HttpStatus.NOT_FOUND);
    return conversation;
  }
}
