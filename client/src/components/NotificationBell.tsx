import { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const DARK = "#1D1D1F";
const GOLD = "#C9A97E";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Queries
  const countQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const listQuery = trpc.notifications.list.useQuery(undefined, {
    enabled: open,
    refetchInterval: open ? 30000 : false,
  });

  // Mutations
  const markReadMut = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });
  const markAllReadMut = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const unread = countQuery.data ?? 0;
  const notifications = listQuery.data ?? [];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNotificationClick = useCallback(
    (n: { id: number; link?: string | null; isRead: boolean }) => {
      if (!n.isRead) markReadMut.mutate({ id: n.id });
      if (n.link) {
        setLocation(n.link);
        setOpen(false);
      }
    },
    [markReadMut, setLocation],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllReadMut.mutate();
  }, [markAllReadMut]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell size={22} color={DARK} strokeWidth={1.8} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#D93025",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            maxHeight: 420,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(0,0,0,.15)",
            border: "1px solid #e5e5e5",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: DARK,
              }}
            >
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllReadMut.isPending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: GOLD,
                  fontWeight: 600,
                  padding: 0,
                  opacity: markAllReadMut.isPending ? 0.5 : 1,
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div
            style={{
              overflowY: "auto",
              flex: 1,
            }}
          >
            {listQuery.isLoading ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "#888",
                  fontSize: 13,
                }}
              >
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f3f3f3",
                    cursor: n.link ? "pointer" : "default",
                    background: n.isRead ? "transparent" : "rgba(201,169,126,0.06)",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (n.link)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "rgba(0,0,0,.03)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = n.isRead
                      ? "transparent"
                      : "rgba(201,169,126,0.06)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: GOLD,
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: n.isRead ? 400 : 600,
                          fontSize: 13,
                          color: DARK,
                          lineHeight: 1.3,
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          lineHeight: 1.4,
                          whiteSpace: "pre-line",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#aaa",
                          marginTop: 4,
                        }}
                      >
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
