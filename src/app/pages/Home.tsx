import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { motion, AnimatePresence } from 'framer-motion';
import { WebRendererApp } from '../WebRenderApp';
import templatesData from '../data/templates.json';
import { ComponentRegistry } from '../utils/component-registry';

const UI = {
    dark: {
        bg: '#1a1d23',
        shadowLight: '#242831',
        shadowDark: '#0e1014',
        accent: '#22d3ee',
        text: '#64748b',
        activeText: '#f8fafc',
    },
    light: {
        bg: '#e0e5ec',
        shadowLight: '#ffffff',
        shadowDark: '#a3b1c6',
        accent: '#3b82f6',
        text: '#718096',
        activeText: '#1a202c',
    }
};

export const Home: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
        return localStorage.getItem('scs-active-page');
    });
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Handle Window Resize for Responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeTemplateId) {
            localStorage.setItem('scs-active-page', activeTemplateId);
        } else {
            localStorage.removeItem('scs-active-page');
        }
    }, [activeTemplateId]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('scs-theme') as 'dark' | 'light';
        if (savedTheme) setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('scs-theme', newTheme);
    };

    const c = theme === 'dark' ? UI.dark : UI.light;
    const categories = ['All', ...new Set(templatesData.templates.map(t => t.category))];

    const getShadow = (inset = false, hover = false) => {
        const dist = hover ? 10 : 7;
        const blur = hover ? 20 : 14;
        if (inset) return `inset 3px 3px 8px ${c.shadowDark}, inset -3px -3px 8px ${c.shadowLight}`;
        return `${dist}px ${dist}px ${blur}px ${c.shadowDark}, -${dist}px -${dist}px ${blur}px ${c.shadowLight}`;
    };

    const filteredTemplates = templatesData.templates.filter(t => {
        const title = t.title || "";
        return (selectedCategory === 'All' || t.category === selectedCategory) &&
            title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (activeTemplateId) {
        return <WebRendererApp initialTemplateId={activeTemplateId} onBack={() => setActiveTemplateId(null)} />;
    }

    return (
        <motion.div
            initial={false}
            animate={{ backgroundColor: c.bg }}
            style={{
                ...s.page,
                color: c.text,
                padding: isMobile ? '0 15px' : '0 40px'
            }}
        >
            <style>{`
                body { margin: 0; padding: 0; overflow: hidden; }
                * { box-sizing: border-box; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                input::placeholder { color: ${c.text}; opacity: 0.5; }
            `}</style>

            <header style={{
                ...s.header,
                flexDirection: isMobile ? 'column' : 'row',
                height: isMobile ? 'auto' : '12vh',
                padding: isMobile ? '20px 0' : '0',
                gap: isMobile ? '15px' : '0'
            }}>
                <div style={s.brand}>
                    <h1 style={{ ...s.logo, color: c.activeText }}>SCS-MOTIONS</h1>
                    <div style={{ ...s.dot, background: c.accent }} />
                </div>

                <div style={{
                    flex: 1,
                    margin: isMobile ? '0' : '0 40px',
                    maxWidth: isMobile ? '100%' : '400px',
                    width: '100%'
                }}>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            ...s.searchInput,
                            boxShadow: getShadow(true),
                            color: c.activeText,
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>

                <div onClick={toggleTheme} style={{ ...s.switchTrack, boxShadow: getShadow(true) }}>
                    <motion.div
                        animate={{ x: theme === 'dark' ? 24 : 0 }}
                        style={{ ...s.switchKnob, background: c.accent, boxShadow: getShadow() }}
                    />
                </div>
            </header>

            <div style={{
                ...s.contentWrapper,
                flexDirection: isMobile ? 'column' : 'row',
                height: isMobile ? 'calc(100vh - 180px)' : '88vh'
            }}>
                {/* Responsive Sidebar/TopBar */}
                <aside className="no-scrollbar" style={{
                    ...s.sidebar,
                    width: isMobile ? '100%' : '260px',
                    padding: isMobile ? '10px' : '30px 20px',
                    boxShadow: isMobile ? 'none' : getShadow(),
                    flexDirection: isMobile ? 'row' : 'column',
                    overflowX: isMobile ? 'auto' : 'hidden',
                    marginBottom: isMobile ? '10px' : '20px'
                }}>
                    {!isMobile && <p style={s.sectionTitle}>ASSETS</p>}
                    <div className="no-scrollbar" style={{
                        ...s.sidebarScroll,
                        display: isMobile ? 'flex' : 'block',
                        gap: isMobile ? '10px' : '0'
                    }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    ...s.catBtn,
                                    color: selectedCategory === cat ? c.accent : c.text,
                                    boxShadow: selectedCategory === cat ? getShadow(true) : 'none',
                                    fontWeight: selectedCategory === cat ? 800 : 400,
                                    whiteSpace: 'nowrap',
                                    padding: isMobile ? '8px 16px' : '16px',
                                    width: isMobile ? 'auto' : '100%'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="no-scrollbar" style={{ ...s.gridContainer, padding: isMobile ? '10px 0' : '30px' }}>
                    <div style={{
                        ...s.grid,
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'
                    }}>
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                c={c}
                                getShadow={getShadow}
                                isMobile={isMobile}
                                // Logic: Is this specific card the one allowed to play?
                                isPlaying={playingId === template.id}
                                // Logic: Tell the parent to switch the active player
                                onTogglePlay={(shouldPlay: boolean) => {
                                    setPlayingId(shouldPlay ? template.id : null);
                                }}
                                onSelect={() => setActiveTemplateId(template.id)}
                            />
                        ))}
                    </div>
                    {filteredTemplates.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', opacity: 0.5 }}>
                            No motions found
                        </div>
                    )}
                    <div style={{ height: '100px' }} />
                </main>
            </div>
        </motion.div>
    );
};

