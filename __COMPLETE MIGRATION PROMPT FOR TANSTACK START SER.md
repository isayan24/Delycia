# **COMPLETE MIGRATION PROMPT FOR TANSTACK START SERVER ROUTES**

```
You are an expert TanStack Start developer. Migrate my Next.js API routes → TanStack Start SERVER ROUTES using OFFICIAL `createFileRoute` + `server.handlers` pattern.

## 🎯 OLD ARCHITECTURE (Next.js)
```

Client → /api/inventory → Backend (https://my-backend.com/api/inventory)
├── admin/pages call axios("/api/inventory")
├── pages/api/inventory.ts proxies to backend
└── Backend handles real CRUD logic

```

## 🎯 NEW ARCHITECTURE (TanStack Start)
```

Client → /routes/api.inventory.ts → Backend (https://my-backend.com/api/inventory)
├── Client calls fetch("/api/inventory")
├── routes/api.inventory.ts (SERVER ROUTE) proxies to backend
└── Backend handles real CRUD logic ✓ SAME LOGIC

```

## 📁 REQUIRED FILES TO GENERATE
```

routes/api.inventory.ts → Replaces pages/api/inventory
routes/api.categories.ts → Replaces pages/api/categories
routes/api.users.ts → Replaces pages/api/users
routes/api.users.\$id.ts → Replaces pages/api/users/[id]

````

## 📋 TANSTACK START SERVER ROUTE SPEC (MANDATORY)

**EXACT SYNTAX from docs:**
```ts
// routes/api.inventory.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/inventory')({
  server: {
    handlers: {
      GET: async ({ request }) => { /* PROXY TO BACKEND */ },
      POST: async ({ request }) => { /* PROXY TO BACKEND */ },
      PATCH: async ({ request }) => { /* PROXY TO BACKEND */ },
      DELETE: async ({ request }) => { /* PROXY TO BACKEND */ },
    },
  },
})
````

## 🔧 PRODUCTION SERVER ROUTE TEMPLATE

**For each API route, generate this EXACT structure:**

```ts
// routes/api.inventory.ts
import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = "https://my-backend.com/api/inventory";
const API_KEY = process.env.BACKEND_API_KEY!;

export const Route = createFileRoute("/api/inventory")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const backendRes = await fetch(BACKEND_URL, {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              ...Object.fromEntries(request.headers.entries()),
            },
          });
          return Response.json(await backendRes.json(), {
            status: backendRes.status,
            headers: { "Cache-Control": "public, s-maxage=300" },
          });
        } catch (error) {
          return new Response("Server Error", { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const backendRes = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              ...Object.fromEntries(request.headers.entries()),
            },
            body: JSON.stringify(body),
          });
          return Response.json(await backendRes.json(), {
            status: backendRes.status,
          });
        } catch (error) {
          return new Response("Server Error", { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        // IDENTICAL PATTERN - copy POST logic
      },

      DELETE: async ({ request }) => {
        // IDENTICAL PATTERN - copy GET logic, method: 'DELETE'
      },
    },
  },
});
```

## 📂 FILE MAPPING RULES

| Next.js Path                     | TanStack Start Path              | Route Path              |
| :------------------------------- | :------------------------------- | :---------------------- |
| `pages/api/inventory.ts`         | `routes/api.inventory.ts`        | `/api/inventory`        |
| `pages/api/categories.ts`        | `routes/api.categories.ts`       | `/api/categories`       |
| `pages/api/users.ts`             | `routes/api.users.ts`            | `/api/users`            |
| `pages/api/users/[id].ts`        | `routes/api.users.$id.ts`        | `/api/users/$id`        |
| `pages/api/orders/[id]/items.ts` | `routes/api.orders.$id.items.ts` | `/api/orders/$id/items` |

## ✅ REQUIRED FOR EACH FILE:

```
✅ createFileRoute('/api/...')
✅ server: { handlers: { GET, POST, PATCH, DELETE } }
✅ Proxy ALL requests to https://my-backend.com/api/{endpoint}
✅ Forward client Authorization header
✅ Use process.env.BACKEND_API_KEY for backend auth
✅ Error handling: try/catch → 500 status
✅ JSON responses with proper status codes
✅ Cache-Control headers for GET requests
✅ TypeScript types throughout
```

## 🚫 DELETE THESE PATTERNS:

```
❌ pages/api/ folder
❌ axiosInstance.get("/api/...")
❌ Custom useEffect hooks calling /api/
❌ Client-side backend URLs
```

## ✅ NEW CLIENT PATTERN:

```
✅ fetch('/api/inventory')  // Calls your server route
✅ TanStack Query hooks
✅ useLoaderData() for SSR pages
```

## 📋 DELIVERABLE FORMAT:

```
1. 📁 routes/api.inventory.ts     [COMPLETE COPY-PASTABLE CODE]
2. 📁 routes/api.categories.ts    [COMPLETE COPY-PASTABLE CODE]
3. 📁 routes/api.users.ts         [COMPLETE COPY-PASTABLE CODE]
4. 📁 routes/api.users.$id.ts     [COMPLETE COPY-PASTABLE CODE]
5. 📋 MIGRATION CHECKLIST
   - [ ] Replace axios("/api/...") → fetch("/api/...")
   - [ ] Delete old pages/api/ folder
   - [ ] Delete custom useEffect hooks
   - [ ] Add .env: BACKEND_API_KEY=xxx
```

## 🎯 BACKEND ENDPOINTS TO PROXY:

```
https://my-backend.com/api/inventory    → routes/api.inventory.ts
https://my-backend.com/api/categories   → routes/api.categories.ts
https://my-backend.com/api/users        → routes/api.users.ts
https://my-backend.com/api/users/{id}   → routes/api.users.$id.ts
```

**GENERATE ALL 4 files with COMPLETE PRODUCTION-READY CODE using EXACT TanStack Start server routes syntax from the docs above. NO DEVIATIONS.**

````

***

**Copy this ENTIRE prompt** to your AI assistant. It will generate **production-ready TanStack Start server routes** that **exactly replace** your Next.js API routes while maintaining the **client → proxy → backend** architecture.

**Key fixes from your feedback:**
✅ Uses **`createFileRoute` + `server.handlers`** (official docs)
✅ **`routes/api.inventory.ts`** naming convention
✅ **Exact proxy pattern** matching your Next.js flow
✅ **Production hardening** built-in
✅ **File structure** matches TanStack Router conventions

This will give you **drop-in replacements** for all your API routes! 🚀
<span style="display:none">[^1][^10][^11][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: Delycia.pdf
[^2]: https://www.reddit.com/r/tanstack/comments/1nx7gx6/questionissues_preferring_server_routes_over/
[^3]: https://abdulkadersafi.com/blog/nextjs-vs-tanstack-start-ssr-routing-data-fetching-guide
[^4]: https://tanstack.com/router/v1/docs/framework/react/comparison
[^5]: https://www.reddit.com/r/reactjs/comments/1jsq5ar/tanstack_start_vs_nextjs_server_functions_battle/
[^6]: https://www.reddit.com/r/reactjs/comments/1h1oacg/tanstack_start_vs_nextjs/
[^7]: https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
[^8]: https://www.reddit.com/r/reactjs/comments/1nujqwh/when_to_use_server_routes_vs_server_functions_in/
[^9]: https://www.youtube.com/watch?v=Iun1DE_oHG0
[^10]: https://www.reddit.com/r/tanstack/comments/1kvqtgu/server_functions_vs_api_routes_for_data_fetching/
[^11]: https://blog.logrocket.com/tanstack-start-vs-next-js-choosing-the-right-full-stack-react-framework/```

````
