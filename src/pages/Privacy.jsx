// ============================================================
// GO PREMIUM — /privacy  Privacy Policy (PDPA)
// Thai-language privacy notice compliant with พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล
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
        <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(22px,3.5vw,44px)', boxShadow: 'var(--gp-shadow)', maxWidth: 860 }}>
          <p style={{ color: 'var(--gp-grey)', fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
            {site.legalName} (“{site.brand}”, “เรา”) เคารพความเป็นส่วนตัวของคุณ และมุ่งมั่นคุ้มครองข้อมูลส่วนบุคคลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            นโยบายฉบับนี้อธิบายว่าเราเก็บ ใช้ และเปิดเผยข้อมูลของคุณอย่างไร และคุณมีสิทธิอะไรบ้าง
          </p>

          <Section title="1. ข้อมูลที่เราเก็บรวบรวม">
            เมื่อคุณติดต่อหรือขอใบเสนอราคา เราจะเก็บข้อมูลที่คุณให้ไว้โดยตรง ได้แก่ ชื่อ-นามสกุล ชื่อบริษัท/องค์กร อีเมล เบอร์โทรศัพท์
            รายละเอียดความต้องการ (โอกาส จำนวน งบประมาณ วันที่ต้องการรับงาน) และข้อความอื่น ๆ ที่คุณระบุในแบบฟอร์ม
            นอกจากนี้ระบบอาจเก็บข้อมูลทางเทคนิคโดยอัตโนมัติ เช่น ที่อยู่ IP ประเภทอุปกรณ์ และพฤติกรรมการใช้งานเว็บไซต์ผ่านคุกกี้/analytics
          </Section>

          <Section title="2. วัตถุประสงค์ในการใช้ข้อมูล">
            เราใช้ข้อมูลของคุณเพื่อ: ติดต่อกลับและจัดทำใบเสนอราคา ตอบคำถามและให้บริการ ปรับปรุงสินค้าและประสบการณ์การใช้งานเว็บไซต์
            ส่งข้อมูลข่าวสารหรือโปรโมชันที่เกี่ยวข้อง (เฉพาะกรณีที่คุณยินยอม) และปฏิบัติตามข้อกำหนดทางกฎหมาย
          </Section>

          <Section title="3. ฐานทางกฎหมายในการประมวลผล">
            เราประมวลผลข้อมูลของคุณบนฐาน “ความยินยอม” ที่คุณให้ไว้เมื่อส่งแบบฟอร์ม ฐาน “การดำเนินการตามสัญญา” หรือก่อนเข้าทำสัญญา (เช่น การจัดทำใบเสนอราคา)
            ฐาน “ประโยชน์โดยชอบด้วยกฎหมาย” ในการพัฒนาบริการ และฐาน “หน้าที่ตามกฎหมาย” ที่เกี่ยวข้อง
          </Section>

          <Section title="4. ระยะเวลาในการเก็บข้อมูล">
            เราเก็บข้อมูลส่วนบุคคลของคุณไว้เท่าที่จำเป็นตามวัตถุประสงค์ข้างต้น โดยทั่วไปไม่เกิน 2 ปีนับจากการติดต่อครั้งล่าสุด
            หรือตามระยะเวลาที่กฎหมายกำหนด เมื่อพ้นกำหนดเราจะลบหรือทำให้ข้อมูลไม่สามารถระบุตัวตนได้
          </Section>

          <Section title="5. การเปิดเผยข้อมูลต่อบุคคลที่สาม">
            เราไม่ขายข้อมูลส่วนบุคคลของคุณ เราอาจเปิดเผยข้อมูลให้ผู้ให้บริการที่ช่วยดำเนินงานแทนเรา เช่น ผู้ให้บริการรับส่งแบบฟอร์ม (Formspree)
            ผู้ให้บริการอีเมล ระบบ analytics และผู้ผลิต/จัดส่งสินค้า เฉพาะเท่าที่จำเป็น และภายใต้ข้อตกลงรักษาความลับ
            หรือเปิดเผยเมื่อมีหน้าที่ตามกฎหมาย
          </Section>

          <Section title="6. สิทธิของเจ้าของข้อมูล">
            ภายใต้ PDPA คุณมีสิทธิ: เข้าถึงและขอสำเนาข้อมูล ขอแก้ไขข้อมูลให้ถูกต้อง ขอลบหรือทำลายข้อมูล ขอคัดค้านหรือระงับการใช้ข้อมูล
            ขอให้โอนย้ายข้อมูล และเพิกถอนความยินยอมได้ทุกเมื่อ โดยติดต่อเราตามช่องทางด้านล่าง
          </Section>

          <Section title="7. คุกกี้และ Analytics">
            เว็บไซต์ของเราอาจใช้คุกกี้และเครื่องมือวิเคราะห์ (เช่น Google Analytics) เพื่อทำความเข้าใจการใช้งานและปรับปรุงประสบการณ์
            คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่บางฟังก์ชันของเว็บไซต์อาจทำงานได้ไม่สมบูรณ์
          </Section>

          <Section title="8. ช่องทางติดต่อ">
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
            ปรับปรุงล่าสุด: มิถุนายน 2569 · <Link to="/quote" style={{ color: 'var(--gp-navy)' }}>กลับไปขอใบเสนอราคา</Link>
          </p>
        </div>
      </div>
    </div>
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
