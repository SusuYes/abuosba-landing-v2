"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { DecodeText } from "@/components/ui/GlitchText";
import { dict } from "@/lib/i18n";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = dict();

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessKey) {
      window.location.href = `mailto:${t.contact.email}`;
      return;
    }

    setFormState("sending");
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("access_key", accessKey);
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setFormState("success");
        e.currentTarget.reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden">
      {/* Convergent light — the signal arrives */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={isInView ? { opacity: 0.12 } : { opacity: 0 }}
        transition={{ duration: 2 }}
        style={{ background: `radial-gradient(ellipse 50% 60% at 50% 40%, rgba(var(--accent-rgb), 0.12), transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div initial={{ width: 0 }} animate={isInView ? { width: "2rem" } : {}} transition={{ duration: 0.6 }} className="h-px bg-[var(--accent)] mb-4" />
            <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
              {isInView ? <DecodeText text="04 // CONTACT" delay={200} speed={50} /> : "04 // CONTACT"}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{t.contact.title}</h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed">{t.contact.subtitle}</p>

            <motion.div
              className="mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-mono text-[var(--muted)]">CHANNEL_OPEN</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 relative group">
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
                animate={{ opacity: focusedField ? 0.6 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">{t.contact.form.name}</label>
                  <input
                    type="text" id="name" name="name" required placeholder={t.contact.form.namePh}
                    onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">{t.contact.form.email}</label>
                  <input
                    type="email" id="email" name="email" required placeholder={t.contact.form.emailPh}
                    onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/50"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">{t.contact.form.message}</label>
                  <textarea
                    id="message" name="message" required rows={5} placeholder={t.contact.form.messagePh}
                    onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/50 resize-none"
                  />
                </div>

                <MagneticWrapper strength={0.1} className="w-full">
                  <button type="submit" disabled={formState === "sending"} className="w-full btn-primary glow-hover disabled:opacity-50 disabled:cursor-not-allowed">
                    <span>{formState === "sending" ? "Sending..." : formState === "success" ? "Sent!" : t.contact.form.send}</span>
                  </button>
                </MagneticWrapper>

                {formState === "success" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-green-500 text-sm">
                    Message sent successfully!
                  </motion.p>
                )}
                {formState === "error" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-red-500 text-sm">
                    Failed to send. Please try email instead.
                  </motion.p>
                )}
                {!accessKey && <p className="text-sm text-center text-[var(--muted)]">{t.contact.form.fallback}</p>}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
