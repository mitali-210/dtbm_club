// @ts-nocheck
// @ts-ignore
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.6/+esm";

// Configure CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Helper: Maps frontend camelCase keys to Postgres snake_case keys
function mapEventPayload(body: any) {
  return {
    name: body.name,
    date: body.date,
    location: body.location,
    distance: body.distance,
    photo_url: body.photoUrl,
    distance_options: body.distanceOptions,
    level: body.level,
    description: body.description,
    max_participants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
    registration_cutoff_minutes: body.registrationCutoffMinutes ? parseInt(body.registrationCutoffMinutes) : 0,
    status: body.status || 'pending'
  };
}

// Helper: Maps Postgres profiles to Frontend format (camelCase + calculated stats)
function mapProfile(p: any, activities: any[] = []) {
  if (!p) return null;

  // Calculate stats from activities
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Simple streak calculation (days with activities)
  const activityDates = new Set(
    activities.map(a => new Date(a.date).toISOString().split('T')[0])
  );
  
  // Weekly miles (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyMiles = activities
    .filter(a => new Date(a.date).getTime() > sevenDaysAgo)
    .reduce((sum, a) => sum + parseFloat(a.distance || 0), 0);

  return {
    id: p.id,
    name: p.name,
    email: p.email,
    mobileNumber: p.mobile_number,
    joinedAt: p.joined_at,
    totalMiles: parseFloat(p.total_miles || 0),
    totalRuns: parseInt(p.total_runs || 0),
    medals: p.medals || [],
    registeredEvents: p.registered_events || [],
    currentStreak: activityDates.size > 0 ? 1 : 0, // Placeholder
    longestStreak: activityDates.size > 0 ? activityDates.size : 0, // Placeholder
    weeklyMiles: parseFloat(weeklyMiles.toFixed(2)),
    fastest5k: null,
    longestRun: activities.length > 0 ? Math.max(...activities.map(a => parseFloat(a.distance || 0))) : 0,
    activities: sortedActivities.map(a => ({
      id: a.id,
      name: a.name,
      date: a.date,
      distance: parseFloat(a.distance || 0),
      duration: a.duration,
      pace: a.pace,
      source: a.source
    }))
  };
}

