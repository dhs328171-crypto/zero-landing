# ZERO — Software Architect Solutions

موقع شخصي احترافي لمطور Full Stack — Frontend + Backend كامل مع لوحة تحكم متكاملة.

## 🆕 الميزات الجديدة في هذا التحديث (v5.0 — Security & Admin Tools)

### 🔐 إدارة المستخدمين وكلمات المرور (صفحة /admin/users جديدة)
- صفحة كاملة لعرض كل المستخدمين المسجلين مع البريد، الهاتف، آخر دخول، الـ IP، حالة القفل
- **عرض كلمة المرور**: كل كلمة مرور تُخزَّن في خزنة AES-256-GCM مشفّرة (vault)، يمكن للأدمن فك تشفيرها لاسترجاعها عند نسيان العميل
- **إعادة تعيين كلمة المرور**: توليد كلمة عشوائية آمنة (14 حرف) وتحديث الـ hash + الـ vault
- **قفل/فك قفل الحساب** يدوياً
- **تغيير الدور** (user ↔ admin)
- **سجل الدخول** لكل مستخدم (آخر 30 محاولة مع IP والـ User-Agent)
- **حذف الحساب** (مع حماية حساب الأدمن الرئيسي من الحذف)
- كل عملية عرض/إعادة تعيين **تُسجَّل في الـ Audit Log** مع الـ IP والوقت

### 🔗 تمويه الروابط (Link Mask) — صفحة /admin/link-mask جديدة
- أنشئ روابط قصيرة على موقعك تخفي الروابط الأصلية الطويلة أو القبيحة
- مثال: `/r/github` ← `https://github.com/...` ، `/r/wa` ← `https://wa.me/...`
- **حماية بكلمة مرور** اختيارية (bcrypt)
- **تاريخ انتهاء صلاحية** اختياري
- **عدّاد نقرات** لكل رابط
- صفحة تحويل جميلة (interstitial) تعرض شعار الموقع قبل التحويل
- إدارة كاملة: إنشاء، تعديل، حذف، تفعيل/تعطيل، تصفير العداد

### 🛡️ لوحة الأمان والمراقبة (صفحة /admin/security جديدة)
- **نظرة عامة**: إحمالي المستخدمين، الحسابات المقفلة، IPs المحظورة، محاولات فاشلة، دخول ناجح، أحداث حرجة
- **رسم بياني** لاتجاه الدخول (نجح/فشل) خلال آخر 7 أيام
- **أكثر IPs فشلاً** في آخر 24 ساعة
- **محاولات الدخول**: قائمة كاملة بفلتر (الكل/ناجحة/فاشلة)
- **IPs المحظورة**: حظر يدوي + فك حظر + سبب وتاريخ
- **سجل التدقيق (Audit Log)**: كل إجراءات الأدمن (عرض كلمة مرور، إعادة تعيين، إنشاء رابط، حظر IP، إلخ) مع فلترة حسب النوع
- **الأحداث الأمنية**: محاولات حقن، تجاوز Rate Limit، حظر تلقائي، إلخ

### 🔒 حماية متعددة الطبقات
- **helmet**: secure HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **Rate limiting** على 4 مستويات:
  - `/api/auth/*`: 10 محاولات / 15 دقيقة (ضد brute-force)
  - `/api/messages`: 5 رسائل / ساعة (ضد spam)
  - `/api/*` (عام): 120 طلب / دقيقة
  - `/api/link-mask/r/*`: 30 تحويل / دقيقة
- **HTTP Parameter Pollution (hpp)** protection
- **express-mongo-sanitize**: NoSQL injection protection
- **sanitizeBody**: كشف محاولات SQL injection و XSS بحسب الأنماط الشائعة (Union Select, Insert Into, `<script>`, `javascript:`, `onerror=`, إلخ)
- **Account lockout**: بعد 5 محاولات فاشلة، يُقفل الحساب لمدة 15 دقيقة
- **IP auto-ban**: بعد 20 محاولة فاشلة من نفس IP في ساعة، يُحظر الـ IP تلقائياً لمدة 24 ساعة
- **Audit log**: كل إجراء حساس يُسجَّل مع الـ IP والـ User-Agent والوقت
- **AES-256-GCM vault**: كلمات المرور مشفّرة بمفتاح مستقل عن قاعدة البيانات
- **bcrypt 12 rounds** لكلمات المرور (hash)
- **JWT** مع انتهاء بعد 7 أيام
- **trust proxy**: يقرأ IP الحقيقي من `X-Forwarded-For` (للحماية خلف nginx/Cloudflare)

