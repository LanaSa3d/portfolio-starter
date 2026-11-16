// Language layer: English (default) and Arabic with full right-to-left layout.
// UI strings live here; CV content lives in src/data/cv.js (+ cv.ar.js for Arabic).
import React from 'react'

export const LANG_KEY = 'yara_lang';

const STRINGS = {
  en: {
    'nav.about': 'About', 'nav.work': 'Work', 'nav.experience': 'Experience', 'nav.research': 'Research',
    'nav.speaking': 'Speaking', 'nav.awards': 'Awards', 'nav.contact': 'Contact',
    'nav.skip': 'Skip to content', 'nav.home': '{name}, home', 'nav.openMenu': 'Open menu', 'nav.closeMenu': 'Close menu',
    'nav.dark': 'Switch to dark theme', 'nav.light': 'Switch to light theme', 'nav.cv': 'CV ↓', 'nav.cvLong': 'Download CV ↓',
    'nav.lang': 'العربية', 'nav.langLabel': 'Switch to Arabic',
    'about.eyebrow': 'about', 'about.cta': 'See her work ↓', 'about.cv': 'Download CV',
    'about.now': 'Now', 'about.based': 'Based in', 'about.education': 'Education', 'about.languages': 'Languages', 'about.since': 'since {date}',
    'highlights.eyebrow': 'career highlights', 'highlights.title': 'Career highlights',
    'projects.eyebrow': 'selected projects', 'projects.title': 'Selected', 'projects.accent': 'work',
    'projects.intro': '{count} projects, each told as problem → action → result. Open any one for the full case study.',
    'projects.all': 'All work', 'projects.product': 'Products', 'projects.system': 'Design systems & tools', 'projects.research': 'Research',
    'projects.filter': 'Filter projects', 'projects.mobile': 'Mobile', 'projects.web': 'Web', 'projects.clear': 'Clear {name} filter',
    'projects.none': 'No projects match this filter.', 'projects.read': 'Read the case study →', 'projects.tile': 'Case study →',
    'projects.openGallery': 'Open {name} gallery',
    'label.problem': 'Problem', 'label.action': 'Action', 'label.result': 'Result',
    'exp.eyebrow': 'professional experience', 'exp.title': 'Sixteen years,', 'exp.accent': 'two directions',
    'exp.intro': 'From junior web developer in Riyadh to Principal Product Engineer, by way of London, two startups and a PhD.',
    'kind.founder': 'Co-founder', 'kind.break': 'Career break', 'kind.research': 'Research',
    'research.eyebrow': 'research & education', 'research.title': 'A PhD on', 'research.accent': 'Arabic interfaces',
    'research.education': 'Education', 'research.patents': 'Patents', 'research.publications': 'Publications',
    'research.related': 'Related project →', 'research.fullList': 'Full list:',
    'speaking.eyebrow': 'speaking & media', 'speaking.title': 'On stage,', 'speaking.accent': 'on screen', 'speaking.media': 'Media', 'speaking.open': 'Open ↗',
    'talk.Keynote': 'Keynote', 'talk.Talk': 'Talk', 'talk.Panel': 'Panel',
    'lead.eyebrow': 'leadership, teaching & volunteering', 'lead.title': 'Teaching and', 'lead.accent': 'giving back',
    'rec.eyebrow': 'awards & certifications', 'rec.title': 'Recognition',
    'rec.intro': '{count} awards, from a graduation project in 2010 to Design Technology Leader of the Year in 2025.',
    'rec.certs': 'Certifications', 'rec.filter': 'Filter certifications by status', 'rec.project': 'project →',
    'cert.name': 'Certification', 'cert.issuer': 'Issuer', 'cert.year': 'Year', 'cert.status': 'Status', 'cert.id': 'Credential ID',
    'status.All': 'All', 'status.Active': 'Active', 'status.Lifetime': 'Lifetime', 'status.Expired': 'Expired', 'status.ExpiredYear': 'Expired {year}', 'status.In progress': 'In progress',
    'skills.eyebrow': 'core skills', 'skills.title': 'What she', 'skills.accent': 'works with', 'skills.intro': 'Ten skill areas, with level and years of practice.',
    'skills.years': '{n} years', 'level.Expert': 'Expert', 'level.Advanced': 'Advanced', 'level.Intermediate': 'Intermediate',
    'contact.eyebrow': 'contact', 'contact.title': 'Let’s', 'contact.accent': 'talk', 'contact.email': 'Send an email',
    'contact.languages': 'Languages', 'contact.offclock': 'Off the clock',
    'footer.note': 'Portfolio Summit 2026 · built from a fictional CV provided by the organizers',
    'modal.close': 'Close dialog', 'modal.education': 'Education', 'modal.awards': 'Awards and patents', 'modal.honors': 'honors',
    'modal.patents': 'Patents', 'modal.certs': '{count} certifications', 'modal.certsEyebrow': 'certifications',
    'modal.speaking': 'Talks and media', 'modal.stage': 'on stage', 'modal.profiles': 'Find {name} online', 'modal.profilesEyebrow': 'profiles',
    'modal.offclock': 'Interests and languages', 'modal.offclockEyebrow': 'off the clock',
    'case.eyebrow': 'case study · {org}', 'case.role': 'Role', 'case.team': 'Team', 'case.when': 'When', 'case.where': 'Where',
    'case.home': 'Home', 'case.work': 'Work', 'case.story': 'Problem, action and result', 'case.numbers': 'Key numbers',
    'case.tech': 'Technologies', 'case.gallery': 'Gallery', 'case.disclaimer': 'Illustrative screens recreated for this portfolio.',
    'case.more': 'More projects', 'case.prev': '← Previous', 'case.next': 'Next →', 'case.openImage': 'Open image: {caption}',
    'nf.title': 'This page took a', 'nf.accent': 'wrong turn', 'nf.intro': 'The link may be old, or the page never existed.',
    'nf.home': 'Back to the desk', 'nf.work': 'See the work',
    'meta.home': '{name} | {title}', 'meta.homeDesc': '{full}: {titles} in {location}. Design systems, Arabic-first interfaces and products used by over 9 million people.',
    'desk.hello': 'hello', 'desk.download': 'download', 'desk.education': 'education', 'desk.currently': 'currently', 'desk.stack': 'stack',
    'desk.contact': 'contact', 'desk.honors': 'honors', 'desk.certs': 'certifications', 'desk.projects': 'projects', 'desk.customize': 'customize',
    'desk.cvTitle': 'Her CV', 'desk.downloadPdf': '↓ Download PDF', 'desk.cvLine2': 'PhD · 16 years · {city}', 'desk.since': 'since {date}',
    'desk.edu': ['PhD, Human-Computer Interaction', '{school}', '{award}', 'MSc Interaction Design, Distinction', 'BSc Computer Science, First Class'],
    'desk.stackItems': ['figma · design systems', 'react · next.js · ts', 'wcag 2.2 · rtl a11y', 'node · graphql', 'react native', '{n} skill areas →'],
    'desk.links': 'click for links →', 'desk.awards': '{n} awards', 'desk.patents': '{n} patents · 1 granted', 'desk.top40': 'Top 40 Under 40, 2023',
    'desk.fullList': 'click for the full list →', 'desk.more': '+ {n} more · view all →',
    'desk.onStage': 'on stage', 'desk.talks': '{n} talks', 'desk.keynote': 'keynote · {year} →', 'desk.projectsN': '{n} projects', 'desk.open': 'click to open →',
    'desk.tweaks': 'tweaks', 'desk.tweaksAction': 'palette · screens →',
    'desk.board': "{name}'s desk", 'desk.hint': '↑ click a pinned note or anything on the desk · scroll for the full story ↓',
    'desk.intro': 'Click the pinned notes or anything on the desk.', 'desk.introLabel': 'INTERACTIVE SCENE',
  },
  ar: {
    'nav.about': 'نبذة', 'nav.work': 'الأعمال', 'nav.experience': 'الخبرات', 'nav.research': 'البحث',
    'nav.speaking': 'المحاضرات', 'nav.awards': 'الجوائز', 'nav.contact': 'التواصل',
    'nav.skip': 'انتقل إلى المحتوى', 'nav.home': '{name}، الصفحة الرئيسية', 'nav.openMenu': 'فتح القائمة', 'nav.closeMenu': 'إغلاق القائمة',
    'nav.dark': 'التبديل إلى الوضع الداكن', 'nav.light': 'التبديل إلى الوضع الفاتح', 'nav.cv': 'السيرة ↓', 'nav.cvLong': 'تحميل السيرة الذاتية ↓',
    'nav.lang': 'English', 'nav.langLabel': 'التبديل إلى الإنجليزية',
    'about.eyebrow': 'نبذة', 'about.cta': 'استعرض أعمالها ↓', 'about.cv': 'تحميل السيرة الذاتية',
    'about.now': 'حاليًا', 'about.based': 'المقر', 'about.education': 'التعليم', 'about.languages': 'اللغات', 'about.since': 'منذ {date}',
    'highlights.eyebrow': 'أبرز المحطات', 'highlights.title': 'أبرز المحطات المهنية',
    'projects.eyebrow': 'مشاريع مختارة', 'projects.title': 'أعمال', 'projects.accent': 'مختارة',
    'projects.intro': '{count} مشاريع، يُروى كلٌّ منها على هيئة مشكلة ← إجراء ← نتيجة. افتح أيًّا منها لقراءة دراسة الحالة كاملة.',
    'projects.all': 'كل الأعمال', 'projects.product': 'منتجات', 'projects.system': 'أنظمة تصميم وأدوات', 'projects.research': 'بحث',
    'projects.filter': 'تصفية المشاريع', 'projects.mobile': 'الجوال', 'projects.web': 'الويب', 'projects.clear': 'إزالة تصفية {name}',
    'projects.none': 'لا توجد مشاريع تطابق هذه التصفية.', 'projects.read': 'اقرأ دراسة الحالة ←', 'projects.tile': 'دراسة الحالة ←',
    'projects.openGallery': 'فتح معرض {name}',
    'label.problem': 'المشكلة', 'label.action': 'الإجراء', 'label.result': 'النتيجة',
    'exp.eyebrow': 'الخبرة المهنية', 'exp.title': 'ستة عشر عامًا،', 'exp.accent': 'وفي الاتجاهين',
    'exp.intro': 'من مطوّرة ويب مبتدئة في الرياض إلى مهندسة منتجات رئيسية، مرورًا بلندن وشركتين ناشئتين ودرجة الدكتوراه.',
    'kind.founder': 'شريكة مؤسِّسة', 'kind.break': 'استراحة مهنية', 'kind.research': 'بحث',
    'research.eyebrow': 'البحث والتعليم', 'research.title': 'دكتوراه في', 'research.accent': 'الواجهات العربية',
    'research.education': 'التعليم', 'research.patents': 'براءات الاختراع', 'research.publications': 'المنشورات',
    'research.related': 'المشروع المرتبط ←', 'research.fullList': 'القائمة الكاملة:',
    'speaking.eyebrow': 'المحاضرات والإعلام', 'speaking.title': 'على المنصة', 'speaking.accent': 'وعلى الشاشة', 'speaking.media': 'الإعلام', 'speaking.open': 'فتح ↗',
    'talk.Keynote': 'كلمة رئيسية', 'talk.Talk': 'محاضرة', 'talk.Panel': 'جلسة حوارية',
    'lead.eyebrow': 'القيادة والتدريس والتطوع', 'lead.title': 'التدريس', 'lead.accent': 'والعطاء',
    'rec.eyebrow': 'الجوائز والشهادات', 'rec.title': 'التقدير',
    'rec.intro': '{count} جوائز، من مشروع التخرج في 2010 إلى جائزة قائدة تقنيات التصميم للعام في 2025.',
    'rec.certs': 'الشهادات المهنية', 'rec.filter': 'تصفية الشهادات حسب الحالة', 'rec.project': 'المشروع ←',
    'cert.name': 'الشهادة', 'cert.issuer': 'الجهة المانحة', 'cert.year': 'السنة', 'cert.status': 'الحالة', 'cert.id': 'رقم الاعتماد',
    'status.All': 'الكل', 'status.Active': 'سارية', 'status.Lifetime': 'مدى الحياة', 'status.Expired': 'منتهية', 'status.ExpiredYear': 'منتهية {year}', 'status.In progress': 'قيد الإنجاز',
    'skills.eyebrow': 'المهارات الأساسية', 'skills.title': 'أدواتها', 'skills.accent': 'ومهاراتها', 'skills.intro': 'عشرة مجالات مهارية، مع المستوى وسنوات الممارسة.',
    'skills.years': '{n} سنة', 'level.Expert': 'خبيرة', 'level.Advanced': 'متقدمة', 'level.Intermediate': 'متوسطة',
    'contact.eyebrow': 'التواصل', 'contact.title': 'لنبدأ', 'contact.accent': 'الحديث', 'contact.email': 'أرسل بريدًا إلكترونيًا',
    'contact.languages': 'اللغات', 'contact.offclock': 'خارج أوقات العمل',
    'footer.note': 'قمة الملفات المهنية 2026 · مبني على سيرة ذاتية خيالية قدّمها المنظمون',
    'modal.close': 'إغلاق النافذة', 'modal.education': 'التعليم', 'modal.awards': 'الجوائز وبراءات الاختراع', 'modal.honors': 'التكريم',
    'modal.patents': 'براءات الاختراع', 'modal.certs': '{count} شهادة مهنية', 'modal.certsEyebrow': 'الشهادات',
    'modal.speaking': 'المحاضرات والإعلام', 'modal.stage': 'على المنصة', 'modal.profiles': 'حسابات {name}', 'modal.profilesEyebrow': 'الحسابات',
    'modal.offclock': 'الاهتمامات واللغات', 'modal.offclockEyebrow': 'خارج أوقات العمل',
    'case.eyebrow': 'دراسة حالة · {org}', 'case.role': 'الدور', 'case.team': 'الفريق', 'case.when': 'المدة', 'case.where': 'الجهة',
    'case.home': 'الرئيسية', 'case.work': 'الأعمال', 'case.story': 'المشكلة والإجراء والنتيجة', 'case.numbers': 'أرقام رئيسية',
    'case.tech': 'التقنيات', 'case.gallery': 'المعرض', 'case.disclaimer': 'شاشات توضيحية أُعيد تصميمها لهذا الملف.',
    'case.more': 'مشاريع أخرى', 'case.prev': '→ السابق', 'case.next': 'التالي ←', 'case.openImage': 'فتح الصورة: {caption}',
    'nf.title': 'يبدو أن هذه الصفحة', 'nf.accent': 'ضلّت طريقها', 'nf.intro': 'ربما يكون الرابط قديمًا، أو أن الصفحة غير موجودة.',
    'nf.home': 'العودة إلى المكتب', 'nf.work': 'استعرض الأعمال',
    'meta.home': '{name} | {title}', 'meta.homeDesc': '{full}: {titles} في {location}. أنظمة تصميم وواجهات عربية أولًا ومنتجات يستخدمها أكثر من 9 ملايين شخص.',
    'desk.hello': 'مرحبًا', 'desk.download': 'تحميل', 'desk.education': 'التعليم', 'desk.currently': 'حاليًا', 'desk.stack': 'المهارات',
    'desk.contact': 'التواصل', 'desk.honors': 'التكريم', 'desk.certs': 'الشهادات', 'desk.projects': 'المشاريع', 'desk.customize': 'التخصيص',
    'desk.cvTitle': 'سيرتها الذاتية', 'desk.downloadPdf': '↓ تحميل PDF', 'desk.cvLine2': 'دكتوراه · 16 عامًا · {city}', 'desk.since': 'منذ {date}',
    'desk.edu': ['دكتوراه في التفاعل بين الإنسان والحاسوب', '{school}', '{award}', 'ماجستير تصميم التفاعل، بامتياز', 'بكالوريوس علوم الحاسب، مرتبة الشرف الأولى'],
    'desk.stackItems': ['figma · أنظمة التصميم', 'react · next.js · ts', 'wcag 2.2 · وصول RTL', 'node · graphql', 'react native', '{n} مجالات مهارية ←'],
    'desk.links': 'اضغط لعرض الروابط ←', 'desk.awards': '{n} جوائز', 'desk.patents': 'براءتا اختراع · واحدة ممنوحة', 'desk.top40': 'أفضل 40 تحت 40، 2023',
    'desk.fullList': 'اضغط للقائمة الكاملة ←', 'desk.more': '+ {n} أخرى · عرض الكل ←',
    'desk.onStage': 'على المنصة', 'desk.talks': '{n} محاضرة', 'desk.keynote': 'كلمة رئيسية · {year} ←', 'desk.projectsN': '{n} مشاريع', 'desk.open': 'اضغط للفتح ←',
    'desk.tweaks': 'التخصيص', 'desk.tweaksAction': 'الألوان · الشاشات ←',
    'desk.board': 'مكتب {name}', 'desk.hint': '↑ اضغط على أي ورقة أو أي شيء على المكتب · مرّر لقراءة القصة كاملة ↓',
    'desk.intro': 'اضغط على الأوراق المثبّتة أو على أي شيء فوق المكتب.', 'desk.introLabel': 'مشهد تفاعلي',
  },
};

