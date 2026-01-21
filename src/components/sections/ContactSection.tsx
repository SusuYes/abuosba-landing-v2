"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { dict } from "@/lib/i18n";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
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

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormState("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--accent), var(--accent-2))",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Header */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
              05
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              {t.contact.title}
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              {t.contact.subtitle}
            </p>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder={t.contact.form.namePh}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder={t.contact.form.emailPh}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    {t.contact.form.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder={t.contact.form.messagePh}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)] resize-none"
                  />
                </div>

                {/* Submit */}
                <MagneticWrapper strength={0.1} className="w-full">
                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="w-full btn-primary glow-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {formState === "sending"
                        ? "..."
                        : formState === "success"
                        ? "Sent!"
                        : t.contact.form.send}
                    </span>
                  </button>
                </MagneticWrapper>

                {/* Success message */}
                {formState === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-green-500"
                  >
                    Message sent successfully!
                  </motion.p>
                )}

                {/* Error message */}
                {formState === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-red-500"
                  >
                    Failed to send. Please try email instead.
                  </motion.p>
                )}

                {/* Fallback */}
                {!accessKey && (
                  <p className="text-sm text-center text-[var(--muted)]">
                    {t.contact.form.fallback}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
