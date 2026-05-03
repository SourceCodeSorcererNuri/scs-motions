import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Player } from '@remotion/player';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import templatesData from './data/templates.json';
import { ComponentRegistry } from './utils/component-registry';

interface WebRendererProps {
    initialTemplateId?: string | null;
    onBack?: () => void;
}

const ffmpeg = new FFmpeg();

const UI = {
    dark: {
        bg: '#1a1d23',
        high: 'rgba(255, 255, 255, 0.05)',
        shadowLight: '#242831',
        shadowDark: '#0e1014',
        accent: '#22d3ee',
        text: '#64748b',
        activeText: '#f8fafc',
        gradient: 'linear-gradient(145deg, #1c2027, #171a1f)'
    },
    light: {
        bg: '#e0e5ec',
        high: 'rgba(255, 255, 255, 0.9)',
        shadowLight: '#ffffff',
        shadowDark: '#a3b1c6',
        accent: '#3b82f6',
        text: '#718096',
        activeText: '#1a202c',
        gradient: 'linear-gradient(145deg, #f0f5ff, #d8dee9)'
    }
};

type Tab = 'templates' | 'preview' | 'config';

export const WebRendererApp: React.FC<WebRendererProps> = ({ initialTemplateId, onBack }) => {
    const data = templatesData?.templates ? templatesData : { templates: [] };
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('scs-theme') as 'dark' | 'light') || 'dark';
    });
    const [status, setStatus] = useState<'idle' | 'rendering' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [selectedId, setSelectedId] = useState(initialTemplateId || data.templates[0]?.id || "");
    const renderController = useRef<AbortController | null>(null);
    const c = theme === 'dark' ? UI.dark : UI.light;
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('scs-theme', newTheme);
    };


    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setActiveTab('preview');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeTemplate = useMemo(() =>
        data.templates.find(t => t.id === selectedId) || data.templates[0],
        [selectedId, data]);

    const [templateProps, setTemplateProps] = useState(activeTemplate.defaultProps || {});
    const ActiveComponent = ComponentRegistry[selectedId];

    useEffect(() => {
        setTemplateProps(activeTemplate.defaultProps || {});
        if (activeTemplate.type === 'fixed' && activeTemplate.versions) {
            setSelectedVersion(Object.keys(activeTemplate.postLinks || {})[0]);
        }
    }, [selectedId, activeTemplate]);

    const getShadow = (inset = false, depth = 1) => {
        const dist = (isMobile ? 4 : 8) * depth;
        const blur = (isMobile ? 8 : 16) * depth;
        return inset
            ? `inset ${dist}px ${dist}px ${blur}px ${c.shadowDark}, inset -${dist}px -${dist}px ${blur}px ${c.shadowLight}`
            : `${dist}px ${dist}px ${blur}px ${c.shadowDark}, -${dist}px -${dist}px ${blur}px ${c.shadowLight}`;
    };

    const handleAction = async () => {
        if (status === 'rendering') return;

        const currentTemplate = data.templates.find(t => t.id === selectedId);
        const isTransparent = currentTemplate?.isTransparent === true;

        setStatus('rendering');
        setProgress(0);
        renderController.current = new AbortController();

        try {
            // 1. PERFORM THE REMOTION RENDER
            const { getBlob } = await renderMediaOnWeb({
                composition: {
                    id: selectedId,
                    component: ActiveComponent,
                    width: currentTemplate?.dimensions?.width || 1920,
                    height: currentTemplate?.dimensions?.height || 1080,
                    fps: currentTemplate?.fps || 60,
                    durationInFrames: currentTemplate?.durationInFrames || 300,
                    defaultProps: templateProps
                },
                inputProps: templateProps,
                onProgress: ({ progress: p }) => setProgress(p),
                signal: renderController.current.signal,
                container: isTransparent ? 'webm' : 'mp4',
                transparent: isTransparent,
                videoCodec: isTransparent ? 'vp9' : 'h264',
                licenseKey: "free-license",
            });

            let finalBlob = await getBlob();
            let finalExtension = isTransparent ? 'mov' : 'mp4';

            // 2. TRIGGER FFMPEG CONVERSION ONLY FOR TRANSPARENT FILES
            if (isTransparent) {
                console.log("Starting FFmpeg conversion to MOV (ProRes)...");

                // Load FFmpeg if not loaded
                if (!ffmpeg.loaded) {
                    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
                    await ffmpeg.load({
                        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                    });
                }

                // Write the WebM to FFmpeg's virtual file system
                await ffmpeg.writeFile('input.webm', await fetchFile(finalBlob));

                // Run the ProRes 4444 command
                // This preserves the alpha channel for Adobe/CapCut
                await ffmpeg.exec([
                    '-vcodec', 'libvpx-vp9', // Explicitly tell FFmpeg to use the VP9 decoder
                    '-i', 'input.webm',
                    '-c:v', 'qtrle',         // Use QuickTime Animation codec
                    '-pix_fmt', 'yuva420p',  // The pixel format with Alpha
                    'output.mov'
                ]);

                // Read the result
                const data = await ffmpeg.readFile('output.mov');
                finalBlob = new Blob([data], { type: 'video/quicktime' });
            }

            // 3. DOWNLOAD
            const url = URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedId}.${finalExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus('done');
            setTimeout(() => setStatus('idle'), 3000);

        } catch (e) {
            console.error("Critical Error:", e);
            setStatus('idle');
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ backgroundColor: c.bg }}
            style={{ ...s.app, color: c.text, flexDirection: isMobile ? 'column' : 'row' }}
        >
            <style>{`
                body { margin: 0; padding: 0; overflow: hidden; font-family: 'Inter', sans-serif; }
                input:focus { border: 1px solid ${c.accent} !important; box-shadow: ${getShadow(true, 0.8)} !important; }
                
                /* Improved Scrollbar for Mobile and Web */
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: ${c.shadowDark}; border-radius: 10px; }
                
                /* Force smooth scrolling on iOS */
                .scroll-container {
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>

            {(activeTab === 'templates' || !isMobile) && (
                <motion.aside
                    layout
                    initial={isMobile ? { opacity: 0, x: -20 } : {}}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        ...s.sidebar,
                        width: isMobile ? '100%' : '23dvw',
                        height: isMobile ? 'calc(100dvh - 70px)' : '100dvh',
                        background: c.bg,
                        boxShadow: getShadow(false, 1.2),
                        borderRight: isMobile ? 'none' : `1px solid ${c.high}`,
                        position: isMobile ? 'fixed' : 'relative',
                        top: 0,
                        left: 0
                    }}
                >
                    <div style={s.brandBox}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {onBack && (
                                <button onClick={onBack} style={s.backBtn}>←</button>
                            )}
                            <h2 style={{ ...s.logo, color: c.activeText }}>SCS-MOTIONS</h2>
                        </div>
                        <ThemeToggle theme={theme} setTheme={toggleTheme} c={c} getShadow={getShadow} />
                    </div>

                    <div className="scroll-container" style={{
                        ...s.scrollArea,
                        paddingBottom: isMobile ? '40px' : '20px'
                    }}>
                        {data.templates.map(t => (
                            <motion.button
                                key={t.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedId(t.id);
                                    if (isMobile) setActiveTab('preview');
                                }}
                                style={{
                                    ...s.navBtn,
                                    background: c.bg,
                                    boxShadow: getShadow(selectedId === t.id, selectedId === t.id ? 0.4 : 0.8),
                                    color: selectedId === t.id ? c.accent : c.text,
                                    border: `1px solid ${selectedId === t.id ? c.accent + '44' : 'transparent'}`
                                }}
                            >
                                <div style={{ fontSize: '9px', opacity: 0.6, fontWeight: 800 }}>{t.category.toUpperCase()}</div>
                                <div style={{ marginTop: '4px', fontWeight: selectedId === t.id ? 700 : 500 }}>{t.title}</div>
                            </motion.button>
                        ))}
                    </div>
                </motion.aside>
            )}

            {(activeTab === 'preview' || !isMobile) && (
                <main style={{ ...s.main, padding: isMobile ? '20px' : '40px' }}>
                    <motion.div
                        layout
                        style={{
                            ...s.stageHousing,
                            background: c.bg,
                            boxShadow: getShadow(true, 1.5),
                            height: isMobile ? '60%' : '75%',
                            padding: isMobile ? '10px' : '15px'
                        }}
                    >
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: activeTemplate.isTransparent ? 'repeating-conic-gradient(#2b2b2b 0% 25%, #1a1a1a 0% 50%) 50% / 20px 20px' : '#000'
                        }}>
                            <AnimatePresence mode="wait">
                                {status === 'rendering' ? (
                                    <motion.div key="render" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.renderView}>
                                        <div style={{ ...s.meterTrack, background: c.bg, boxShadow: getShadow(true, 1) }}>
                                            <motion.div
                                                animate={{ width: `${progress * 100}%` }}
                                                style={{ ...s.meterFill, background: `linear-gradient(90deg, ${c.accent}, #818cf8)` }}
                                            />
                                        </div>
                                        <h3 style={{ color: c.activeText, marginTop: '20px' }}>{Math.round(progress * 100)}%</h3>
                                    </motion.div>
                                ) : (
                                    <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
                                        <Player
                                            component={ActiveComponent}
                                            durationInFrames={Number(templateProps.totalFrames) || activeTemplate.durationInFrames}
                                            inputProps={{ ...templateProps, version: selectedVersion }}
                                            fps={activeTemplate.fps}
                                            compositionWidth={activeTemplate.dimensions.width}
                                            compositionHeight={activeTemplate.dimensions.height}
                                            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                                            controls
                                            loop
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <div style={{ ...s.actionRow, width: isMobile ? '100%' : 'auto' }}>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAction}
                            disabled={status === 'rendering'}
                            style={{
                                ...s.primeBtn,
                                width: isMobile ? '100%' : 'auto',
                                background: status === 'rendering' ? c.shadowDark : c.accent,
                                color: theme === 'dark' ? '#000' : '#fff',
                                boxShadow: getShadow(false, 1.1)
                            }}
                        >
                            {activeTemplate.type === 'fixed' ? 'YUKLAB OLISH' : status === 'rendering' ? 'RENDER...' : 'RENDER VA YUKLASH'}
                        </motion.button>
                    </div>
                </main>
            )}

            {/* --- CONFIG PANEL --- */}
            {(activeTab === 'config' || !isMobile) && (
                <aside style={{
                    ...s.propsPanel,
                    width: isMobile ? '100%' : '23dvw',
                    background: c.bg,
                    boxShadow: getShadow(false, 1.2),
                    borderLeft: isMobile ? 'none' : `1px solid ${c.high}`
                }}>
                    <h3 style={{ color: c.activeText, fontSize: '11px', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center' }}>SOZLAMALAR</h3>
                    <div style={s.inputStack}>
                        {activeTemplate.type === 'fixed' ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '12px',
                                marginTop: '10px',
                                width: '100%'
                            }}>
                                {Object.keys(activeTemplate.postLinks || {}).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setSelectedVersion(v)}
                                        style={{
                                            ...s.versionBtn,
                                            background: c.bg,
                                            boxShadow: getShadow(selectedVersion === v, selectedVersion === v ? 0.4 : 0.8),
                                            color: selectedVersion === v ? c.accent : c.text,
                                            border: `1px solid ${selectedVersion === v ? c.accent + '44' : 'transparent'}`,
                                            borderRadius: '10px'
                                        }}
                                    >
                                        {v.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            Object.keys(templateProps).map(key => {
                                const value = templateProps[key];
                                const isNumber = typeof value === 'number' || ['totalFrames', 'transitionPercent', 'fontSize', 'strokeWidth'].includes(key);
                                const isArray = Array.isArray(value);

                                if (isArray) {
                                    return (
                                        <div key={key} style={s.inputBox}>
                                            <label style={s.label}>{key.toUpperCase()} (LIST)</label>
                                            {value.map((item: string, index: number) => (
                                                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <input
                                                        type="text"
                                                        style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.5), color: c.activeText, borderRadius: '12px' }}
                                                        value={item}
                                                        onChange={e => {
                                                            const newArray = [...value];
                                                            newArray[index] = e.target.value;
                                                            setTemplateProps({ ...templateProps, [key]: newArray });
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newArray = value.filter((_: any, i: number) => i !== index);
                                                            setTemplateProps({ ...templateProps, [key]: newArray });
                                                        }}
                                                        style={{ ...s.versionBtn, background: '#ef4444', color: '#fff', borderRadius: '10px', width: '40px' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setTemplateProps({ ...templateProps, [key]: [...value, "New Item"] })}
                                                style={{ ...s.versionBtn, background: c.high, color: c.accent, borderRadius: '10px', border: `1px dashed ${c.accent}` }}
                                            >
                                                + QO'SHISH
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={key} style={s.inputBox}>
                                        <label style={s.label}>{key.toUpperCase()}</label>
                                        <input
                                            type={isNumber ? "number" : "text"}
                                            step={key === 'transitionPercent' ? "0.01" : "1"}
                                            style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.5), color: c.activeText, borderRadius: '12px' }}
                                            value={value}
                                            onChange={e => {
                                                const rawValue = e.target.value;
                                                const finalValue = isNumber ? parseFloat(rawValue) || 0 : rawValue;
                                                setTemplateProps({ ...templateProps, [key]: finalValue });
                                            }}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>
            )}

            {isMobile && (
                <nav style={{
                    ...s.mobileNav,
                    background: c.bg,
                    borderTop: `1px solid ${c.high}`,
                    boxShadow: `0 -10px 30px ${c.shadowDark}`
                }}>
                    {(['templates', 'preview', 'config'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...s.mobileTabBtn,
                                color: activeTab === tab ? c.accent : c.text,
                                borderTop: activeTab === tab ? `2px solid ${c.accent}` : '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span style={{
                                fontSize: '10px',
                                fontWeight: activeTab === tab ? '900' : '500',
                                letterSpacing: '1px'
                            }}>
                                {tab.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </nav>
            )}
        </motion.div>
    );
};

const ThemeToggle = ({ theme, setTheme, c, getShadow }: any) => (
    <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{ ...s.themeToggle, background: c.bg, boxShadow: getShadow(true, 1) }}
    >
        <motion.div
            animate={{ x: theme === 'dark' ? 20 : 0 }}
            style={{ ...s.knob, background: c.accent }}
        />
    </button>
);

const s: Record<string, React.CSSProperties> = {
    app: { display: 'flex', height: '100dvh', width: '100dvw', overflow: 'hidden' },
    brandBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    logo: { fontSize: '14px', fontWeight: 900, margin: 0 },
    navBtn: { width: '100%', padding: '14px', border: 'none', marginBottom: '12px', cursor: 'pointer', textAlign: 'left', borderRadius: '12px' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' },
    stageHousing: { width: '100%', boxSizing: 'border-box', maxWidth: '850px', borderRadius: '25px' },
    actionRow: { marginTop: '20px', padding: '0 20px', boxSizing: 'border-box' },
    primeBtn: { padding: '16px 30px', border: 'none', fontWeight: 800, fontSize: '11px', letterSpacing: '1px', borderRadius: '12px', textTransform: 'uppercase' },
    propsPanel: { padding: '20px', zIndex: 10, overflowY: 'auto', boxSizing: 'border-box' },
    inputStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '9px', fontWeight: 800, opacity: 0.5 },
    field: { border: 'none', padding: '12px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    versionBtn: { border: 'none', padding: '10px 15px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
    renderView: { height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111' },
    meterTrack: { width: '200px', height: '10px', padding: '3px', borderRadius: '20px' },
    meterFill: { height: '100%', borderRadius: '10px' },
    themeToggle: { border: 'none', cursor: 'pointer', width: '50px', height: '26px', borderRadius: '20px', padding: '3px', display: 'flex', alignItems: 'center' },
    knob: { width: '20px', height: '20px', borderRadius: '50%' },
    mobileNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70px',
        display: 'flex',
        width: '100%',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxSizing: 'content-box'
    },
    mobileTabBtn: { flex: 1, border: 'none', background: 'transparent', fontSize: '10px', letterSpacing: '1px' },
    sidebar: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxSizing: 'border-box',
        overflow: 'hidden'
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        padding: "25px",
        marginTop: '10px'
    },
    backBtn: {
        background: 'transparent',
        border: 'none',
        color: '#22d3ee',
        cursor: 'pointer',
        fontSize: '18px',
        marginRight: '10px',
        padding: '5px'
    }
};
