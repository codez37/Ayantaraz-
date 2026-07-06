# Risk Classification

## Levels

| Level | Enum | Example Topics | Behavior |
|-------|------|---------------|----------|
| Low | `low` | General questions, defintions, site FAQ, process questions | Direct answer from KB |
| Medium | `medium` | Practical tax questions, how-to (non-sensitive), general guidance | Answer + disclaimer |
| High | `high` | Specific tax liability, legal decisions, multi-interpretation rules | Escalate to human |
| Forbidden | `forbidden` | Tax evasion, document fraud, illegal advice, loopholes | Refuse + educational message |

## Classification Keywords

### High Risk Triggers
- فرار مالیاتی, دور زدن, جعل, تخلف
- راه فرار, پنهان کردن درآمد, صوری
- کاهش غیرقانونی, سندسازی

### Medium Risk Triggers
- محاسبه مالیات, نرخ مالیات, معافیت
- ارزش افزوده, اظهارنامه, عملکرد
- مشمول, ضریب, مالیات بر درآمد

## Default
If no keyword match → Low risk