// @ts-ignore
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/functions\/v1\/make-server-a694af94/, "") || url.pathname;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    let user = null;
    let isAdmin = false;

    if (token) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      user = authUser;
      
      const adminEmailsStr = Deno.env.get("ADMIN_EMAILS") || "admin@example.com";
      const adminEmails = adminEmailsStr.split(",").map(e => e.trim().toLowerCase());
      if (user && user.email && adminEmails.includes(user.email.toLowerCase())) {
        isAdmin = true;
      }
    }

    // ==========================================
    // ROUTER
    // ==========================================

    // [PUBLIC ROUTES]
    if (req.method === "GET" && path.endsWith("/stats")) {
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true });
      return new Response(JSON.stringify({
        stats: { totalMembers: usersCount || 0, totalEvents: eventsCount || 0, totalMiles: 0, totalRuns: 0 }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "GET" && path.includes("/leaderboard")) {
      const { data } = await supabase.from("leaderboard_view").select("*").limit(10);
      return new Response(JSON.stringify({ leaderboard: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "GET" && path.endsWith("/events")) {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (error) throw error;
      
      // Add participant count for each event
      const eventsWithCount = await Promise.all((data || []).map(async (event: any) => {
        const { count } = await supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", event.id);
        return { ...event, participants: count || 0 };
      }));
      
      return new Response(JSON.stringify({ events: eventsWithCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && path.endsWith("/auth/signup")) {
      const { email, password, name, mobileNumber } = await req.json();
      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name, mobileNumber }
      });
      if (error) throw error;
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // [AUTHENTICATED ROUTES]
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (req.method === "GET" && path.endsWith("/user/profile")) {
      const { data: profile, error: profErr } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profErr) throw profErr;
      
      const { data: activities } = await supabase.from("activities").select("*").eq("user_id", user.id).order("date", { ascending: false });
      const { data: tickets } = await supabase.from("event_registrations").select("event_id").eq("user_id", user.id);
      
      profile.registered_events = tickets?.map(t => t.event_id) || [];

      // Calculate ranks
      const { data: allProfiles } = await supabase.from("profiles").select("id, total_miles, total_runs").order("total_miles", { ascending: false });
      const milesRank = allProfiles ? allProfiles.findIndex(p => p.id === user.id) + 1 : null;
      const { data: allByRuns } = await supabase.from("profiles").select("id, total_runs").order("total_runs", { ascending: false });
      const clubRank = allByRuns ? allByRuns.findIndex(p => p.id === user.id) + 1 : null;
      const { data: allByEvents } = await supabase.from("event_registrations").select("user_id");
      const eventCounts: Record<string, number> = {};
      for (const r of allByEvents || []) { eventCounts[r.user_id] = (eventCounts[r.user_id] || 0) + 1; }
      const sortedByEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]);
      const eventsRank = sortedByEvents.findIndex(([id]) => id === user.id) + 1;

      const mapped = mapProfile(profile, activities || []);
      mapped.clubRank = clubRank || '--';
      mapped.milesRank = milesRank || '--';
      mapped.eventsRank = eventsRank || '--';
      
      return new Response(JSON.stringify({ profile: mapped }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (req.method === "POST" && path.includes("/events/") && path.endsWith("/register")) {
      const parts = path.split("/");
      const eventId = parts[parts.length - 2];
      const { selectedDistance, consentAccepted } = await req.json();
      const qrData = `${user.id}-${eventId}-${Date.now()}`;

      // Auto-assign bib number based on registration count for this event
      const { count: regCount } = await supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", eventId);
      const bibNumber = (regCount || 0) + 1;

      const { data, error } = await supabase.from("event_registrations").insert({
        event_id: eventId, user_id: user.id, selected_distance: selectedDistance, consent_accepted: consentAccepted, qr_data: qrData, bib_number: bibNumber
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ticket: data, message: "Registered successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "GET" && path.includes("/events/") && path.endsWith("/ticket")) {
      const parts = path.split("/");
      const eventId = parts[parts.length - 2];
      const { data, error } = await supabase.from("event_registrations").select("*, events(*)").eq("event_id", eventId).eq("user_id", user.id).single();
      if (error) throw error;
      return new Response(JSON.stringify({ ticket: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Certificate endpoint
    if (req.method === "GET" && path.includes("/events/") && path.endsWith("/certificate")) {
      const parts = path.split("/");
      const eventId = parts[parts.length - 2];
      const { data: ticket } = await supabase.from("event_registrations").select("*, events(*)").eq("event_id", eventId).eq("user_id", user.id).single();
      if (!ticket || !ticket.check_in_time) {
        return new Response(JSON.stringify({ error: "Certificate not available. You must be checked in at the event." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      return new Response(JSON.stringify({
        certificate: {
          certificateId: `DTBM-${eventId.slice(0,6).toUpperCase()}-${user.id.slice(0,4).toUpperCase()}`,
          runnerName: profile?.name || user.email,
          eventName: ticket.events?.name || "DTBM Event",
          distance: ticket.selected_distance || ticket.events?.distance || "",
          level: ticket.events?.level || "",
          checkedInAt: ticket.check_in_time,
          issuedAt: new Date().toISOString()
        }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // [ADMIN ROUTES]
    if (path.includes("/admin/")) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin strictly forbidden" }), { 
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      if (req.method === "GET" && path.endsWith("/admin/users")) {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        
        // Map all users to camelCase for the frontend
        const mappedUsers = data.map(u => mapProfile(u));
        
        return new Response(JSON.stringify({ users: mappedUsers }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Create Event
      if (req.method === "POST" && path.endsWith("/admin/events")) {
        const body = await req.json();
        const { data, error } = await supabase.from("events").insert(mapEventPayload(body)).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ event: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Update Event
      if (req.method === "PUT" && path.includes("/admin/events/")) {
        const eventId = path.split("/").pop();
        const body = await req.json();
        const { data, error } = await supabase.from("events").update(mapEventPayload(body)).eq("id", eventId).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ event: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Delete Event
      if (req.method === "DELETE" && path.includes("/admin/events/")) {
        const eventId = path.split("/").pop();
        const { data, error } = await supabase.from("events").delete().eq("id", eventId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // Admin Scan Ticket
      if (req.method === "POST" && path.endsWith("/admin/tickets/scan")) {
        const { qrData, userId: qrUserId, eventId: qrEventId } = await req.json();
        
        // Try exact match first
        let ticket = null;
        const { data: exactMatch } = await supabase.from("event_registrations").select("*, profiles(name)").eq("qr_data", qrData).single();
        ticket = exactMatch;
        
        // If not found, try by userId + eventId directly from QR JSON
        if (!ticket && qrUserId && qrEventId) {
          const { data: byIds } = await supabase.from("event_registrations").select("*, profiles(name)").eq("user_id", qrUserId).eq("event_id", qrEventId).single();
          ticket = byIds;
        }

        if (!ticket) throw new Error("Ticket not found");

        if (ticket.checked_in) {
          return new Response(JSON.stringify({ alreadyCheckedIn: true, userName: ticket.profiles?.name }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { error: updErr } = await supabase.from("event_registrations").update({ checked_in: true, check_in_time: new Date().toISOString() }).eq("id", ticket.id);
        if (updErr) throw updErr;
        return new Response(JSON.stringify({ success: true, userName: ticket.profiles?.name }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Add Activity
      const activityMatch = path.match(/\/admin\/users\/([^\/]+)\/activity/);
      if (req.method === "POST" && activityMatch) {
        const userId = activityMatch[1];
        const body = await req.json();
        const { name, date, distance, duration, pace } = body;

        if (!distance || isNaN(parseFloat(distance))) {
          throw new Error("Invalid distance value");
        }

        // Insert activity
        const { data: activity, error: actErr } = await supabase.from("activities").insert({
          user_id: userId,
          name: name || 'Manual Activity',
          date: date || new Date().toISOString(),
          distance: parseFloat(distance),
          duration: String(duration || '0'),
          pace: pace || '--',
          source: 'manual'
        }).select().single();

        if (actErr) throw actErr;

        // Update profile stats (simple increment)
        const { data: currentProfile, error: profErr } = await supabase.from("profiles").select("total_miles, total_runs").eq("id", userId).single();
        if (profErr) throw profErr;

        const { error: updErr } = await supabase.from("profiles").update({
          total_miles: (currentProfile?.total_miles || 0) + parseFloat(distance),
          total_runs: (currentProfile?.total_runs || 0) + 1
        }).eq("id", userId);

        if (updErr) throw updErr;

        return new Response(JSON.stringify({ success: true, activity }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Update User Stats
      if (req.method === "POST" && path.includes("/admin/users/") && path.endsWith("/stats")) {
        const parts = path.split("/");
        const userId = parts[parts.length - 2];
        const body = await req.json();
        const { totalMiles, totalRuns } = body;

        const { data, error } = await supabase.from("profiles").update({
          total_miles: totalMiles,
          total_runs: totalRuns
        }).eq("id", userId).select().single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, profile: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Admin Start Race
      if (req.method === "POST" && path.includes("/admin/events/") && path.endsWith("/start-race")) {
        const parts = path.split("/");
        const eventId = parts[parts.length - 2];
        const { data, error } = await supabase.from("events").update({ status: 'started', race_start_time: new Date().toISOString() }).eq("id", eventId).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, event: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Get Event Checkins
      if (req.method === "GET" && path.includes("/admin/events/") && path.endsWith("/checkins")) {
        const parts = path.split("/");
        const eventId = parts[parts.length - 2];
        const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
        const { data: checkins } = await supabase.from("event_registrations").select("*, profiles(name)").eq("event_id", eventId);
        
        const formattedCheckins = checkins?.map(c => ({
          userId: c.user_id,
          userName: c.profiles?.name,
          checkedIn: c.checked_in,
          selectedDistance: c.selected_distance,
          checkInTime: c.check_in_time,
          bibNumber: null,
          finishTimeHms: c.race_time
        })) || [];

        return new Response(JSON.stringify({ 
          event: {
            ...event,
            totalRegistered: checkins?.length || 0,
            totalPresent: checkins?.filter(c => c.checked_in).length || 0,
            totalWaitlist: 0
          },
          checkins: formattedCheckins
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Reminder Preview
      if (req.method === "GET" && path.includes("/admin/events/") && path.endsWith("/reminders/preview")) {
        const parts = path.split("/");
        const eventId = parts[parts.length - 3];
        const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
        const { data: registrations } = await supabase.from("event_registrations").select("*, profiles(name, email, mobile_number)").eq("event_id", eventId).eq("checked_in", false);
        return new Response(JSON.stringify({
          count: registrations?.length || 0,
          reminderType: "pre-event",
          eventName: event?.name,
          channels: { resendConfigured: true, whatsappWebhookConfigured: false }
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Send Reminders
      if (req.method === "POST" && path.includes("/admin/events/") && path.endsWith("/reminders/send")) {
        const parts = path.split("/");
        const eventId = parts[parts.length - 3];
        const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
        const { data: registrations } = await supabase.from("event_registrations").select("*, profiles(name, email)").eq("event_id", eventId);

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          return new Response(JSON.stringify({ sent: 0, failed: registrations?.length || 0, message: "RESEND_API_KEY not configured" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        let sent = 0, failed = 0;
        for (const reg of registrations || []) {
          const email = reg.profiles?.email;
          if (!email) { failed++; continue; }
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "DTBM Run Club <noreply@dtbmclub.in>",
              to: [email],
              subject: `Reminder: ${event?.name} is coming up!`,
              html: `<div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;border-radius:12px;">
                <h1 style="color:#fff;">Hey ${reg.profiles?.name || 'Runner'} 👋</h1>
                <p>This is a reminder that <strong>${event?.name}</strong> is coming up!</p>
                <p>📅 Date: ${event?.date ? new Date(event.date).toLocaleString() : 'TBD'}</p>
                <p>📍 Location: ${event?.location || 'TBD'}</p>
                <p>🏃 Distance: ${event?.distance || 'TBD'}</p>
                <p style="margin-top:24px;">See you at the start line!<br/><strong>DTBM Run Club</strong></p>
              </div>`
            })
          });
          const resBody = await res.json().catch(() => ({}));
          console.log("Resend response:", res.status, JSON.stringify(resBody));
          if (res.ok) sent++; else failed++;
        }

        return new Response(JSON.stringify({ sent, failed, message: `Reminders sent: ${sent}, failed: ${failed}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Export CSV
      if (req.method === "GET" && path.includes("/admin/events/") && path.endsWith("/export")) {
        const parts = path.split("/");
        const eventId = parts[parts.length - 2];
        const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
        const { data: checkins } = await supabase.from("event_registrations").select("*, profiles(name, email, mobile_number)").eq("event_id", eventId);

        const rows = [["Name", "Email", "Phone", "Distance", "Checked In", "Check-in Time"]];
        for (const c of checkins || []) {
          rows.push([
            c.profiles?.name || "",
            c.profiles?.email || "",
            c.profiles?.mobile_number || "",
            c.selected_distance || "",
            c.checked_in ? "Yes" : "No",
            c.check_in_time ? new Date(c.check_in_time).toLocaleString() : ""
          ]);
        }
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        return new Response(csv, { headers: { ...corsHeaders, "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${event?.name || eventId}-participants.csv"` } });
      }

    }

    return new Response(JSON.stringify({ message: "Edge Function Endpoint Not Found", path }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
