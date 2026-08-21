# GO PREMIUM SEO/SEM Pilot — 2026-08-19

## Evidence snapshot

- Google Search Console, 3-month report (last updated 2026-08-19): 56 clicks, 982 impressions, 5.7% CTR, average position 14.9.
- Sitemap status: Success, 416 discovered pages. Page indexing: 430 indexed; 52 not indexed (25 alternate canonical, 26 discovered, 1 crawled).
- Non-brand demand with weak click-through: `พาวเวอร์แบงค์พรีเมี่ยม` 47 impressions / 0 clicks, `สั่งทำของชำร่วย` 32 / 0, `ร่ม premium` 12 / 0, `ของขวัญต้อนรับพนักงานใหม่` 11 / 0.
- GA4 production reporting is live. `qualified_rfq` exists in the form implementation but still needs one production RFQ-to-CRM reconciliation.
- Google Ads: legacy account 366-172-6478 is cancelled with 0 campaigns. New account 953-669-1143 (GoPremium Thailand) is at billing setup and cannot launch until a payment method is added.

## Priority clusters

1. Revenue intent: powerbank logo, corporate souvenir, umbrella logo, Welcome Kit.
2. Urgent intent: ready-to-ship / urgent promotional products → `/express`.
3. Seasonal demand: corporate New Year gifts 2027 → prepare now; enable only when the landing and conversion trace pass.
4. Brand protection: `go premium`, `gopremium` is optional and should use a very small cap because organic already captures most clicks.

## Pilot rules

- Search only. Disable Display Network and Search Partners.
- Phrase and Exact match only in month 1; no Broad match.
- All import rows remain Paused until billing, conversion import, and budget approval are complete.
- Recommended starting cap after approval: ฿265/day (about ฿8,000 per 30 days), max CPC ฿40.
- Do not call traffic ROI until `qualified_rfq → Pipedrive → FlowAccount Invoice` is reconciled. GA4 key events alone are not revenue.
- Weekly decision metrics: spend, clicks, search terms, `generate_lead`, `qualified_rfq`, qualified-RFQ CPL, quote issued, invoice revenue.
- Pause a keyword when it accumulates 20 qualified clicks with no `generate_lead`, or when irrelevant search terms dominate; add negatives before raising budget.
- Scale only after qualified-RFQ CPL is consistently below ฿1,000 and the RFQ/CRM trace is complete.

## Negative seed list

`ฟรี`, `ทำเอง`, `วิธีทำ`, `งานแต่ง`, `งานศพ`, `ปลีก`, `ชิ้นเดียว`, `shopee`, `lazada`, `1688`, `เสื้อครอป`, `หมอนโดเรม่อน`, `คลิปจับชู้`, `มือสอง`, `สมัครงาน`, `โรงงานเสื้อ`

## Activation gates

1. Controlled production RFQ proves UTM/GCLID → `generate_lead` → `qualified_rfq` → matching CRM/RFQ record.
2. Google Ads conversion actions import the intended lead events without PII.
3. Golf approves an exact baht budget and payment method. Current Google billing screen states a temporary ฿500 card authorization may appear.
4. Campaign/import QA confirms every keyword, final URL, negative, RSA, location, language, schedule, and status; campaign stays Paused until the final enable action.