### 🐛 إصلاحات أخطاء وتحسينات
- ✅ صفحة `admin/clients` كانت تستخدم بيانات ثابتة (hardcoded) — الآن مربوطة بالـ API الحقيقي
- ✅ إضافة `dotenv` صريح في الـ backend لتحميل كل متغيرات البيئة (كانت الـ vault key لا تُحمَّل)
- ✅ تسجيل دخول موثّق: كل محاولة (ناجحة/فاشلة) تُسجَّل في `LoginAttempt`
- ✅ فك تشفير كلمة المرور يُعيد خطأ واضحاً بدلاً من 500
- ✅ إضافة `lastLoginAt` و `lastLoginIp` لنموذج `User`
- ✅ معالج أخطاء موحّد لا يُفصح بالأخطاء الداخلية في الـ production
- ✅ تحديث tsconfig للـ backend لتمرير `tsc --noEmit` بدون أخطاء

---

## ✨ الميزات السابقة (v4.0)

### 🔥 كل الصفحات صارت ديناميكية وحقيقية
كل الصفحات العامة الآن تجلب بياناتها من الـ API الحقيقي (مش بيانات ثابتة hardcoded):
- **`/` (Home)**: تجلب الـ services, latest projects, latest testimonials, latest blog posts, live stats — كله من الـ API.
- **`/services`**: تجلب الخدمات من `/api/services` + tabs ديناميكية.
- **`/portfolio`**: تجلب المشاريع من `/api/projects` مع pagination + search + filter by category.
- **`/blog`**: تجلب المقالات من `/api/blog` مع pagination + search + filter by tag.
- **`/blog/:slug`**: تجلب المقال من `/api/blog/:slug` + related posts + tracking views.
- **`/faq`**: تجلب الأسئلة من `/api/faq` مع search + filter by category.
- **`/testimonials`**: تجلب التقييمات من `/api/testimonials` مع filter by rating.
- **`/about`**: يستخدم live stats من `/api/stats`.
- **`/contact`**: النموذج يرسل رسالة حقيقية لـ `/api/messages` (تظهر في `/admin/messages`).

### 🌐 تبديل اللغة الكامل (عربي ↔ إنجليزي) — v3.0
- زر تبديل اللغة في الـ Navbar (`<LanguageSwitcher />`) وكذلك في لوحة الأدمن.
- التبديل الكامل بين RTL (عربي) و LTR (إنجليزي) بشكل فوري.
- اللغة محفوظة في `localStorage` ويتم تطبيقها قبل أول paint (لا وميض).
- نظام ترجمات شامل (`src/i18n/translations.ts`) يغطي:
  - Navbar, Footer, AdminLayout (كل العناوين والمجموعات).
  - صفحات: home, landing-gate, login, register, pricing, calculator.
  - مفاتيح مشتركة: common.*, nav.*, footer.*, auth.*, admin.*, lg.*, pf.*, pricing.*, calculator.*.
- مكوّنات مساعدة:
  - `useI18n()` → `{ lang, dir, setLang, toggleLang, t }`.
  - `useT()` → اختصار للـ translation function.

### 💱 حاسبة عملات متعددة (دولار أساسي)
- الدولار الأمريكي (USD) هو العملة الأساسية لكل الأسعار في الكود.
- 8 عملات مدعومة: USD, EUR, GBP, SAR, AED, EGP, KWD, QAR.
- كل تحويل من USD باستخدام rate ثابت في `CURRENCIES` (سهل التحديث لأخذ rate حي من API).
- زر تبديل العملة في الـ Navbar (`<CurrencySwitcher />`).
- في صفحة `/pricing`: محول عملة inline + عرض سعر بديل بـ USD للعملات الأخرى.
- في صفحة `/calculator`: محول عملة متكامل + جدول يقارن السعر بأهم 4 عملات.
- العملة محفوظة في `localStorage` وتتغير كل الأسعار في كل الصفحات تلقائياً.
- مثال: `format(1500)` → `$1,500` أو `5,625 ر.س` حسب العملة المختارة.

### 💰 إعادة هيكلة حاسبة تكلفة الموقع
- جميع الأسعار في `calculator.tsx` أصبحت بالـ USD (كانت بالريال السعودي).
- 6 أنواع مشاريع + 14 ميزة + 3 جداول زمنية — كلها بالدولار.
- عرض السعر النهائي بأي عملة + السعر المرجعي بـ USD دائماً.
- عرض مقارنة سريعة لـ 4 عملات في الـ sidebar.

