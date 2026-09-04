# النشر على Vercel

## متغيرات البيئة المطلوبة عند النشر على Vercel

بإعدادات المشروع على vercel.com → Settings → Environment Variables،
أضيفي:

- `VITE_API_MODE` = `real`
- `VITE_API_BASE_URL` = رابط الباك اند المستضاف الفعلي، ينتهي بـ `/api`
  (مثلًا `https://your-backend.railway.app/api`)

⚠️ لا تستخدمي أبدًا `http://127.0.0.1` هنا — هذا يعمل فقط على جهاز
التطوير المحلي، وسيفشل بصمت لأي زائر يفتح الموقع المنشور.

راجعي [.env.example](.env.example) لشرح كل متغيّر والفرق بين القيمة
المحلية والإنتاجية.
