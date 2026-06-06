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

    const [templateProps, setTemplateProps] = useState<Record<string, any>>({});
    const [customDuration, setCustomDuration] = useState<number>(600);
    const ActiveComponent = ComponentRegistry[selectedId];

    useEffect(() => {
        const defaultProps = activeTemplate.defaultProps || {};
        setTemplateProps(JSON.parse(JSON.stringify(defaultProps)));

        const initialDuration = Number(defaultProps.totalFrames) || activeTemplate.durationInFrames || 300;
        setCustomDuration(initialDuration);

        if (activeTemplate.type === 'fixed' && activeTemplate.versions) {
            setSelectedVersion(typeof activeTemplate.versions === 'string' ? activeTemplate.versions : Object.keys(activeTemplate.postLinks || {})[0]);
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

        const payloadProps = {
            ...templateProps,
            totalFrames: customDuration
        };

        try {
            const { getBlob } = await renderMediaOnWeb({
                composition: {
                    id: selectedId,
                    component: ActiveComponent,
                    width: currentTemplate?.dimensions?.width || 1920,
                    height: currentTemplate?.dimensions?.height || 1080,
                    fps: currentTemplate?.fps || 60,
                    durationInFrames: customDuration,
                    defaultProps: payloadProps
                },
                inputProps: payloadProps,
                onProgress: ({ progress: p }) => setProgress(p),
                signal: renderController.current.signal,
                container: isTransparent ? 'webm' : 'mp4',
                transparent: isTransparent,
                videoCodec: isTransparent ? 'vp9' : 'h264',
                licenseKey: "free-license",
            });

            let finalBlob = await getBlob();
            let finalExtension = isTransparent ? 'mov' : 'mp4';

            if (isTransparent) {
                console.log("Starting FFmpeg conversion to MOV (ProRes)...");

                if (!ffmpeg.loaded) {
                    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
                    await ffmpeg.load({
                        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                    });
                }

                await ffmpeg.writeFile('input.webm', await fetchFile(finalBlob));

                await ffmpeg.exec([
                    '-vcodec', 'libvpx-vp9',
                    '-i', 'input.webm',
                    '-c:v', 'qtrle',
                    '-pix_fmt', 'yuva420p',
                    'output.mov'
                ]);

                const data = await ffmpeg.readFile('output.mov');
                finalBlob = new Blob([data], { type: 'video/quicktime' });
            }

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
                select:focus { border: 1px solid ${c.accent} !important; outline: none; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: ${c.shadowDark}; border-radius: 10px; }
                .scroll-container { -webkit-overflow-scrolling: touch; }
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
                                        {ActiveComponent ? (
                                            <Player
                                                component={ActiveComponent}
                                                durationInFrames={customDuration}
                                                inputProps={{ ...templateProps, totalFrames: customDuration, version: selectedVersion }}
                                                fps={activeTemplate.fps}
                                                compositionWidth={activeTemplate.dimensions.width}
                                                compositionHeight={activeTemplate.dimensions.height}
                                                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                                                controls
                                                loop
                                            />
                                        ) : (
                                            <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Komponent yuklashda xatolik yuz berdi.</div>
                                        )}
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
                    <div className="scroll-container" style={{ height: 'calc(100% - 40px)', overflowY: 'auto', paddingRight: '4px' }}>
                        <div style={s.inputStack}>

                            {/* GLOBAL TACTILE DURATION PANEL */}
                            <div style={s.inputBox}>
                                <label style={s.label}>DAVOMIYLIGI (KADRLAR)</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => setCustomDuration(prev => Math.max(30, prev - 30))}
                                        style={{ ...s.stepperBtn, background: c.bg, boxShadow: getShadow(false, 0.6), color: c.text }}
                                    >
                                        -
                                    </motion.button>
                                    <input
                                        type="number"
                                        style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.5), color: c.activeText, borderRadius: '12px', textAlign: 'center' }}
                                        value={customDuration}
                                        onChange={e => setCustomDuration(Math.max(1, parseInt(e.target.value) || 0))}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => setCustomDuration(prev => prev + 30)}
                                        style={{ ...s.stepperBtn, background: c.bg, boxShadow: getShadow(false, 0.6), color: c.text }}
                                    >
                                        +
                                    </motion.button>
                                </div>
                                <span style={{ fontSize: '9px', opacity: 0.4, marginTop: '2px' }}>
                                    taxminan: {(customDuration / activeTemplate.fps).toFixed(1)} soniya ({activeTemplate.fps} FPS)
                                    Amina                          </span>
                            </div>

                            {activeTemplate.type === 'fixed' ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '12px',
                                    marginTop: '10px',
                                    width: '100%'
                                }}>
                                    {activeTemplate.postLinks && Object.keys(activeTemplate.postLinks || {}).map(v => (
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
                                    if (key === 'totalFrames') return null;

                                    const value = templateProps[key];
                                    const isNumber = typeof value === 'number' || ['transitionPercent', 'fontSize', 'strokeWidth', 'speedFactor', 'displayDurationFrames'].includes(key);
                                    const isArray = Array.isArray(value);
                                    const isColorKey = key.toLowerCase().includes('color');

                                    // Dynamic Theme Dropdown Handler ("themeStyle")
                                    if (key === 'themeStyle') {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>DIZAYN USLUBI (THEME STYLE)</label>
                                                <select
                                                    value={value}
                                                    onChange={e => setTemplateProps({ ...templateProps, [key]: e.target.value })}
                                                    style={{
                                                        ...s.field,
                                                        background: c.bg,
                                                        boxShadow: getShadow(false, 0.6),
                                                        color: c.activeText,
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="minimal">Minimal</option>
                                                    <option value="glassmorphic">Glassmorphic</option>
                                                    <option value="neumorphic">Neumorphic</option>
                                                </select>
                                            </div>
                                        );
                                    }

                                    // Inside your WebRendererApp.tsx template input parsing filter array block:
                                    if (key === 'animationDirection') {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>ANIMATSIYA YO'NALISHI</label>
                                                <select
                                                    value={value}
                                                    onChange={e => setTemplateProps({ ...templateProps, [key]: e.target.value })}
                                                    style={{
                                                        ...s.field,
                                                        background: c.bg,
                                                        boxShadow: getShadow(false, 0.6),
                                                        color: c.activeText,
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="gather">To'planish (Gather Inward)</option>
                                                    <option value="disperse">Parchalanish (Disperse Out)</option>
                                                </select>
                                            </div>
                                        );
                                    }

                                    // Add these parsing entries to capture numerical parameters smoothly
                                    if (key === 'windIntensity' || key === 'noiseScale') {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label style={s.label}>{key === 'windIntensity' ? "SHAMOL KUCHI (WIND)" : "XAOSTRASH (NOISE)"}</label>
                                                    <span style={{ fontSize: '10px', color: c.accent, fontWeight: '700' }}>{value}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={key === 'windIntensity' ? "10" : "5"}
                                                    step="0.1"
                                                    value={value}
                                                    onChange={e => setTemplateProps({ ...templateProps, [key]: parseFloat(e.target.value) })}
                                                    style={{
                                                        width: '100%',
                                                        cursor: 'pointer',
                                                        accentColor: c.accent
                                                    }}
                                                />
                                            </div>
                                        );
                                    }

                                    if (key === 'inDurationFrames' || key === 'outDurationFrames') {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>
                                                    {key === 'inDurationFrames' ? "KIRISH DAVOMIYLIGI (IN FRAMES)" : "CHIQISH DAVOMIYLIGI (OUT FRAMES)"}
                                                </label>
                                                <input
                                                    type="number"
                                                    style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.5), color: c.activeText, borderRadius: '12px' }}
                                                    value={value}
                                                    onChange={e => {
                                                        const val = Math.max(0, parseInt(e.target.value) || 0);
                                                        setTemplateProps({ ...templateProps, [key]: val });
                                                    }}
                                                />
                                            </div>
                                        );
                                    }

                                    // Object Arrays Handler (e.g. "accounts" inside template updates)
                                    if (isArray && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>{key.toUpperCase()} MA'LUMOTLARI</label>
                                                {value.map((item: any, index: number) => (
                                                    <div key={index} style={{
                                                        padding: '12px',
                                                        borderRadius: '14px',
                                                        background: c.bg,
                                                        boxShadow: getShadow(true, 0.4),
                                                        marginBottom: '12px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '9px', fontWeight: '900', color: c.accent }}>BLOK #{index + 1}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const newArray = value.filter((_: any, i: number) => i !== index);
                                                                    setTemplateProps({ ...templateProps, [key]: newArray });
                                                                }}
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                                                            >
                                                                OCHIRISH
                                                            </button>
                                                        </div>
                                                        {Object.keys(item).map(subKey => (
                                                            <div key={subKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontSize: '8px', opacity: 0.6 }}>{subKey.toUpperCase()}</span>
                                                                {subKey === 'platformName' ? (
                                                                    <select
                                                                        value={item[subKey]}
                                                                        onChange={e => {
                                                                            const newArray = [...value];
                                                                            newArray[index] = { ...item, [subKey]: e.target.value };
                                                                            setTemplateProps({ ...templateProps, [key]: newArray });
                                                                        }}
                                                                        style={{ ...s.field, background: c.bg, boxShadow: getShadow(false, 0.4), color: c.activeText, borderRadius: '8px', padding: '6px' }}
                                                                    >
                                                                        {['Telegram', 'Instagram', 'YouTube', 'GitHub', 'X'].map(p => (
                                                                            <option key={p} value={p}>{p}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.3), color: c.activeText, borderRadius: '8px', padding: '8px' }}
                                                                        value={item[subKey]}
                                                                        onChange={e => {
                                                                            const newArray = [...value];
                                                                            newArray[index] = { ...item, [subKey]: e.target.value };
                                                                            setTemplateProps({ ...templateProps, [key]: newArray });
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const defaultItem = { platformName: 'Telegram', handle: '@yangi_manzil' };
                                                        setTemplateProps({ ...templateProps, [key]: [...value, defaultItem] });
                                                    }}
                                                    style={{ ...s.versionBtn, background: c.high, color: c.accent, borderRadius: '10px', border: `1px dashed ${c.accent}`, marginTop: '4px' }}
                                                >
                                                    + BLOK QO'SHISH
                                                </button>
                                            </div>
                                        );
                                    }

                                    // Standard Primitive Arrays (e.g. iconKeys, subTexts)
                                    if (isArray) {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>{key.toUpperCase()} (LIST)</label>
                                                {value.map((item: string, index: number) => {
                                                    const itemIsColor = isColorKey || (typeof item === 'string' && (item.startsWith('#') || item.startsWith('rgb')));
                                                    return (
                                                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                {itemIsColor && (
                                                                    <AdvancedColorPicker
                                                                        value={item}
                                                                        onChange={(val) => {
                                                                            const newArray = [...value];
                                                                            newArray[index] = val;
                                                                            setTemplateProps({ ...templateProps, [key]: newArray });
                                                                        }}
                                                                        c={c}
                                                                        getShadow={getShadow}
                                                                    />
                                                                )}
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
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setTemplateProps({ ...templateProps, [key]: [...value, isColorKey ? "#22d3ee" : "Yangi Qator"] })}
                                                    style={{ ...s.versionBtn, background: c.high, color: c.accent, borderRadius: '10px', border: `1px dashed ${c.accent}` }}
                                                >
                                                    + QO'SHISH
                                                </button>
                                            </div>
                                        );
                                    }

                                    if (isColorKey) {
                                        return (
                                            <div key={key} style={s.inputBox}>
                                                <label style={s.label}>{key.toUpperCase()}</label>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <AdvancedColorPicker
                                                        value={String(value)}
                                                        onChange={(val) => setTemplateProps({ ...templateProps, [key]: val })}
                                                        c={c}
                                                        getShadow={getShadow}
                                                    />
                                                    <input
                                                        type="text"
                                                        style={{ ...s.field, background: c.bg, boxShadow: getShadow(true, 0.5), color: c.activeText, borderRadius: '12px' }}
                                                        value={value}
                                                        onChange={e => setTemplateProps({ ...templateProps, [key]: e.target.value })}
                                                    />
                                                </div>
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


/* --- ADVANCED SOFTWARE-STYLE COLOR PICKER COMPONENT --- */
interface AdvancedColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    c: any;
    getShadow: (inset?: boolean, depth?: number) => string;
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({ value, onChange, c, getShadow }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const [h, setH] = useState(190);
    const [sVal, setSVal] = useState(80);
    const [vVal, setVVal] = useState(90);
    const [alpha, setAlpha] = useState(1);

    useEffect(() => {
        if (!value) return;
        if (value.startsWith('#')) {
            let hex = value.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let hComp = 0, sComp = 0, vComp = max;
            const d = max - min;
            sComp = max === 0 ? 0 : d / max;

            if (max !== min) {
                switch (max) {
                    case r: hComp = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: hComp = (b - r) / d + 2; break;
                    case b: hComp = (r - g) / d + 4; break;
                }
                hComp /= 6;
            }
            setH(Math.round(hComp * 360));
            setSVal(Math.round(sComp * 100));
            setVVal(Math.round(vComp * 100));
            setAlpha(Number(a.toFixed(2)));
        } else if (value.startsWith('rgba') || value.startsWith('rgb')) {
            const match = value.match(/\d+(\.\d+)?/g);
            if (match && match.length >= 3) {
                const r = parseInt(match[0]) / 255;
                const g = parseInt(match[1]) / 255;
                const b = parseInt(match[2]) / 255;
                const a = match[3] ? parseFloat(match[3]) : 1;

                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let hComp = 0, sComp = 0, vComp = max;
                const d = max - min;
                sComp = max === 0 ? 0 : d / max;

                if (max !== min) {
                    switch (max) {
                        case r: hComp = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: hComp = (b - r) / d + 2; break;
                        case b: hComp = (r - g) / d + 4; break;
                    }
                    hComp /= 6;
                }
                setH(Math.round(hComp * 360));
                setSVal(Math.round(sComp * 100));
                setVVal(Math.round(vComp * 100));
                setAlpha(a);
            }
        }
    }, [isOpen, value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const triggerColorChange = (newH: number, newS: number, newV: number, newA: number) => {
        const sDec = newS / 100;
        const vDec = newV / 100;
        const hi = Math.floor((newH / 60) % 6);
        const f = (newH / 60) - hi;
        const p = vDec * (1 - sDec);
        const q = vDec * (1 - f * sDec);
        const t = vDec * (1 - (1 - f) * sDec);

        let r = 0, g = 0, b = 0;
        switch (hi) {
            case 0: r = vDec; g = t; b = p; break;
            case 1: r = q; g = vDec; b = p; break;
            case 2: r = p; g = vDec; b = t; break;
            case 3: r = p; g = q; b = vDec; break;
            case 4: r = t; g = p; b = vDec; break;
            case 5: r = vDec; g = p; b = q; break;
        }

        const red = Math.round(r * 255);
        const green = Math.round(g * 255);
        const blue = Math.round(b * 255);

        if (newA < 1) {
            onChange(`rgba(${red}, ${green}, ${blue}, ${newA})`);
        } else {
            const toHex = (num: number) => num.toString(16).padStart(2, '0');
            onChange(`#${toHex(red)}${toHex(green)}${toHex(blue)}`);
        }
    };

    const handleCanvasPointer = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const computedS = Math.round(x * 100);
        const computedV = Math.round((1 - y) * 100);
        setSVal(computedS);
        setVVal(computedV);
        triggerColorChange(h, computedS, computedV, alpha);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '44px',
                    height: '42px',
                    borderRadius: '12px',
                    border: `1px solid ${isOpen ? c.accent : 'transparent'}`,
                    background: value || '#fff',
                    boxShadow: getShadow(false, 0.6),
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute', zIndex: -1, inset: 0,
                    background: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px'
                }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            top: '50px',
                            left: 0,
                            width: '230px',
                            background: c.bg,
                            border: `1px solid ${c.high}`,
                            borderRadius: '16px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.35), 0 5px 15px rgba(0,0,0,0.2)',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        <div
                            ref={canvasRef}
                            onClick={handleCanvasPointer}
                            onMouseMove={(e) => e.buttons === 1 && handleCanvasPointer(e)}
                            style={{
                                width: '100%',
                                height: '130px',
                                borderRadius: '10px',
                                position: 'relative',
                                cursor: 'crosshair',
                                backgroundColor: `hsl(${h}, 100%, 50%)`,
                                backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                left: `${sVal}%`,
                                bottom: `${vVal}%`,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxShadow: '0 0 4px rgba(0,0,0,0.6)',
                                transform: 'translate(-6px, 6px)',
                                pointerEvents: 'none'
                            }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold' }}>
                                <span>TUS (HUE)</span>
                                <span>{h}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={h}
                                onChange={(e) => {
                                    const nextH = Number(e.target.value);
                                    setH(nextH);
                                    triggerColorChange(nextH, sVal, vVal, alpha);
                                }}
                                style={{
                                    width: '100%',
                                    WebkitAppearance: 'none',
                                    height: '8px',
                                    borderRadius: '5px',
                                    outline: 'none',
                                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold' }}>
                                <span>TINIQLIK (ALPHA)</span>
                                <span>{Math.round(alpha * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={alpha}
                                onChange={(e) => {
                                    const nextA = Number(e.target.value);
                                    setAlpha(nextA);
                                    triggerColorChange(h, sVal, vVal, nextA);
                                }}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '5px',
                                    outline: 'none',
                                    background: `linear-gradient(to right, transparent, hsl(${h}, ${sVal}%, ${vVal}%))`,
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', borderTop: `1px solid ${c.high}`, paddingTop: '10px' }}>
                            {['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff', '#000000'].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => {
                                        onChange(preset);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        height: '22px',
                                        borderRadius: '6px',
                                        background: preset,
                                        border: `1px solid ${c.high}`,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    app: { display: 'flex', height: '100dvh', width: '100dvw', overflow: 'hidden' },
    brandBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    logo: { fontSize: '14px', fontWeight: 900, margin: 0 },
    navBtn: { width: '100%', padding: '14px', border: 'none', marginBottom: '12px', cursor: 'pointer', textAlign: 'left', borderRadius: '12px' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' },
    stageHousing: { width: '100%', boxSizing: 'border-box', maxWidth: '850px', borderRadius: '25px' },
    actionRow: { marginTop: '20px', padding: '0 20px', boxSizing: 'border-box' },
    primeBtn: { padding: '16px 30px', border: 'none', fontWeight: 800, fontSize: '11px', letterSpacing: '1px', borderRadius: '12px', textTransform: 'uppercase' },
    propsPanel: { padding: '20px', zIndex: 10, boxSizing: 'border-box', height: '100dvh' },
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
    stepperBtn: { width: '40px', height: '42px', border: 'none', cursor: 'pointer', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
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
