# البدء مع "سحب" (Sahb)

سحب هو قالب مدونة مطوّرين ثنائي اللغة (عربي/إنجليزي) مبني بـ React وTypeScript وVite، مع تصميم نظيف، سرعة عالية، وتحسينات SEO. يتيح لك نشر مدونتك التقنية بسرعة مع تبديل اللغة والاتجاه (RTL/LTR) وزر تبديل السمة (فاتح/داكن).

English readers: bilingual content is provided inline. Look for English sections and code snippets throughout.

---

## نظرة عامة | Overview

- ثنائي اللغة: واجهة عربية (RTL) وإنجليزية (LTR) مع تبديل لحظي.
- سرعة وأداء: مبني عبر Vite وTailwind CSS وتمييز للأكواد عبر highlight.js.
- كتابة المحتوى: تدوينات داخل `template.json` وصفحات Markdown ديناميكية من `client/src/data/*.md`.
- تحسينات SEO: عناوين وأوصاف ديناميكية عبر `react-helmet-async`.
- شريط إنجازات تفاعلي في التذييل.

---

## المتطلبات | Prerequisites

- Node.js 18+ (موصى به 20)
- npm 9+
- Git (للاستنساخ والنشر)

تحقق من الإصدارات:

```
node -v
npm -v
```

---

## التثبيت والتشغيل محليًا | Install & Run Locally

1) استنساخ المشروع | Clone

```
git clone https://github.com/ShulkwiSEC/shulkwisec.github.io.git
cd shulkwisec.github.io
```

2) تثبيت الاعتمادات | Install dependencies

```
npm install
```

3) تشغيل خادم التطوير | Start dev server

```
npm run dev
```

Vite سيعمل على منفذ افتراضي مثل `http://localhost:5173` (قد يختلف حسب بيئتك). راقب مخرجات الطرفية لمعرفة الرابط الصحيح.

---

## بنية المشروع | Project Structure

أهم المجلدات والملفات:

```
client/
  public/                  # أصول عامة (favicon، أيقونات، 404.html)
  src/
    components/            # مكونات React (Header/Footer/Blog/... + shadcn/ui)
    contexts/              # LanguageContext (ar/en) + ThemeContext (dark/light)
    data/                  # ملفات المحتوى (template.json + *.md)
    hooks/, lib/           # خطافات وأدوات مساعدة
    pages/                 # صفحات (SimpleBlog, BlogPost, About, MarkdownPage)
    App.tsx, main.tsx, index.css
vite.config.ts             # إعدادات Vite (تطوير)
vite.config.github.ts      # إعدادات Vite للنشر على GitHub Pages
tailwind.config.ts         # إعداد Tailwind
postcss.config.js          # إعداد PostCSS
package.json               # السكربتات والاعتمادات
.github/workflows/deploy.yml# سير عمل GitHub Pages
```

---

## الإعداد المركزي (template.json) | Central Config

الملف: `client/src/data/template.json`

يحتوي على:

- `site`: عنوان، وصف، روابط صفحات Markdown، ومسارات السحب (Swipe) بين الصفحات.
- `owner`: بيانات المالك وروابط التواصل الاجتماعي.
- `about`: العناوين، النص، والمهارات وروابط التواصل لصفحة "حول".
- `achievements`: مصفوفة من الإنجازات تظهر في شريط التذييل.
- `blog.posts`: مصفوفة تدوينات (المصدر الأساسي لمدونة الصفحة الرئيسية).

مثال مبسط لـ `blog.posts`:

```json
{
  "blog": {
    "posts": [
      {
        "id": "my-first-post",
        "date": "January 1, 2025",
        "title": { "ar": "أول تدوينة", "en": "First Post" },
        "excerpt": { "ar": "ملخص قصير", "en": "Short excerpt" },
        "content": "BASE64_OR_PLAINTEXT",
        "encoding": true,
        "banner": "https://.../banner.png",
        "tags": ["React", "TypeScript"]
      }
    ]
  }
}
```

ملاحظات مهمة:

- `encoding`: إذا كانت `true` أو غير مذكورة، سيتوقع النظام أن `content` Base64 وسيقوم بفك التشفير تلقائيًا. ضع `false` إذا كان `content` نصًا عاديًا (Markdown).
- العنوان الظاهر في قائمة التدوينات يُجمع كـ `ar + " | " + en` وفق الكود الحالي.

تحويل نص Markdown إلى Base64 (اختياري) من الطرفية:

```
# macOS/Linux
base64 -w0 post.md

# PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw post.md)))
```

ألصق الناتج داخل حقل `content` إذا كنت تستخدم `encoding: true`.

---

## صفحات Markdown ديناميكية | Dynamic Markdown Pages

- ضع ملفات Markdown في: `client/src/data/` مثل: `resume.md`, `experience.md`, `vision.md`.
- أضف روابطها إلى قائمة الملاحة عبر `site.external` في `template.json`:

```json
{
  "site": {
    "external": [
      { "name": {"ar": "السيرة الذاتية", "en": "Resume"}, "url": "/page/resume" }
    ]
  }
}
```

- عند زيارة `/page/<slug>` يحمّل المكون `MarkdownPage` الملف الخام `@/data/<slug>.md?raw` ويعرضه مع تمييز الأكواد وزر نسخ تلقائي لأكواد `pre > code`.

---

## اللغة والسمة | Language & Theme

- تبديل اللغة: من شريط العنوان عبر زر الكرة الأرضية. يتم ضبط `lang` و`dir` على عنصر `<html>` وحفظ الاختيار في `localStorage`.
- تبديل السمة: زر الشمس/القمر يبدّل بين `light` و`dark` ويضيف الصنف الموافق إلى `<html>`، مع حفظ الاختيار في `localStorage`.

الملفات ذات الصلة: `client/src/contexts/LanguageContext.tsx`, `client/src/contexts/ThemeContext.tsx`.

---

## النشر على GitHub Pages | Deploy to GitHub Pages

1) ضبط المسار الأساسي | Base path

- مستودع مستخدم/منظمة (مثل `shulkwisec.github.io`): اجعل `base` في `vite.config.github.ts` يساوي `'/'`.
- مستودع مشروع (مثل `my-blog`): عيّن `base: '/my-blog/'`.

2) بناء وإرسال | Build & Push

```
npm run build
git add -A && git commit -m "build: site" && git push
```

3) صفحات GitHub | GitHub Pages

- الملف `./.github/workflows/deploy.yml` يَبني تلقائيًا ويرفع ناتج `./dist/public`.
- فعّل Pages من إعدادات المستودع (Environment: `github-pages`).

---

## استكشاف الأخطاء | Troubleshooting

- الصفحة فارغة بعد البناء: تأكد من ضبط `base` الصحيح في `vite.config.github.ts`.
- اللغة العربية تظهر بأحرف غريبة داخل `template.json`: احفظ الملف بترميز UTF‑8.
- Markdown لا يُحمّل: تأكد من وجود الملف `client/src/data/<slug>.md` وأن الرابط `/page/<slug>` مضبوط في `site.external`.
- المنفذ غير 5000: يستخدم Vite منفذًا افتراضيًا (غالبًا 5173). استخدم العنوان الظاهر في الطرفية.

---

## جاهز؟ | You’re Ready!

ابدأ بتحرير `client/src/data/template.json` وملفات Markdown، ثم شغّل `npm run dev` لتعاين مدونتك فورًا. عند الرضا، ادفع التغييرات ليتم نشرها عبر GitHub Pages تلقائيًا.