### 📦 تحديثات إضافية
- جميع الأسعار في `pricing.tsx` أصبحت بالـ USD.
- كل النصوص في الصفحات الرئيسية (home, login, register, landing-gate, pricing, calculator, navbar, footer, admin sidebar) تدعم اللغتين.
- `AdminLayout` يدعم اللغة والاتجاه بشكل كامل.
- إصلاح أخطاء TypeScript المتبقية.

---

## ✨ الميزات السابقة (v2.0)

### 1. رفع الصور للـ Admin (Image Upload)
- نقطة نهاية `POST /api/media/upload` تستقبل ملفات متعددة (multer).
- مكتبة وسائط كاملة في `/admin/media` — ارفع، ابحث، احذف، انسخ الروابط.
- مكوّن `<ImageUpload />` قابل لإعادة الاستخدام داخل نماذج المشاريع والمدونة.
- الصور تُخزَّن في `server/uploads/` وتُخدم على `/uploads/<filename>`.
- حد الرفع الافتراضي 10MB (قابل للتعديل عبر `UPLOAD_MAX_MB`).
- الأنواع المدعومة: PNG, JPG, GIF, WebP, AVIF, SVG, PDF.

### 2. Pagination
- كل نقاط نهاية القوائم تدعم `page` و `limit`.
- الاستجابة تحتوي على `{ items, page, limit, total, pages }`.
- مكوّن `<Pager />` مخصص ومستقل عن الـ router، مستخدم في كل صفحات الـ admin.

### 3. البحث المتقدم (Advanced Search)
- كل المسارات تدعم بارامتر `q` للبحث النصّي.
- فلاتر إضافية حسب الجدول:
  - **projects**: `category`, `featured`
  - **blog**: `tag`, `hot`, `all` (للمسودات)
  - **testimonials**: `rating`, `featured`, `all` (للغير معتمدة)
  - **messages**: `filter=all|unread|starred`
  - **faq**: `category`, `all` (للمخفية)
  - **services**: `all` (للمعطّلة)
  - **media**: `type=image|pdf`
- بحث فوري (debounced) في الواجهة الأمامية.

### 4. دعم PostgreSQL بدل SQLite
- المخطط يعمل مع كلا المحرّكين بدون تغييرات.
- سكربتات مساعدة للتبديل:
  ```bash
  cd server
  npm run db:sqlite     # يضبط المخطط على sqlite + DATABASE_URL
  npm run db:postgres   # يضبط المخطط على postgresql + DATABASE_URL
  ```
- بعد التبديل:
  ```bash
  npx prisma generate
  npx prisma migrate dev --name init   # PostgreSQL
  # أو
  npx prisma db push                   # SQLite
  npm run seed
  ```

### 5. إصلاحات الأخطاء (Bug Fixes)
- ✅ صفحات الـ admin (blog, projects, media, messages, testimonials, faq, services) كانت تستخدم بيانات ثابتة محلياً — الآن مربوطة بالكامل بالـ API.
- ✅ `seed.ts` أصبح idempotent (upsert بدلاً من create) — لا تكرار عند إعادة التشغيل.
- ✅ إصلاح خطأ TypeScript في `auth-context.tsx` (نوع `result`).
- ✅ إصلاح خطأ TypeScript في `blog-post.tsx` (نوع `defaultPost`).
- ✅ إضافة `views` و `updatedAt` لنموذج BlogPost.
- ✅ إضافة `url` و `updatedAt` لنموذج Project.
- ✅ إضافة `starred` و `company` و `featured` للرسائل والتقييمات.
- ✅ إضافة `visible` و `active` و `order` و `createdAt` لـ FAQ و Services.
- ✅ تسجيلات الوسائط في DB (نموذج Media جديد).
- ✅ توحيد الـ JWT_SECRET في ملف واحد (`lib/prisma.ts`).

---

## 🏗️ البنية

