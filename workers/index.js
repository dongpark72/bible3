export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const { pathname } = url;

        // CORS headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // API Routes
        if (pathname.startsWith("/api/")) {
            try {
                // 1. Bible Text from R2
                if (pathname.startsWith("/api/bible/")) {
                    const parts = pathname.split("/"); // ["", "api", "bible", "version", "book.json"]
                    if (parts.length >= 5) {
                        const version = parts[3]; // e.g. "ko" or "en_niv"
                        const bookFile = parts[4]; // e.g. "gn.json"
                        // Map version names to match R2 folder structure
                        let r2Version = version;
                        if (version === "ko") r2Version = "ko";

                        const key = `bible/${r2Version}/${bookFile}`;
                        const object = await env.BIBLE_R2.get(key);

                        if (object === null) {
                            return new Response(`Book not found: ${key}`, { status: 404, headers: corsHeaders });
                        }

                        const headers = new Headers(corsHeaders);
                        object.writeHttpMetadata(headers);
                        headers.set("etag", object.httpEtag);
                        headers.set("Content-Type", "application/json; charset=utf-8");

                        return new Response(object.body, { headers });
                    }
                }

                // 2. Login / Register
                if (pathname === "/api/login" && request.method === "POST") {
                    const { username, password } = await request.json();
                    let user = await env.DB.prepare("SELECT * FROM users WHERE username = ?")
                        .bind(username)
                        .first();

                    if (!user) {
                        await env.DB.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
                            .bind(username, password)
                            .run();
                        user = { username, group_name: '교구' };
                    } else if (user.password !== password) {
                        return new Response(JSON.stringify({ success: false, message: "Invalid password" }), {
                            status: 401,
                            headers: { ...corsHeaders, "Content-Type": "application/json" }
                        });
                    }

                    return new Response(JSON.stringify({ success: true, user }), {
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    });
                }

                // 3. Progress / History
                if (pathname === "/api/progress") {
                    if (request.method === "GET") {
                        const username = url.searchParams.get("username");
                        const results = await env.DB.prepare("SELECT book, chapter, read_at FROM history WHERE username = ? ORDER BY read_at DESC LIMIT 50")
                            .bind(username)
                            .all();
                        return new Response(JSON.stringify({ success: true, history: results.results }), {
                            headers: { ...corsHeaders, "Content-Type": "application/json" }
                        });
                    }
                    if (request.method === "POST") {
                        const { username, lastRead } = await request.json();
                        // lastRead format: "창세기 1장"
                        const parts = lastRead.split(' ');
                        await env.DB.prepare("INSERT INTO history (username, book, chapter) VALUES (?, ?, ?)")
                            .bind(username, parts[0], parseInt(parts[1]) || 1)
                            .run();
                        return new Response(JSON.stringify({ success: true }), {
                            headers: { ...corsHeaders, "Content-Type": "application/json" }
                        });
                    }
                }

                // 4. Reading Plan
                if (pathname === "/api/plan") {
                    if (request.method === "GET") {
                        const username = url.searchParams.get("username");
                        const plan = await env.DB.prepare("SELECT * FROM reading_plans WHERE username = ?")
                            .bind(username)
                            .first();
                        return new Response(JSON.stringify(plan || {
                            startDate: "2026-02-01",
                            endDate: "2026-12-31",
                            dailyTarget: 3
                        }), {
                            headers: { ...corsHeaders, "Content-Type": "application/json" }
                        });
                    }
                }

                // 5. Group Status
                if (pathname.startsWith("/api/group/")) {
                    const groupName = decodeURIComponent(pathname.split("/")[3]) || "교구";
                    const members = await env.DB.prepare(`
                        SELECT u.username, 
                               count(h.id) as completedCount,
                               max(h.read_at) as lastReadAt
                        FROM users u
                        LEFT JOIN history h ON u.username = h.username
                        WHERE u.group_name = ?
                        GROUP BY u.username
                    `).bind(groupName).all();

                    const formatted = members.results.map(m => ({
                        username: m.username,
                        progress: Math.min(100, Math.round((m.completedCount / 1189) * 100)),
                        completedCount: m.completedCount,
                        todayCount: 0,
                        lastRead: m.lastReadAt || '기록 없음',
                        dailyProgress: {}
                    }));

                    return new Response(JSON.stringify({ success: true, members: formatted }), {
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    });
                }

                return new Response("Not Found", { status: 404, headers: corsHeaders });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        // Static Assets
        return env.ASSETS.fetch(request);
    }
};
