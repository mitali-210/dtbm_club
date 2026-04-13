import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/Jf1xcHhRRiPCD2EVz6tgoz';

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-32 px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto py-16 md:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-16">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="mb-8">
              <span className="font-['Bebas_Neue'] text-4xl tracking-wider">DTBM</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              A community powered running movement pushing limits and celebrating every mile.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-6">
              Navigate
            </p>
            <ul className="space-y-4">
              <FooterLink href="#about">About</FooterLink>
              <FooterLink href="#events">Events</FooterLink>
              <FooterLink href="#community">Community</FooterLink>
            </ul>
          </div>

          {/* Community */}
          <div className="md:col-span-3">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-6">
              Community
            </p>
            <ul className="space-y-4">
              <FooterLink href="/community">Community Page</FooterLink>
              <FooterLink href={WHATSAPP_COMMUNITY_URL}>WhatsApp Group</FooterLink>
              <FooterLink href="https://www.instagram.com/dtbmclub/">Instagram</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-6">
              Contact
            </p>
            <ul className="space-y-4">
              <FooterInline Icon={Mail} label="dtbmrunclub@gmail.com" href="mailto:dtbmrunclub@gmail.com" />
              <FooterInline Icon={Phone} label="+91 74209 15388" href="tel:+917420915388" />
              <FooterInline Icon={MessageCircle} label="Join WhatsApp" href={WHATSAPP_COMMUNITY_URL} />
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-3">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-6">
              Connect
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Instagram} href="https://www.instagram.com/dtbmclub/" />
              <SocialIcon Icon={MessageCircle} href={WHATSAPP_COMMUNITY_URL} />
              <SocialIcon Icon={Mail} href="mailto:dtbmrunclub@gmail.com" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="font-['Space_Mono'] text-xs text-white/40">
              © 2026 DTBM Run Club. All rights reserved.
            </p>
            <p className="font-['Space_Mono'] text-xs text-white/40">
              Nashik, Maharashtra
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ Icon, href }: { Icon: any; href: string }) {
  return (
    <a
      href={href}
      className="w-10 h-10 border border-white/20 hover:border-white/40 hover:bg-white/5 flex items-center justify-center transition-all duration-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon size={16} className="text-white/60" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="font-['Space_Mono'] text-xs text-white/60 hover:text-white transition-colors"
      >
        {children}
      </a>
    </li>
  );
}

function FooterInline({ Icon, label, href }: { Icon: any; label: string; href: string }) {
  return (
    <li>
      <a href={href} className="font-['Space_Mono'] text-xs text-white/60 hover:text-white transition-colors flex items-center gap-2">
        <Icon size={13} />
        <span>{label}</span>
      </a>
    </li>
  );
}