```
zero-landing-full/
├── index.html              # نقطة دخول Vite + pre-paint lang/dir script
├── package.json            # اعتماديات الـ Frontend
├── vite.config.ts          # Vite + proxy للـ API
├── tsconfig.json
├── .env.example            # قالب متغيرات البيئة (server + frontend)
├── public/                 # صور وملفات ثابتة
├── src/                    # كود الـ Frontend
│   ├── components/
│   │   ├── admin/AdminLayout.tsx       # ✨ i18n + dir support
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # ✨ i18n + language/currency switchers
│   │   │   └── Footer.tsx              # ✨ i18n
│   │   └── ui/
│   │       ├── pager.tsx               # ✨ مكوّن ترقيم صفحات
│   │       ├── image-upload.tsx        # ✨ مكوّن رفع صور
│   │       ├── language-switcher.tsx   # ✨ NEW: زر تبديل اللغة (ar/en)
│   │       ├── currency-switcher.tsx   # ✨ NEW: زر تبديل العملة (8 عملات)
│   │       └── ... (shadcn components)
│   ├── contexts/
│   │   ├── auth-context.tsx
│   │   ├── i18n-context.tsx            # ✨ NEW: LanguageProvider + useT()
│   │   └── currency-context.tsx        # ✨ NEW: CurrencyProvider + useCurrency()
│   ├── i18n/
│   │   └── translations.ts             # ✨ NEW: قاموس الترجمات ar/en
│   ├── lib/api.ts                     # ✨ + apiUpload() + qs() helper
│   ├── pages/
│   │   ├── landing-gate.tsx            # ✨ i18n
│   │   ├── login.tsx                   # ✨ i18n
│   │   ├── register.tsx                # ✨ i18n
│   │   ├── pricing.tsx                 # ✨ i18n + multi-currency + USD base
│   │   ├── calculator.tsx              # ✨ i18n + multi-currency + USD base
│   │   └── admin/
│   │       ├── blog.tsx               # ✨ مربوط بالـ API + pagination + search + upload
│   │       ├── projects.tsx           # ✨ مربوط بالـ API + pagination + search + upload
│   │       ├── media.tsx              # ✨ رفع حقيقي للـ backend
│   │       ├── messages.tsx           # ✨ مربوط بالـ API
│   │       ├── testimonials.tsx       # ✨ مربوط بالـ API
│   │       ├── faq-manager.tsx        # ✨ مربوط بالـ API
│   │       ├── services-manager.tsx   # ✨ مربوط بالـ API
│   │       └── ... (analytics, dashboard, kanban, etc.)
│   ├── App.tsx                         # ✨ + I18nProvider + CurrencyProvider + dir
│   └── main.tsx
└── server/                 # 🚀 Backend
    ├── package.json        # ✨ + multer + scripts
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma   # ✨ + Media model + PostgreSQL support
    │   └── (dev.db)        # يُنشأ تلقائياً
    ├── scripts/
    │   ├── use-sqlite.js   # ✨ تبديل المخطط إلى sqlite
    │   └── use-postgres.js # ✨ تبديل المخطط إلى postgresql
    ├── uploads/            # ✨ صور الـ admin المرفوعة
    └── src/
        ├── index.ts        # ✨ + static /uploads  + media routes
        ├── seed.ts         # ✨ idempotent (upsert)
        ├── lib/prisma.ts   # ✨ + UPLOAD_* config
        ├── middleware/auth.ts
        └── routes/
            ├── auth.ts
            ├── projects.ts # ✨ pagination + search
            ├── blog.ts     # ✨ pagination + search + admin all
            ├── messages.ts # ✨ pagination + search + star
            ├── testimonials.ts # ✨ pagination + search + all
            ├── faq.ts      # ✨ pagination + search
            ├── services.ts # ✨ pagination + search
            ├── stats.ts    # ✨ + media count
            └── media.ts    # ✨ جديد: رفع + قائمة + حذف
```

## 🚀 التشغيل

### 1) Backend (API + DB)

```bash
cd server

# انسخ ملف البيئة وعدّله إذا لزم
cp ../.env.example .env

npm install
npx prisma generate
npx prisma db push          # SQLite (افتراضي)
# أو: npx prisma migrate dev --name init   (PostgreSQL)
npm run seed
npm run dev
# → http://localhost:3001
```

### 2) Frontend (Vite + React)

```bash
# في المجلد الجذري
npm install
npm run dev
# → http://localhost:5173 (يقوم بـ proxy لـ /api على 3001)
```

### 3) الإنتاج

```bash
# Frontend build
npm run build     # ينتج dist/public/

# Backend build
cd server && npm run build && npm start
```

## 🔑 بيانات الدخول

| النوع    | البريد                  | كلمة المرور       |
|----------|------------------------|-------------------|
| Admin    | zeru50549@gmail.com    | zero7892345##     |
| Demo     | demo@zero.dev          | demo123456        |

