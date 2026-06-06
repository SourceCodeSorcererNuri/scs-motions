import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useNavigate, Link } from 'react-router-dom';

// --- CONFIGURATION & THEMES ---
const UI_THEMES = {
    dark: {
        bg: '#1a1d23',
        shadowLight: '#242831',
        shadowDark: '#0e1014',
        accent: '#22d3ee',
        text: '#64748b',
        bright: '#f8fafc',
        glass: 'rgba(255, 255, 255, 0.03)',
    },
    light: {
        bg: '#e0e5ec',
        shadowLight: '#ffffff',
        shadowDark: '#a3b1c6',
        accent: '#3b82f6',
        text: '#718096',
        bright: '#1a202c',
        glass: 'rgba(255, 255, 255, 0.4)',
    }
};

// --- ANIMATION VARIANTS ---
const cardVariants = {
    offscreen: { opacity: 0, y: 50 },
    onscreen: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 0.8,
            delay: i * 0.1
        }
    })
};

// --- TYPES ---
interface HomePageProps {
    onEnter: () => void;
}

type ThemeKey = 'dark' | 'light';
type LangKey = 'EN' | 'UZ';

export const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
    const [theme, setTheme] = useState<ThemeKey>('dark');
    const [lang, setLang] = useState<LangKey>('EN');
    const navigate = useNavigate();

    const c = UI_THEMES[theme];

    const pageContent = {
        EN: {
            badges: [
                "✓ Open Source Project",
                "✓ Live Canvas Preview",
                "✓ Hardware GPU Accelerated"
            ],
        },
        UZ: {
            badges: [
                "✓ Ochiq kodli loyiha",
                "✓ Jonli Canvas ko'rinishi",
                "✓ GPU Apparatli tezlashtirish"
            ],
        }
    };

    const p = pageContent[lang];

    // --- EFFECTS ---
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        const saved = localStorage.getItem('scs-theme') as ThemeKey;
        if (saved) setTheme(saved);

        return () => lenis.destroy();
    }, []);

    // --- HELPERS ---
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('scs-theme', newTheme);
    };

    const getShadow = (inset = false, intensity = 1) => {
        const dist = 8 * intensity;
        const blur = 16 * intensity;
        if (inset) return `inset 4px 4px 10px ${c.shadowDark}, inset -4px -4px 10px ${c.shadowLight}`;
        return `${dist}px ${dist}px ${blur}px ${c.shadowDark}, -${dist}px -${dist}px ${blur}px ${c.shadowLight}`;
    };

    const navContent = {
        EN: {
            templates: "Templates Gallery",
            editor: "Studio Editor",
            docs: "Documentation",
            logo: "SCS-MOTIONS"
        },
        UZ: {
            templates: "Shablonlar Galereyasi",
            editor: "Studiya Muharriri",
            docs: "Hujjatlar va Qo'llanma",
            logo: "SCS-MOTIONS"
        }
    };

    const n = navContent[lang];

    // --- CONTENT DATA ---
    const features = lang === 'EN' ? [
        { title: "Dynamic Easing & Physics", desc: "Advanced physics-based bezier curves for highly natural, professional web and video animations.", icon: "📈" },
        { title: "GPU Hardware Acceleration", desc: "Render complex canvas paths and motion graphics instantly with zero-lag hardware processing.", icon: "⚡" },
    ] : [
        { title: "Dinamik va Fizik Animatsiyalar", desc: "Tabiiy va professional veb-animatsiyalar uchun ilg'or fizikaga asoslangan Bezier egri chiziqlari.", icon: "📈" },
        { title: "GPU Apparatli Tezlashtirish", desc: "Murakkab grafik yo'llarni kechikishlarsiz, to'g'ridan-to'g'ri video karta orqali tezkor renderlash.", icon: "⚡" },
    ];

    return (
        <motion.div animate={{ backgroundColor: c.bg }} style={{ ...s.container, color: c.text }}>
            <GlobalStyles c={c} />

            {/* --- NAVIGATION (SEO Optimized with Links) --- */}
            <header>
                <nav style={s.nav} aria-label="Main Navigation">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <Link to="/" style={{ ...s.logo, color: c.bright, textDecoration: 'none' }}>{n.logo}</Link>

                        <div style={s.navLinks}>
                            <Link to="/gallery" style={{ ...s.navLinkItem, color: c.text, textDecoration: 'none' }}>
                                {n.templates}
                            </Link>
                            <Link to="/editor" style={{ ...s.navLinkItem, color: c.text, textDecoration: 'none' }}>
                                {n.editor}
                            </Link>
                            <span style={s.navLinkItem} aria-disabled="true">
                                {n.docs}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
                            style={{ ...s.switchTrack, boxShadow: getShadow(true), border: 'none', background: 'transparent' }}
                            aria-label="Toggle Theme"
                        >
                            <motion.div
                                animate={{ x: theme === 'dark' ? 26 : 0 }}
                                style={{ ...s.switchKnob, background: c.accent, boxShadow: getShadow() }}
                            />
                        </button>

                        {/* Language Switcher */}
                        <div style={{ ...s.langContainer, background: c.glass, boxShadow: getShadow(true, 0.4) }}>
                            {(['EN', 'UZ'] as LangKey[]).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    style={{ ...s.langOption, color: lang === l ? c.bright : c.text, border: 'none', background: 'transparent' }}
                                >
                                    {lang === l && (
                                        <motion.div
                                            layoutId="activeLang"
                                            style={{ ...s.langActiveBg, background: c.bg, boxShadow: getShadow(false, 0.5) }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span style={{ position: 'relative', zIndex: 3 }}>{l}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            </header>

            {/* --- HERO SECTION --- */}
            <section style={s.introSection}>
                <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={cardVariants} custom={0} style={s.introContent}>
                    <span style={{ ...s.introBadge, color: c.accent, boxShadow: getShadow(true, 0.5) }}>
                        {lang === 'EN' ? 'ESTABLISHED 2026 • MOTION PLATFORM' : '2026-YIL ISHGA TUSHIRILDI • ANIMATSIYA PLATFORMASI'}
                    </span>
                    <h1 style={{ ...s.introTitle, color: c.bright }}>
                        {lang === 'EN' ? (
                            <>High-Performance Tools for the <br /><span style={{ color: c.accent }}>Next Generation</span> of Visual Creators.</>
                        ) : (
                            <>Biz <span style={{ color: c.accent }}>Yangi Avlod</span> vizual kontent yaratuvchilari uchun yuqori samarali texnologiyalarni taqdim etamiz.</>
                        )}
                    </h1>
                    <p style={s.introSub}>
                        {lang === 'EN'
                            ? "SCS-MOTIONS delivers precision programmatic tools, combining physics-based data layers with highly performant browser-side engineering."
                            : "SCS-MOTIONS yuqori aniqlikdagi dasturlash vositalarini taqdim etadi. Fizik modellar va tezkor brauzer muhandisligining mukammal uyg'unligi."}
                    </p>
                </motion.div>
            </section>

            {/* --- CORE PRODUCT FEATURED SECTION --- */}
            <main style={s.hero}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} style={{ ...s.glassCard, boxShadow: getShadow() }}>
                    <div style={s.contentLayout}>
                        <article style={s.textContent}>
                            <h2 style={{ ...s.title, color: c.bright, fontSize: '32px' }}>
                                {lang === 'EN' ? "Advanced Programmatic Template Editor" : "Ilg'or Dasturlashtirilgan Shablonlar Muharriri"}
                            </h2>
                            <p style={s.description}>
                                {lang === 'EN'
                                    ? "Experience the full capacity of programmatic motion layouts. Manipulate timeline keyframes with complex logic, render raw vectors dynamically, and export web-ready operational scripts instantly."
                                    : "Dasturlash orqali boshqariladigan harakatlar to'plami. Animatsiya kadrlarini mantiqiy kod yordamida tahrirlang, vektorlarni dinamik render qiling va tayyor skriptlarni darhol eksport qiling."}
                            </p>

                            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', opacity: 0.6, fontSize: '12px', fontWeight: 600 }}>
                                {p.badges.map((badge, index) => (
                                    <span key={index}>{badge}</span>
                                ))}
                            </div>

                            <div style={s.statsGrid}>
                                <StatBox label={lang === 'EN' ? 'Vector Render' : 'Vektorli Render'} val="SVG" shadow={getShadow(true)} accent={c.accent} />
                                <StatBox label={lang === 'EN' ? 'Target Performance' : 'Maqsadli Tezlik'} val="60 FPS" shadow={getShadow(true)} accent={c.accent} />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/editor')}
                                style={{ ...s.mainBtn, boxShadow: getShadow(), color: c.bright }}
                            >
                                {lang === 'EN' ? 'Launch Web Studio Editor' : 'Veb Studiyani Ishga Tushirish'}
                            </motion.button>
                        </article>

                        <div style={s.visualSection} aria-hidden="true">
                            <div style={{ ...s.outerCircle, boxShadow: getShadow() }}>
                                <div style={{ ...s.innerCircle, boxShadow: getShadow(true) }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        style={{ ...s.orbit, border: `2px dashed ${c.accent}44` }}
                                    >
                                        <div style={{ ...s.planet, background: c.accent, boxShadow: `0 0 20px ${c.accent}` }} />
                                    </motion.div>
                                    <span style={{ fontSize: '40px' }}>🎬</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* --- FEATURES GRID (Semantic Section) --- */}
            <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 0 80px 0' }}>
                <h2 style={{ textAlign: 'center', color: c.bright, fontSize: '24px', marginBottom: '10px', fontWeight: 800 }}>
                    {lang === 'EN' ? "Engine Architecture Features" : "Tizimning Texnik Imkoniyatlari"}
                </h2>
                <div style={s.featuresGrid}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial="offscreen"
                            whileInView="onscreen"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={cardVariants}
                            custom={i}
                            whileHover={{ scale: 1.05, boxShadow: getShadow(false, 1.2) }}
                            style={{ ...s.featureCard, boxShadow: getShadow() }}
                        >
                            <div style={{ fontSize: '24px', marginBottom: '15px' }}>{f.icon}</div>
                            <h3 style={{ color: c.bright, fontSize: '18px', margin: '0 0 10px 0', fontWeight: 700 }}>{f.title}</h3>
                            <p style={{ fontSize: '13px', margin: 0, opacity: 0.7, lineHeight: 1.5 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- FOOTER (Semantic) --- */}
            <footer style={s.footer}>
                <div style={s.statusGroup}>
                    <div style={{ ...s.dot, background: c.accent }} />
                    <span style={s.statusText}>
                        {lang === 'EN' ? 'SYSTEM STATUS: OPERATIONAL' : 'TIZIM HOLATI: FAOL'}
                    </span>
                </div>
                <div style={s.footerMeta}>2026 © SCS-MOTIONS CORE INTERFACE</div>
            </footer>
        </motion.div>
    );
};

// --- SUB-COMPONENTS ---
const GlobalStyles = ({ c }: { c: any }) => (
    <style>{`
        body, html { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background: ${c.bg}; scroll-behavior: smooth; }
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${c.bg}; }
        ::-webkit-scrollbar-thumb { background: ${c.shadowDark}; border-radius: 10px; }
    `}</style>
);

const StatBox = ({ label, val, shadow, accent }: any) => (
    <div style={{ ...s.statItem, boxShadow: shadow }}>
        <span style={{ ...s.statNum, color: accent }}>{val}</span>
        <span style={s.statLabel}>{label}</span>
    </div>
);

// --- STYLES OBJECT ---
const s: Record<string, React.CSSProperties> = {
    container: { width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' },
    nav: { height: '80px', width: '100%', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' },
    langContainer: { display: 'flex', padding: '4px', borderRadius: '12px', gap: '4px', position: 'relative', backdropFilter: 'blur(5px)' },
    langOption: { padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.3s ease' },
    langActiveBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '8px', zIndex: 1 },
    introSection: { padding: '170px 30px 10px 30px', display: 'flex', justifyContent: 'center', textAlign: 'center', height: '100%', },
    introContent: { maxWidth: '850px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    introBadge: { padding: '8px 20px', borderRadius: '30px', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', marginBottom: '15px' },
    introTitle: { fontSize: '42px', fontWeight: 800, lineHeight: 1.2, marginBottom: '15px' },
    introSub: { fontSize: '17px', lineHeight: 1.6, maxWidth: '650px', opacity: 0.8 },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', padding: '30px 40px 0 40px' },
    featureCard: { padding: '30px', borderRadius: '30px', cursor: 'pointer', transition: 'box-shadow 0.3s ease' },
    logo: { fontWeight: 900, letterSpacing: '1px', fontSize: '18px' },
    switchTrack: { width: '56px', height: '30px', borderRadius: '15px', padding: '2px', cursor: 'pointer', position: 'relative' },
    switchKnob: { width: '26px', height: '26px', borderRadius: '50%' },
    hero: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px 60px 40px', height: '100%' },
    glassCard: { width: '100%', maxWidth: '1100px', borderRadius: '50px', padding: '60px', position: 'relative' },
    contentLayout: { display: 'flex', gap: '60px', alignItems: 'center' },
    textContent: { flex: 1.2 },
    title: { fontSize: '45px', margin: '0 0 20px 0', lineHeight: 1.1, fontWeight: 800 },
    description: { fontSize: '16px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '540px' },
    statsGrid: { display: 'flex', gap: '20px', marginBottom: '40px' },
    statItem: { padding: '20px', borderRadius: '24px', flex: 1, textAlign: 'center' },
    statNum: { display: 'block', fontSize: '24px', fontWeight: 900 },
    statLabel: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 },
    mainBtn: { padding: '20px 40px', borderRadius: '20px', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 700, cursor: 'pointer' },
    visualSection: { flex: 0.8, display: 'flex', justifyContent: 'center' },
    outerCircle: { width: '300px', height: '300px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    innerCircle: { width: '220px', height: '220px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    orbit: { position: 'absolute', width: '260px', height: '260px', borderRadius: '50%' },
    planet: { width: '12px', height: '12px', borderRadius: '50%', position: 'absolute', top: '50%', left: '-6px' },
    footer: { height: '80px', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 800 },
    statusGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    dot: { width: '8px', height: '8px', borderRadius: '50%' },
    statusText: { opacity: 0.6, letterSpacing: '1px' },
    footerMeta: { opacity: 0.3 },
    navLinks: { display: 'flex', gap: '25px', marginLeft: '20px' },
    navLinkItem: { fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.7 }
};

export default HomePage;
