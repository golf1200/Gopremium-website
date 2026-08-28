// ============================================================
// GO PREMIUM — /privacy  Privacy Policy (PDPA)
// Thai-language factual privacy notice for the current RFQ data flow.
// ============================================================
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useMeta } from '../hooks/useMeta';
import { site } from '../config';

export default function Privacy() {
  useMeta({
    title: 'นโยบายความเป็นส่วนตัว — GO PREMIUM',
    description: 'นโยบายความเป็นส่วนตัวของ GO PREMIUM ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) — ข้อมูลที่เก็บ วัตถุประสงค์ สิทธิของเจ้าของข้อมูล และช่องทางติดต่อ',
    canonical: `${site.siteUrl}/privacy`,
  });

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--gp-cloud)' }}>
      {/* Header */}
      <div style={{ background: 'var(--gp-navy)', padding: '28px 0 24px' }}>
        <div className="gp-wrap">
          <Breadcrumbs crumbs={[{ label: 'หน้าแรก', href: '/' }, { label: 'นโยบายความเป็นส่วนตัว' }]} />
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,32px)', marginTop: 12, fontFamily: 'var(--gp-font-head)' }}>นโยบายความเป็นส่วนตัว</h1>
          <p style={{ color: '#CBD7E8', fontSize: 14, marginTop: 5 }}>การคุ้มครองข้อมูลส่วนบุคคลตาม PDPA</p>
        </div>
      </div>

      <div className="gp-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div data-privacy-version="2026-08-28" style={{ background: '#fff', borderRadius: 16, padding: 'clamp(22px,3.5vw,44px)', boxShadow: 'var(--gp-shadow)', maxWidth: 860 }}>
          <p style={{ color: 'var(--gp-grey)', fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
            {site.legalName} (“{site.brand}”, “เรา”) เคารพความเป็นส่วนตัวของคุณ และมุ่งมั่นคุ้มครองข้อมูลส่วนบุคคลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            ประกาศฉบับวันที่ 28 สิงหาคม 2569 นี้อธิบายการประมวลผลข้อมูลเมื่อคุณใช้เว็บไซต์หรือติดต่อขอใบเสนอราคา
          </p>

          <Section title="1. ข้อมูลที่เราเก็บรวบรวม">
            <BulletList items={[
              'ข้อมูลติดต่อและองค์กร เช่น ชื่อ บริษัท อีเมล และเบอร์โทรศัพท์',
              'รายละเอียด RFQ เช่น สินค้าที่สนใจ จำนวน งบประมาณ วันที่ต้องการรับงาน โอกาส แหล่งที่รู้จักเรา และข้อความเพิ่มเติม',
              'รหัสคงที่สำหรับเชื่อมคำขอและป้องกันรายการซ้ำ ได้แก่ lead_id และ submission_id รวมถึงเวลาส่งคำขอ',
              'ชุดข้อมูล first-touch ของ session ได้แก่ UTM, Google click identifiers (gclid, gbraid หรือ wbraid ถ้ามี), landing path และ referrer host โดยล็อกเป็นชุดเดียวตั้งแต่หน้าแรกของ session',
              'ตัวชี้วัดความครบถ้วนของแบบฟอร์มและสถานะการส่งต่อระบบหลังบ้าน',
            ]} />
            สำหรับการป้องกันสแปมและความปลอดภัย endpoint จะสร้าง HMAC fingerprint จากข้อมูลเครือข่ายที่ระบบโฮสติ้งส่งต่อ โดยไม่เก็บ raw IP ไว้ใน RFQ ledger
          </Section>

          <Section title="2. วัตถุประสงค์ในการใช้ข้อมูล">
            เราใช้ข้อมูลเพื่อรับและจัดการคำขอ ติดต่อกลับ จัดทำใบเสนอราคาและติดตามงานขาย เชื่อมแหล่งที่มาของคำขอกับ CRM ป้องกันสแปม/การส่งซ้ำ รักษาความปลอดภัย ตรวจสอบเหตุขัดข้อง และวัดผลเว็บไซต์โดยไม่ส่งข้อมูล RFQ ที่ระบุตัวบุคคลไปยัง analytics
          </Section>

          <Section title="3. ฐานทางกฎหมายในการประมวลผล">
            เราอาศัยความยินยอมที่แสดงก่อนส่งแบบฟอร์ม การดำเนินการตามคำขอก่อนเข้าทำสัญญา ประโยชน์โดยชอบด้วยกฎหมายด้านความปลอดภัยและการบริหารงานขาย และหน้าที่ตามกฎหมายที่เกี่ยวข้อง ทั้งนี้คุณถอนความยินยอมได้โดยไม่กระทบการประมวลผลที่เกิดขึ้นอย่างชอบด้วยกฎหมายก่อนถอน
          </Section>

          <Section title="4. ระบบและผู้ให้บริการที่เกี่ยวข้อง">
            ข้อมูลถูกส่งจากเว็บไซต์ผ่าน Vercel และประมวลผลฝั่งเซิร์ฟเวอร์ โดยอาจจัดเก็บใน Supabase เพื่อเป็น RFQ ledger ส่งต่อไป Pipedrive เพื่อบริหาร CRM/การติดตามงานขาย และส่งผ่าน Formspree เพื่อแจ้งอีเมลแก่ทีมที่เกี่ยวข้อง ผู้ให้บริการเหล่านี้ได้รับข้อมูลเท่าที่จำเป็นตามหน้าที่และมาตรการของแต่ละระบบ เราไม่ขายข้อมูลส่วนบุคคลของคุณ
            ผู้ให้บริการอาจประมวลผลหรือจัดเก็บข้อมูลนอกประเทศไทยตามที่ตั้งของโครงสร้างพื้นฐานหรือผู้ประมวลผล โดยอยู่ภายใต้มาตรการที่เหมาะสมและข้อกำหนดกฎหมายที่ใช้บังคับ
          </Section>

          <Section title="5. Analytics และ Google Ads">
            GA4 ใช้สำหรับวัด page view และเหตุการณ์เชิงสรุป โดย event ของ RFQ ที่เรากำหนดไม่ส่งชื่อ บริษัท อีเมล เบอร์โทร lead_id, submission_id หรือ gclid/gbraid/wbraid ไปยัง GA4
            Google Analytics อาจประมวลผลข้อมูลทางเทคนิคมาตรฐานตามการตั้งค่าและนโยบายของ Google
            ณ เวอร์ชันประกาศนี้ ระบบยังไม่ส่งผลการขายหรือสถานะ RFQ เป็น Google Ads offline conversion หากมีการเปิดใช้ในอนาคต เราจะทบทวนประกาศและมาตรการที่เกี่ยวข้องก่อน
          </Section>

          <Section title="6. ระยะเวลาในการเก็บข้อมูล">
            เราเก็บข้อมูลตามระยะเวลาที่จำเป็นต่อการตอบคำขอ จัดทำและติดตามใบเสนอราคา รักษาหลักฐานทางธุรกิจ ป้องกันการทุจริต/เหตุขัดข้อง และปฏิบัติตามกฎหมาย เมื่อไม่มีวัตถุประสงค์หรือฐานกฎหมายรองรับแล้ว เราจะลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคลได้ โดยอาจต้องเก็บบางรายการต่อไปตามอายุความหรือข้อกำหนดทางบัญชี ภาษี และกฎหมาย
          </Section>

          <Section title="7. การรักษาความปลอดภัย">
            เราใช้การตรวจสอบ payload, same-origin boundary, server-only credentials, HMAC fingerprint, protected database access และรหัส submission สำหรับลดรายการซ้ำ อย่างไรก็ดีไม่มีระบบใดรับประกันความปลอดภัยได้ทั้งหมด หากสงสัยว่าข้อมูลมีปัญหา โปรดติดต่อเราทันที
          </Section>

          <Section title="8. สิทธิของเจ้าของข้อมูล">
            ภายใต้ PDPA และเงื่อนไขที่กฎหมายกำหนด คุณอาจขอเข้าถึงหรือรับสำเนา ขอแก้ไข ขอให้ลบ/ทำลาย/ทำให้ไม่ระบุตัวบุคคล ขอระงับหรือคัดค้านการใช้ ขอรับหรือโอนย้ายข้อมูล ถอนความยินยอม และร้องเรียนต่อหน่วยงานกำกับได้ เราอาจขอข้อมูลเพื่อยืนยันตัวตนก่อนดำเนินการ
          </Section>

          <Section title="9. ช่องทางติดต่อ">
            หากมีคำถามเกี่ยวกับนโยบายนี้ หรือต้องการใช้สิทธิของเจ้าของข้อมูล โปรดติดต่อ:
            <div style={{ marginTop: 12, padding: '14px 18px', background: 'var(--gp-cloud)', borderRadius: 10, fontSize: 13.5, color: 'var(--gp-navy)', lineHeight: 1.9 }}>
              {/* COMPANY_INFO — ข้อมูลบริษัทจดทะเบียน */}
              <div>บริษัท แพชชั่น โกร เทรดดิ้ง จำกัด</div>
              <div>เลขประจำตัวผู้เสียภาษี: 0105567196422</div>
              <div>ที่อยู่: 594/235 ถนนกาญจนาภิเษก แขวงบางไผ่ เขตบางแค กรุงเทพมหานคร 10160</div>
              <div>โทร: <a href={`tel:${site.phoneIntl}`} style={{ color: 'var(--gp-navy)' }}>{site.phone}</a></div>
              <div>อีเมล: <a href={`mailto:${site.email}`} style={{ color: 'var(--gp-navy)' }}>{site.email}</a></div>
            </div>
          </Section>

          <p style={{ color: 'var(--gp-grey)', fontSize: 12.5, marginTop: 28 }}>
            เวอร์ชันความยินยอม: privacy-2026-08-28 · ปรับปรุงล่าสุด: 28 สิงหาคม 2569 · <Link to="/quote" style={{ color: 'var(--gp-navy)' }}>กลับไปขอใบเสนอราคา</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: '8px 0 10px 20px', padding: 0 }}>
      {items.map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
    </ul>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 26 }}>
      <h2 style={{ fontSize: 17, color: 'var(--gp-navy)', fontFamily: 'var(--gp-font-head)', marginBottom: 8 }}>{title}</h2>
      <div style={{ color: 'var(--gp-grey)', fontSize: 14, lineHeight: 1.85 }}>{children}</div>
    </div>
  );
}
