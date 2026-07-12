import bcrypt from "bcryptjs";
import { prisma, ADMIN_EMAIL, ADMIN_PASSWORD } from "./lib/prisma.js";
import { encryptPassword } from "./lib/vault.js";

// Slug helper
function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalise feature list (string or string[]) into a JSON string.
function feat(arr: string[]): string {
  return JSON.stringify(arr);
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Admin user (idempotent — upsert by email)
  const adminPass = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: adminPass, passwordVault: encryptPassword(ADMIN_PASSWORD), role: "admin", verified: true },
    create: {
      email: ADMIN_EMAIL,
      name: "ZERO Admin",
      password: adminPass,
      passwordVault: encryptPassword(ADMIN_PASSWORD),
      role: "admin",
      verified: true,
      bio: "Software Architect — Full Stack Developer",
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // 2. Demo users (with vaults so admins can reveal passwords)
  const demoUsers = [
    { name: "مستخدم تجريبي", email: "demo@zero.dev", password: "demo123456", verified: false },
    { name: "أحمد السعيد", email: "ahmed@example.com", password: "ahmed2025", verified: true },
    { name: "سارة القحطاني", email: "sara@example.com", password: "sara7890", verified: true },
    { name: "محمد الغامدي", email: "mohammed@example.com", password: "mhd5432", verified: false },
  ];
  for (const d of demoUsers) {
    const hashed = await bcrypt.hash(d.password, 12);
    await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        name: d.name,
        password: hashed,
        passwordVault: encryptPassword(d.password),
        role: "user",
        verified: d.verified,
      },
    });
  }
  console.log(`  ✓ ${demoUsers.length} demo users (with vaults)`);

  // 3. Projects
  const projects = [
    {
      title: "متجر الرياض الإلكتروني",
      slug: "riyadh-store",
      description: "متجر إلكتروني كامل مع لوحة تحكم وإدارة مخزون",
      tech: "Next.js + Stripe",
      category: "متجر",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
      url: "#",
      featured: true,
    },
    {
      title: "منصة SaaS للأعمال",
      slug: "saas-platform",
      description: "نظام SaaS متكامل لإدارة الفرق والمشاريع",
      tech: "React + Node.js",
      category: "تطبيق",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      url: "#",
      featured: true,
    },
    {
      title: "تطبيق حجز العيادات",
      slug: "clinic-booking",
      description: "نظام حجز ذكي مع تأكيدات واتساب تلقائية",
      tech: "React + Firebase",
      category: "تطبيق",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      featured: true,
    },
    {
      title: "مطعم ذكي بذكاء اصطناعي",
      slug: "smart-restaurant",
      description: "نظام طلبات مع توصيات ذكية بناءً على تفضيلات العميل",
      tech: "Flutter + Python ML",
      category: "تطبيق",
      image: "/projects/restaurant.png",
      featured: false,
    },
    {
      title: "متجر إلكتروني متعدد البائعين",
      slug: "multi-vendor-shop",
      description: "منصة تجارية تتيح لعدة بائعين البيع من متجر واحد",
      tech: "Next.js + Prisma + PostgreSQL",
      category: "متجر",
      image: "/projects/ecommerce.png",
      featured: false,
    },
    {
      title: "موقع شركة عقارية",
      slug: "real-estate-site",
      description: "موقع عقارات تفاعلي مع بحث متقدم وخريطة",
      tech: "React + Mapbox",
      category: "موقع",
      image: "/projects/corporate.png",
      featured: false,
    },
    {
      title: "تطبيق توصيل موصل",
      slug: "delivery-app",
      description: "تطبيق توصيل بوقت حقيقي وتتبع GPS",
      tech: "React Native + Node.js",
      category: "تطبيق",
      image: "/projects/app.png",
      featured: false,
    },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`  ✓ ${projects.length} projects`);

  // 4. Blog posts
  const posts = [
    {
      title: "لماذا React لا يزال الملك في 2025؟",
      slug: "why-react-still-king-2025",
      excerpt: "تحليل عميق لأسباب استمرار React كأفضل إطار عمل للواجهات.",
      content: "React ليس مجرد مكتبة، بل نظام بيئي متكامل...\n\nفي عام 2025، مع ظهور Server Components و React Compiler، أصبح React أسرع وأبسط من أي وقت مضى.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      tag: "React",
      hot: true,
      published: true,
    },
    {
      title: "كيف تبني API آمن بـ Node.js",
      slug: "secure-nodejs-api-guide",
      excerpt: "دليل شامل لبناء API آمن من الصفر مع أفضل الممارسات.",
      content: "أمان API ليس خياراً، بل ضرورة...",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      tag: "Node.js",
      hot: false,
      published: true,
    },
    {
      title: "Tailwind CSS v4: ثورة في التصميم",
      slug: "tailwind-v4-revolution",
      excerpt: "ما الجديد في Tailwind v4 وكيف يغيّر طريقة عملنا.",
      content: "Tailwind v4 جلب تحسينات جذرية...",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      tag: "Tailwind",
      hot: false,
      published: true,
    },
    {
      title: "TypeScript: دليلك الشامل",
      slug: "typescript-complete-guide",
      excerpt: "من المبتدئ إلى المتقدم في TypeScript خطوة بخطوة.",
      content: "TypeScript لغة تغير طريقة تفكيرك في الكود...",
      image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=80",
      tag: "TypeScript",
      hot: true,
      published: true,
    },
    {
      title: "PostgreSQL vs MongoDB: أيهما تختار؟",
      slug: "postgres-vs-mongodb",
      excerpt: "مقارنة شاملة بين أشهر قاعدتي بيانات.",
      content: "الاختيار بين SQL و NoSQL قرار مهم...",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
      tag: "Database",
      hot: false,
      published: true,
    },
    {
      title: "Docker للمطورين: البداية",
      slug: "docker-for-developers",
      excerpt: "تعلّم Docker من الصفر حتى الاحتراف.",
      content: "Docker أداة لا غنى عنها...",
      image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      tag: "DevOps",
      hot: false,
      published: true,
    },
  ];
  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, authorId: admin.id },
    });
  }
  console.log(`  ✓ ${posts.length} blog posts`);

  // 5. Testimonials
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    const testimonials = [
      { name: "أحمد السعيد", role: "صاحب متجر إلكتروني", company: "متجر الرياض", rating: 5, text: "ZERO غيّر تصوري للتطوير المحترف. الموقع اللي بناه يتحدث عن نفسه.", avatar: "أ", featured: true },
      { name: "سارة القحطاني", role: "مصممة أزياء", company: "Nova Agency", rating: 5, text: "تعاملت مع كثير من المطورين، لكن ZERO فئة منفردة.", avatar: "س", featured: false },
      { name: "شركة TechPro", role: "شركة تقنية", company: "TechPro", rating: 5, text: "نظام SaaS المعقد الذي بناه ZERO يعمل بسلاسة مطلقة منذ الإطلاق.", avatar: "ت", featured: true },
      { name: "د. محمد الغامدي", role: "طبيب متخصص", company: "عيادة الغامدي", rating: 5, text: "تطبيق الحجز حوّل عيادتي. الحجوزات ارتفعت 40% في أول شهر.", avatar: "م", featured: false },
      { name: "مجموعة الرياض", role: "مجموعة عقارات", company: "مجموعة الرياض", rating: 5, text: "موقع عقاراتنا أصبح مرجعاً في المنطقة.", avatar: "ر", featured: false },
    ];
    for (const t of testimonials) {
      await prisma.testimonial.create({ data: t });
    }
    console.log(`  ✓ ${testimonials.length} testimonials`);
  }

  // 6. FAQ
  const faqs = [
    { question: "كم تستغرق مدة تنفيذ المشروع؟", answer: "تعتمد المدة على حجم المشروع. المواقع البسيطة 3-7 أيام، المتوسطة 2-4 أسابيع، المعقدة 1-3 أشهر.", category: "عام", order: 1 },
    { question: "ما هي طرق الدفع المتاحة؟", answer: "تحويل بنكي، PayPal، Stripe، وعملات رقمية. 30% دفعة أولى، 40% بعد المرحلة الأولى، 30% عند التسليم.", category: "دفع", order: 2 },
    { question: "هل تقدمون دعم بعد التسليم؟", answer: "نعم، دعم فني مجاني 30 يوماً بعد التسليم، ثم باقات شهرية أو سنوية.", category: "دعم", order: 3 },
    { question: "هل الكود يكون ملكي بالكامل؟", answer: "بالتأكيد، جميع الأكواد تُسلّم لك كاملة مع وثائق التشغيل.", category: "ملكية", order: 4 },
    { question: "هل تعمل مع عملاء خارج المملكة؟", answer: "نعم، أعمل مع عملاء من جميع أنحاء العالم عن بُعد.", category: "عام", order: 5 },
    { question: "ما التقنيات التي تستخدمها؟", answer: "React, Next.js, TypeScript, Node.js, Prisma, PostgreSQL, MongoDB, Tailwind, Docker, AWS.", category: "تقني", order: 6 },
  ];
  for (const f of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (existing) {
      await prisma.fAQ.update({ where: { id: existing.id }, data: f });
    } else {
      await prisma.fAQ.create({ data: f });
    }
  }
  console.log(`  ✓ ${faqs.length} FAQ items`);

  // 7. Services
  const services = [
    { title: "تطوير المواقع", description: "تطبيقات ويب سريعة وآمنة.", icon: "💻", features: feat(["React / Next.js", "TypeScript", "APIs متكاملة", "أداء عالي"]), order: 1 },
    { title: "تصميم UI/UX", description: "واجهات عصرية تركز على تجربة المستخدم.", icon: "🎨", features: feat(["Figma Prototypes", "نظام تصميم موحد", "Responsive", "A11y"]), order: 2 },
    { title: "متاجر إلكترونية", description: "حلول تجارة إلكترونية متكاملة.", icon: "🛒", features: feat(["Stripe / PayPal", "إدارة مخزون", "لوحة تحكم", "تقارير"]), order: 3 },
    { title: "تطبيقات الموبايل", description: "تطبيقات موبايل لـ iOS و Android.", icon: "📱", features: feat(["React Native", "Expo", "Push", "Offline"]), order: 4 },
    { title: "قواعد البيانات", description: "تصميم وإدارة قواعد بيانات.", icon: "🗄️", features: feat(["PostgreSQL", "MongoDB", "Redis", "Backup"]), order: 5 },
    { title: "لوحات التحكم", description: "dashboards تفاعلية مع تقارير.", icon: "📊", features: feat(["Charts", "Export PDF/Excel", "Real-time", "Filters"]), order: 6 },
  ];
  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { title: s.title } });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: s });
    } else {
      await prisma.service.create({ data: s });
    }
  }
  console.log(`  ✓ ${services.length} services`);

  // 8. Link masks (sample, idempotent)
  const linkMasks = [
    { slug: "github", targetUrl: "https://github.com/", title: "GitHub Profile", description: "حساب GitHub الرسمي", active: true },
    { slug: "wa", targetUrl: "https://wa.me/966500000000", title: "WhatsApp", description: "تواصل واتساب مباشر", active: true },
    { slug: "pricing-pdf", targetUrl: "https://example.com/zero-pricing.pdf", title: "ملف الأسعار", description: "PDF بتفاصيل الباقات", active: true },
    { slug: "channel", targetUrl: "https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y", title: "قناة واتساب", description: "قناة التحديثات الرسمية", active: true },
  ];
  for (const m of linkMasks) {
    const existing = await prisma.linkMask.findUnique({ where: { slug: m.slug } });
    if (!existing) {
      await prisma.linkMask.create({ data: m });
    }
  }
  console.log(`  ✓ ${linkMasks.length} link masks`);

  console.log("\n✅ Seed completed successfully!\n");
  console.log("Admin credentials:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("\nDemo users (passwords revealable from /admin/users):");
  for (const d of demoUsers) {
    console.log(`  ${d.email}  /  ${d.password}`);
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
