// yesofflineem_admin/lib/preview-labels.ts
import type { Lang } from "./event-i18n";

export const LOGO_PARTS = ["yes", "offline", "em"] as const;

export const NAV_LINK_LABELS: Record<Lang, { items: string[]; cta: string }> = {
  en: { items: ["Home", "events", "about us", "contact", "membership"], cta: "come with us" },
  hy: { items: ["Գլխավոր", "հանդիպումներ", "մեր մասին", "կապ", "անդամակցություն"], cta: "արի մեզ հետ" },
};

export const FOOTER_LABELS: Record<Lang, {
  tagline: string; explore: string; home: string; events: string; about: string; contact: string;
  membership: string; connect: string; legal: string; privacy: string; terms: string;
  copyright: string; address: string;
}> = {
  en: {
    tagline: "a little more silence, a little more presence",
    explore: "Explore", home: "Home", events: "Events", about: "About us", contact: "Contact",
    membership: "membership", connect: "Connect", legal: "Useful links", privacy: "Privacy Policy",
    terms: "Terms of Use", copyright: "© 2026 yesofflineem · Yerevan, Armenia",
    address: "50A/29 Mashtots Ave, 0009, Yerevan, Armenia",
  },
  hy: {
    tagline: "մի փոքր ավելի լռություն, մի փոքր ավելի ներկայություն",
    explore: "Բացահայտել", home: "Գլխավոր", events: "Հանդիպումներ", about: "Մեր մասին", contact: "Կապ",
    membership: "անդամակցություն", connect: "Կապվել", legal: "Օգտակար հղումներ",
    privacy: "Օգտագործման գաղտնիության քաղաքականություն", terms: "Օգտագործման պայմաններ",
    copyright: "© 2026 yesofflineem · Երևան, Հայաստան",
    address: "Մաշտոցի պող. 50Ա/29, 0009, Երևան, Հայաստան",
  },
};

export const DETAIL_LABELS: Record<Lang, {
  back: string; dateTime: string; location: string; groupSize: string; guests: string;
  availability: string; free: string; priceNote: string; reserve: string; soldOut: string;
  about: string; included: string; schedule: string; mapTitle: string; openMaps: string;
  priceUnit: string; viewReserve: string; yourHost: string;
  spotsLeft: (n: number) => string;
}> = {
  en: {
    back: "Back to events", dateTime: "Date and time", location: "Location", groupSize: "Group size",
    guests: "participants", availability: "Availability", free: "Free", priceNote: "AMD / person",
    reserve: "Reservation", soldOut: "Sold out", about: "About the experience", included: "What's Included",
    schedule: "Schedule", mapTitle: "Map —", openMaps: "Open in Maps ↗",
    priceUnit: "AMD / person", viewReserve: "view and reserve",
    yourHost: "Your host",
    spotsLeft: (n) => `Only ${n} spots remaining`,
  },
  hy: {
    back: "Հետ դեպի հանդիպումներ", dateTime: "Ամսաթիվ և ժամ", location: "Վայր", groupSize: "Խմբի չափ",
    guests: "հոգի", availability: "Հասանելիություն", free: "Անվճար", priceNote: "ՀՀ դրամ / անձ",
    reserve: "Ամրագրում", soldOut: "Ամբողջությամբ վաճառված", about: "Փորձառության մասին",
    included: "Ինչ է ներառված", schedule: "Ժամանակացույց", mapTitle: "Քարտեզ —", openMaps: "Բացել Maps-ում ↗",
    priceUnit: "ՀՀ դրամ / անձ", viewReserve: "Դիտել և ամրագրել",
    yourHost: "Ձեր կազմակերպիչը",
    spotsLeft: (n) => `${n} տեղ է մնացել`,
  },
};

export const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
];

export const CARD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80";
