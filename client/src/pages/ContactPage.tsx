import { useState } from "react";
import { PublicShell, Section } from "./_divisions/DivisionLayout";
import { PUBLIC, TYPE, RADIUS, SHADOW, DIVISIONS, CONTACT } from "@/brand";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  return (
    <PublicShell
      title="Contact HAMZURY"
      description="Talk to us. Four divisions, one team — pick your service or send a general enquiry."
    >
      <section style={{
        padding: "96px 24px 48px", maxWidth: 900, margin: "0 auto", textAlign: "center",
      }}>
        <p style={{
          fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14,
        }}>Contact</p>
        <h1 style={{
          fontFamily: TYPE.display, fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700,
          lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 18,
        }}>
          Talk to us.
        </h1>
        <p style={{
          fontSize: "clamp(17px, 2vw, 21px)", color: PUBLIC.muted,
          lineHeight: 1.6, maxWidth: 640, margin: "0 auto",
        }}>
          Response time: 2 hours during business hours. Pick your division or send a general enquiry.
        </p>
      </section>

      <Section title="" eyebrow="">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, marginBottom: 48,
        }}>
          {DIVISIONS.map(d => (
            <div key={d.key} style={{
              padding: "24px 20px", backgroundColor: PUBLIC.white,
              borderRadius: RADIUS.lg, border: `1px solid ${PUBLIC.hairline}`,
              boxShadow: SHADOW.card,
            }}>
              <p style={{
                fontSize: 11, color: PUBLIC.navy, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
              }}>{d.category}</p>
              <p style={{
                fontFamily: TYPE.display, fontSize: 22, fontWeight: 700,
                letterSpacing: -0.4, marginBottom: 12,
              }}>{d.name}</p>
              <a href={`mailto:${d.email}`} style={{
                fontSize: 13, color: PUBLIC.dark, textDecoration: "none",
                display: "block", marginBottom: 4,
              }}>📧 {d.email}</a>
              <a
                href={`tel:+234${d.whatsapp.replace(/^0/, "")}`}
                style={{ fontSize: 13, color: PUBLIC.dark, textDecoration: "none" }}
              >📞 {d.whatsapp}</a>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="General enquiry" title="Not sure where to start? Write to us." narrow>
        <GeneralContactForm />
      </Section>

      <Section eyebrow="Visit" title="Where we are" narrow>
        <div style={{
          padding: "32px 28px", backgroundColor: PUBLIC.white,
          borderRadius: RADIUS.lg, border: `1px solid ${PUBLIC.hairline}`,
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: TYPE.display, fontSize: 20, fontWeight: 600,
            marginBottom: 10, letterSpacing: -0.3,
          }}>
            Hamzury Business Institute
          </p>
          <p style={{ fontSize: 15, color: PUBLIC.muted, marginBottom: 14 }}>
            Ajami Plaza, Garki, Abuja
          </p>
          <p style={{ fontSize: 14, color: PUBLIC.dark, lineHeight: 1.7 }}>
            {CONTACT.hours.weekdays}<br/>
            {CONTACT.hours.saturday}<br/>
            <span style={{ color: PUBLIC.muted, fontSize: 12 }}>West Africa Time ({CONTACT.hours.timezone})</span>
          </p>
        </div>
      </Section>
    </PublicShell>
  );
}

function GeneralContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMut = trpc.leads.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => toast.error(e.message || "Could not send. Try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !service.trim()) {
      toast.error("Please fill in name and service.");
      return;
    }
    submitMut.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      service: service.trim(),
      context: message.trim() || undefined,
      source: "contact_form",
    } as any);
  };

  if (submitted) {
    return (
      <div style={{
        textAlign: "center", padding: "48px 24px",
        backgroundColor: PUBLIC.white, borderRadius: RADIUS.lg,
        border: `1px solid ${PUBLIC.hairline}`,
      }}>
        <p style={{
          fontFamily: TYPE.display, fontSize: 22, fontWeight: 600,
          marginBottom: 10, letterSpacing: -0.3,
        }}>Message received.</p>
        <p style={{ fontSize: 14, color: PUBLIC.muted, lineHeight: 1.7 }}>
          A member of the team will reach out within 2 business hours.
        </p>
      </div>
    );
  }

  const field: React.CSSProperties = {
    padding: "12px 16px", borderRadius: RADIUS.md,
    border: `1px solid ${PUBLIC.hairline}`, fontSize: 14,
    outline: "none", backgroundColor: PUBLIC.white, width: "100%",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "grid", gap: 14,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={field} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={field} />
      </div>
      <div style={{
        display: "grid", gap: 14,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (WhatsApp)" style={field} />
        <select value={service} onChange={e => setService(e.target.value)} style={field}>
          <option value="">Which service?</option>
          <option value="Bizdoc">Bizdoc · Tax & Compliance</option>
          <option value="Scalar">Scalar · Web & Automation</option>
          <option value="Medialy">Medialy · Social Media</option>
          <option value="HUB">HUB · Tech Training</option>
          <option value="General">Not sure yet</option>
        </select>
      </div>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="What are you trying to achieve? (optional)"
        rows={4}
        style={{ ...field, resize: "vertical", fontFamily: "inherit" }}
      />
      <button type="submit" disabled={submitMut.isPending} style={{
        padding: "14px 24px", borderRadius: RADIUS.pill,
        backgroundColor: PUBLIC.navy, color: PUBLIC.white,
        fontSize: 15, fontWeight: 500, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        alignSelf: "flex-end", minWidth: 160,
      }}>
        {submitMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        Send message
      </button>
    </form>
  );
}
