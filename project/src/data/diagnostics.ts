export type CheckState = 'pending' | 'running' | 'passed' | 'issue' | 'fixing' | 'fixed';

export interface DiagnosticCheck {
  id: string;
  title: string;
  scanningText: string;
  passed: boolean;
  result: string;
  fix: string | null;
}

export const DIAGNOSTIC_CHECKS: DiagnosticCheck[] = [
  {
    id: 'dhcp',
    title: 'الأجهزة غير المصرّح بها وتعارض العناوين',
    scanningText: 'جارٍ البحث عن خوادم DHCP غير مصرّح بها وعناوين IP مكررة...',
    passed: true,
    result: 'الراوتر هو الجهاز الوحيد الذي يوزّع العناوين. لا يوجد تعارض في عناوين IP.',
    fix: null,
  },
  {
    id: 'dns',
    title: 'تسريب DNS وزمن الاستجابة',
    scanningText: 'جارٍ إرسال استعلامات اختبار وقياس زمن استجابة الخادم...',
    passed: false,
    result: 'بعض الاستعلامات تتجاوز خادم DNS الذي اخترته. متوسط زمن الاستجابة 84 ms.',
    fix: 'توجيه جميع الأجهزة عبر خادم Cloudflare DNS (1.1.1.1) ومنع التسريب.',
  },
  {
    id: 'channel',
    title: 'تداخل قناة الواي فاي',
    scanningText: 'جارٍ فحص الشبكات المجاورة وازدحام القنوات...',
    passed: false,
    result: 'القناة 6 تتداخل مع 4 شبكات مجاورة. القناة 11 هي الأقل ازدحاماً.',
    fix: 'نقل الواي فاي إلى القناة 11.',
  },
  {
    id: 'ports',
    title: 'تدقيق أمان المنافذ',
    scanningText: 'جارٍ فحص منافذ الإدارة غير المشفّرة...',
    passed: false,
    result: 'تم العثور على منافذ إدارة مفتوحة: HTTP (80) وTelnet (23).',
    fix: 'إغلاق منافذ الإدارة HTTP وTelnet.',
  },
];