const MONTHS_AR = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو', Jun: 'يونيو',
  Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر',
};

// "Sep 2023 – Present" → "سبتمبر 2023 – حتى الآن"
export function localizeDates(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTHS_AR[m])
    .replace(/\bPresent\b/g, 'حتى الآن');
}

// Merges translated strings onto the English structure (arrays merge item by item),
// so ids, links, numbers and slugs always come from the English source.
export function deepMerge(base, over) {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    return base.map((item, i) => deepMerge(item, over[i]));
  }
  if (base && typeof base === 'object') {
    if (typeof over !== 'object') return base;
    const out = { ...base };
    Object.keys(over).forEach((k) => { out[k] = deepMerge(base[k], over[k]); });
    return out;
  }
  return typeof over === typeof base || base === undefined ? over : base;
}

function readLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (_) {}
  return 'en';
}

const LangContext = React.createContext({ lang: 'en', dir: 'ltr', t: (k) => k, setLang: () => {} });

export function LangProvider({ children, initial }) {
  const [lang, setLangState] = React.useState(() => initial || readLang());

  React.useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = React.useCallback((next) => {
    try { localStorage.setItem(LANG_KEY, next); } catch (_) {}
    setLangState(next);
  }, []);

  const t = React.useCallback((key, vars) => {
    const raw = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    const fill = (s) => (typeof s === 'string' && vars ? s.replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? '')) : s);
    return Array.isArray(raw) ? raw.map(fill) : fill(raw);
  }, [lang]);

  const value = React.useMemo(() => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t, setLang }), [lang, t, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return React.useContext(LangContext);
}

// Human-readable certification status in the current language.
export function statusLabel(status, t) {
  const expired = /^Expired (\d{4})$/.exec(status);
  if (expired) return t('status.ExpiredYear', { year: expired[1] });
  return t('status.' + status);
}