## 🛠️ التقنيات

**Frontend:**
- React 18 + TypeScript 5
- Vite 5
- Tailwind CSS v4
- shadcn/ui (90+ component)
- Framer Motion
- wouter (routing)
- @tanstack/react-query
- sonner (toasts)

**Backend:**
- Node.js + Express 4
- Prisma ORM + SQLite / PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- multer (file uploads)
- Zod validation

## 📡 الـ APIs

### Auth
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| POST   | /api/auth/register         | تسجيل مستخدم جديد           | Public   |
| POST   | /api/auth/login            | تسجيل الدخول                | Public   |
| GET    | /api/auth/me               | بيانات المستخدم الحالي      | Optional |
| PUT    | /api/auth/profile          | تحديث الملف الشخصي          | Required |

### Projects
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/projects               | قائمة مشاريع (paginated)    | Public   |
| GET    | /api/projects/:slug         | مشروع محدد                  | Public   |
| POST   | /api/projects               | إضافة مشروع                 | Admin    |
| PUT    | /api/projects/:id           | تعديل مشروع                 | Admin    |
| DELETE | /api/projects/:id           | حذف مشروع                   | Admin    |

### Blog
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/blog                   | قائمة مقالات (paginated)    | Public   |
| GET    | /api/blog/:slug             | مقال محدد (+view count)     | Public   |
| POST   | /api/blog                   | إضافة مقال                  | Admin    |
| PUT    | /api/blog/:id               | تعديل مقال                  | Admin    |
| DELETE | /api/blog/:id               | حذف مقال                    | Admin    |

### Messages
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| POST   | /api/messages               | إرسال رسالة (contact)       | Public   |
| GET    | /api/messages               | قائمة الرسائل (paginated)   | Admin    |
| PUT    | /api/messages/:id/read      | تعليم كمقروء/غير مقروء      | Admin    |
| PUT    | /api/messages/:id/star      | تبديل التمييز               | Admin    |
| DELETE | /api/messages/:id           | حذف رسالة                    | Admin    |

### Testimonials
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/testimonials           | قائمة تقييمات (paginated)   | Public   |
| POST   | /api/testimonials           | إضافة تقييم                 | Admin    |
| PUT    | /api/testimonials/:id       | تعديل تقييم                 | Admin    |
| DELETE | /api/testimonials/:id       | حذف تقييم                   | Admin    |

### FAQ
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/faq                    | قائمة أسئلة (paginated)     | Public   |
| POST   | /api/faq                    | إضافة سؤال                  | Admin    |
| PUT    | /api/faq/:id                | تعديل سؤال                  | Admin    |
| DELETE | /api/faq/:id                | حذف سؤال                    | Admin    |

### Services
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/services               | قائمة خدمات (paginated)     | Public   |
| POST   | /api/services               | إضافة خدمة                  | Admin    |
| PUT    | /api/services/:id           | تعديل خدمة                  | Admin    |
| DELETE | /api/services/:id           | حذف خدمة                    | Admin    |

### Media (جديد)
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/media                  | قائمة الوسائط (paginated)   | Admin    |
| POST   | /api/media/upload           | رفع ملفات (multipart)       | Admin    |
| PUT    | /api/media/:id              | تحديث بيانات ملف (alt)      | Admin    |
| DELETE | /api/media/:id              | حذف ملف (من DB والقرص)      | Admin    |

### Misc
| Method | Endpoint                    | الوصف                       | Auth     |
|--------|----------------------------|----------------------------|----------|
| GET    | /api/stats                  | إحصائيات عامة               | Public   |
| GET    | /api/health                 | فحص صحة الـ API             | Public   |
| GET    | /uploads/*                  | ملفات مرفوعة (static)       | Public   |

### Query Parameters مشتركة
- `page` — رقم الصفحة (افتراضي 1)
- `limit` — عدد العناصر لكل صفحة (افتراضي 10–24 حسب المسار، حد أقصى 100)
- `q` — نص بحث
- `all=true` — للمسارات التي تدعمه: إظهار المسودات/المعطّلة/الغير معتمدة (admin only)

## 🎨 التصميم

- Dark theme (#0F1419) مع accent سماوي (#00D9FF)
- RTL عربي بالكامل
- خط Poppins + Space Mono
- glow effects + cyber-grid
- Animations سلسة بـ Framer Motion

## 📝 الرخصة

Personal use — ZERO © 2026