const TemplateCard = ({ template, c, getShadow, onSelect, isMobile, isPlaying, onTogglePlay }: any) => {
    // We only use local hover for desktop logic
    const [isHovered, setIsHovered] = useState(false);

    const handleInteraction = () => {
        if (isMobile) {
            if (!isPlaying) {
                // First tap: Start this preview, parent will kill others
                onTogglePlay(true);
            } else {
                // Second tap: Open template
                onSelect();
            }
        } else {
            onSelect();
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsHovered(true);
            onTogglePlay(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsHovered(false);
            onTogglePlay(false);
        }
    };

    // The player only renders if the parent says this ID is the active one
    const activePreview = isMobile ? isPlaying : (isHovered && isPlaying);

    return (
        <motion.div
            onClick={handleInteraction}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.97 }}
            style={{
                ...s.card,
                boxShadow: getShadow(false, activePreview),
                // Visual indicator that this card is "Active"
                border: isPlaying ? `1px solid ${c.accent}` : '1px solid transparent',
            }}
        >
            <div style={{ ...s.previewBox, boxShadow: getShadow(true) }}>
                <AnimatePresence mode="wait">
                    {activePreview ? (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={s.full}
                        >
                            <Player
                                component={ComponentRegistry[template.id] || (() => null)}
                                inputProps={template.defaultProps}
                                durationInFrames={template.durationInFrames}
                                fps={template.fps}
                                compositionWidth={template.dimensions.width}
                                compositionHeight={template.dimensions.height}
                                style={s.player}
                                autoPlay
                                loop
                            />
                            {isMobile && (
                                <div style={s.mobileHint}>Tap again to open</div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="static" style={s.placeholder}>
                            <div style={{ ...s.icon, color: c.accent }}>{template.title[0]}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div style={s.meta}>
                <span style={s.label}>{template.category}</span>
                <h3 style={{ ...s.title, color: c.activeText }}>{template.title}</h3>
            </div>
        </motion.div>
    );
};

const s: Record<string, React.CSSProperties> = {
    page: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
    },
    brand: { display: 'flex', alignItems: 'center', gap: '10px' },
    logo: { fontSize: '20px', fontWeight: 900, letterSpacing: '1px', margin: 0 },
    dot: { width: '8px', height: '8px', borderRadius: '50%' },
    searchInput: { width: '100%', padding: '12px 20px', borderRadius: '15px', border: 'none', outline: 'none', fontSize: '14px', transition: '0.3s' },
    switchTrack: { width: '56px', height: '30px', borderRadius: '20px', padding: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
    switchKnob: { width: '24px', height: '24px', borderRadius: '50%' },
    contentWrapper: {
        display: 'flex',
        gap: '20px',
    },
    gridContainer: { flex: 1, overflowY: 'auto' },
    grid: { display: 'grid', gap: '30px', padding: '25px' },
    sidebar: {
        borderRadius: '30px',
        display: 'flex',
        flexShrink: 0
    },
    sidebarScroll: { overflowY: 'auto', flex: 1 },
    sectionTitle: { fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '20px', letterSpacing: '3px' },
    catBtn: { border: 'none', background: 'transparent', borderRadius: '16px', textAlign: 'left', cursor: 'pointer', transition: '0.2s' },
    previewBox: { width: '100%', aspectRatio: '16/9', borderRadius: '18px', overflow: 'hidden', backgroundColor: '#00000008', position: 'relative' },
    placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    icon: { fontSize: '32px', fontWeight: 900, opacity: 0.15 },
    player: { width: '100%', height: '100%' },
    meta: { marginTop: '15px' },
    label: { fontSize: '8px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' },
    title: { fontSize: '14px', margin: '4px 0 0 0', fontWeight: 700 },
    full: { width: '100%', height: '100%' },
    mobileHint: {
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '10px',
        pointerEvents: 'none',
        fontWeight: 600,
        whiteSpace: 'nowrap'
    },
    card: {
        padding: '14px',
        borderRadius: '24px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease'
    },
};
