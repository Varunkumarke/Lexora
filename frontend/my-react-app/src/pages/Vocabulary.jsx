

import React, { useState, useEffect, useRef } from 'react';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import './Vocabulary.css';


// const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Available domains — add more here as you expand
const DOMAINS = [
    "All Domains",
    "Software Development",
    "Web Development",
    "Programming",
    "Machine Learning",
    "Cybersecurity",
    "Cloud Computing",
    "Database",
    "DevOps",
    "Textile",
    "Manufacturing",
];

// Domain icons for image placeholder
const DOMAIN_ICONS = {
    "Software Development": "⚙️",
    "Web Development": "🌐",
    "Programming": "💻",
    "Machine Learning": "🤖",
    "Cybersecurity": "🔐",
    "Cloud Computing": "☁️",
    "Database": "🗄️",
    "DevOps": "🔄",
    "Textile": "🧵",
    "Manufacturing": "🏭",
    "default": "📚"
};

const getDomainIcon = (domain) => {
    if (!domain) return DOMAIN_ICONS["default"];
    for (const key of Object.keys(DOMAIN_ICONS)) {
        if (domain.toLowerCase().includes(key.toLowerCase())) {
            return DOMAIN_ICONS[key];
        }
    }
    return DOMAIN_ICONS["default"];
};

/* ---------- Small inline icons (visual only) ---------- */
const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const IconBack = () => (<svg {...svg} width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
const IconSearch = () => (<svg {...svg} width="18" height="18"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>);
const IconClose = () => (<svg {...svg} width="14" height="14"><path d="M18 6L6 18M6 6l12 12" /></svg>);
const IconChevL = () => (<svg {...svg} width="16" height="16"><path d="M15 18l-6-6 6-6" /></svg>);
const IconChevR = () => (<svg {...svg} width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>);
const IconSpeaker = ({ size = 18 }) => (<svg {...svg} width={size} height={size}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>);
const IconPause = ({ size = 18 }) => (<svg {...svg} width={size} height={size} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>);

/** One audio control used everywhere (word, meaning, examples, native text). Same handler, one look. */
const AudioBtn = ({ state, onClick, label, size = 'md' }) => (
    <button
        type="button"
        className={`vocab-audio-btn vocab-audio-btn--${size}${state.isPlaying ? ' playing' : ''}`}
        onClick={onClick}
        disabled={state.isLoading}
        aria-label={state.isPlaying ? `Pause: ${label}` : `Listen: ${label}`}
        aria-pressed={state.isPlaying}
    >
        {state.isLoading ? <span className="audio-loading-spinner" aria-hidden="true"></span>
            : state.isPlaying ? <IconPause size={size === 'sm' ? 13 : 16} />
            : <IconSpeaker size={size === 'sm' ? 15 : 18} />}
    </button>
);

const VocabularyCard = ({ data, onNext, currentIndex, totalCards, onBack, onPrevious }) => {
    const [selectedNativeLanguage, setSelectedNativeLanguage] = useState('hindi');
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentAudioType, setCurrentAudioType] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [imageError, setImageError] = useState(false);

    // --- Search states ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('All Domains');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [notFoundWord, setNotFoundWord] = useState('');   // triggers separate not-found page
    const [isSearchMode, setIsSearchMode] = useState(false);

    // Current display data — either searched word or original prop data
    const displayData = isSearchMode && searchResult ? searchResult : data;

    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);

    // Reset on word change
    useEffect(() => {
        setImageError(false);
        setIsSearchMode(false);
        setSearchResult(null);
        setNotFoundWord('');
        setSearchQuery('');
    }, [data.word]);

    const handleLanguageChange = (e) => setSelectedNativeLanguage(e.target.value);
    const nativeData = displayData.nativeLanguages?.[selectedNativeLanguage];

    useEffect(() => {
        return () => { stopAudio(); };
    }, []);

    const stopAudio = () => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (audioUrlRef.current) { window.URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
        setIsPlaying(false);
        setCurrentAudioType(null);
        setAudioLoading(false);
    };

    // ===== SEARCH HANDLER =====
    const handleSearch = async () => {
        const query = searchQuery.trim();
        if (!query) return;

        setSearchLoading(true);
        setNotFoundWord('');
        setSearchResult(null);

        try {
            const domain = selectedDomain === 'All Domains' ? '' : selectedDomain;
            const url = `${API_BASE_URL}/api/vocabulary/search?word=${encodeURIComponent(query)}${domain ? `&domain=${encodeURIComponent(domain)}` : ''}`;

            const response = await fetch(url);
            const result = await response.json();

            if (response.ok && result.found) {
                const wordDoc = result.data;
                const mappedData = {
                    word:       wordDoc.word,
                    phonetic:   wordDoc.phonetic,
                    wordType:   wordDoc.wordType,
                    meaning:    wordDoc.meaning,
                    domain:     wordDoc.domain,
                    forms:      wordDoc.forms || [],
                    examples:   wordDoc.examples || [],
                    synonyms:   wordDoc.synonyms || [],
                    antonyms:   wordDoc.antonyms || [],
                    imageUrl:   wordDoc.image_url || null,
                    nativeLanguages: {
                        hindi:  { word: wordDoc.native?.hindi?.word  || wordDoc.nativeLanguages?.hindi?.word  || "", description: wordDoc.native?.hindi?.meaning  || wordDoc.nativeLanguages?.hindi?.description || wordDoc.nativeLanguages?.hindi?.meaning || "" },
                        telugu: { word: wordDoc.native?.telugu?.word || wordDoc.nativeLanguages?.telugu?.word || "", description: wordDoc.native?.telugu?.meaning || wordDoc.nativeLanguages?.telugu?.description || wordDoc.nativeLanguages?.telugu?.meaning || "" },
                        tamil:  { word: wordDoc.native?.tamil?.word  || wordDoc.nativeLanguages?.tamil?.word  || "", description: wordDoc.native?.tamil?.meaning  || wordDoc.nativeLanguages?.tamil?.description || wordDoc.nativeLanguages?.tamil?.meaning || "" },
                    }
                };
                setSearchResult(mappedData);
                setIsSearchMode(true);
                setImageError(false);
            // } else {
            //     // Trigger not-found page
            //     setNotFoundWord(query);
            //     setIsSearchMode(false);
            // }
            } else if (result.generating === false) {
    // Generation failed — show not found page
    setNotFoundWord(query);
    setIsSearchMode(false);
} else {
    // Should not reach here but fallback
    setNotFoundWord(query);
    setIsSearchMode(false);
}
        } catch (err) {
            console.error("Search error:", err);
            setNotFoundWord(query);
            setIsSearchMode(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResult(null);
        setNotFoundWord('');
        setIsSearchMode(false);
        stopAudio();
    };

    // ===== AUDIO HANDLER =====
    const handleAudio = async (text, audioType) => {
        if (!text) return;
        if (currentAudioType === audioType && isPlaying) { stopAudio(); return; }
        if (currentAudioType !== audioType && audioRef.current) stopAudio();
        if (currentAudioType === audioType && !isPlaying && audioRef.current) {
            try { await audioRef.current.play(); setIsPlaying(true); } catch { stopAudio(); }
            return;
        }
        try {
            setAudioLoading(true);
            setCurrentAudioType(audioType);
            const response = await fetch(`${API_BASE_URL}/api/tts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            if (!response.ok) throw new Error("Audio generation failed");
            const blob = await response.blob();
            const audioUrl = window.URL.createObjectURL(blob);
            audioUrlRef.current = audioUrl;
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => { stopAudio(); };
            audio.onerror = () => { stopAudio(); };
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Audio error:", error);
            stopAudio();
        } finally {
            setAudioLoading(false);
        }
    };

    const renderExampleWithHighlight = (example) => {
        if (!example || !displayData.word) return example;
        const lowerExample = example.toLowerCase();
        const lowerWord = displayData.word.toLowerCase();
        const index = lowerExample.indexOf(lowerWord);
        if (index === -1) return example;
        return (
            <>
                {example.substring(0, index)}
                <span className="vocab-highlighted-word">
                    {example.substring(index, index + displayData.word.length)}
                </span>
                {example.substring(index + displayData.word.length)}
            </>
        );
    };

    const handlePrevious = () => {
        stopAudio(); handleClearSearch();
        if (onPrevious && currentIndex > 0) onPrevious();
    };

    const handleNext = () => {
        stopAudio(); handleClearSearch();
        if (onNext && currentIndex < totalCards - 1) { onNext(); }
        else if (currentIndex >= totalCards - 1) { onBack(); }
    };

    const getAudioButtonState = (audioType) => {
        const isCurrentAudio = currentAudioType === audioType;
        return {
            isPlaying: isCurrentAudio && isPlaying,
            isLoading: audioLoading && isCurrentAudio,
            isPaused: isCurrentAudio && !isPlaying && audioRef.current
        };
    };


    const renderImage = () => {
        if (displayData.imageUrl && !imageError) {
            return (
                <img
                    src={displayData.imageUrl}
                    alt={displayData.word}
                    className="vocab-hero-illustration"
                    onError={() => setImageError(true)}
                />
            );
        }
        return (
            <div className="vocab-image-placeholder">
                <div className="vocab-placeholder-icon" aria-hidden="true">{getDomainIcon(displayData.domain)}</div>
                <div className="vocab-placeholder-word vocab-serif">{displayData.word}</div>
                <div className="vocab-placeholder-type">{displayData.wordType}</div>
            </div>
        );
    };

    // Lesson navigation (Previous / Next) — handlers already existed; set to false to hide the bar again.
    const SHOW_LESSON_NAV = true;

    // ===== TOP BAR (shared between normal view and not-found page) =====
    const renderTopBar = () => (
        <header className="vocab-top-bar">
            <div className="vocab-title-row">
                <button type="button" className="vocab-back-btn" onClick={onBack} aria-label="Back to dashboard">
                    <IconBack /><span>Back</span>
                </button>
                <div className="vocab-heading">
                    <h2 className="vocab-page-title vocab-serif">Vocabulary</h2>
                    <span className="vocab-counter">
                        {isSearchMode ? 'Search result' : totalCards > 0 ? `Word ${currentIndex + 1} of ${totalCards}` : ''}
                    </span>
                </div>
            </div>

            <div className="vocab-search-group" role="search">
                <div className="vocab-search-bar">
                    <span className="vocab-search-icon"><IconSearch /></span>
                    <input
                        type="text"
                        className="vocab-search-input"
                        placeholder="Search for a word..."
                        aria-label="Search for a word"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    {(isSearchMode || searchQuery) && (
                        <button type="button" className="vocab-search-clear-btn" onClick={handleClearSearch} title="Clear search" aria-label="Clear search">
                            <IconClose />
                        </button>
                    )}
                </div>
                <select
                    className="vocab-domain-select"
                    aria-label="Filter by domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                >
                    {DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>{domain}</option>
                    ))}
                </select>
                <button type="button" className="vocab-search-btn" onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                    {searchLoading ? <span className="audio-loading-spinner audio-loading-spinner--light" aria-label="Searching"></span> : 'Search'}
                </button>
            </div>
        </header>
    );

    // ===== NOT FOUND — SEPARATE PAGE =====
    if (notFoundWord && !isSearchMode) {
        return (
            <div className="vocab-container">
                <div className="vocab-glass-container">
                    {renderTopBar()}
                    <div className="vocab-not-found-page" role="status">
                        <div className="vocab-not-found-emoji" aria-hidden="true">🔎</div>
                        <h2 className="vocab-not-found-title vocab-serif">Word not found</h2>
                        <p className="vocab-not-found-subtitle">
                            Sorry, <strong>"{notFoundWord}"</strong> was not found in our vocabulary.
                        </p>
                        <p className="vocab-not-found-message">
                            We are constantly expanding our vocabulary database.<br />
                            This word's information will be added as soon as possible!
                        </p>
                        <button type="button" className="vocab-not-found-back-btn" onClick={handleClearSearch}>
                            <IconBack /> Back to lesson
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const examples = (displayData.examples || []).slice(0, 3);
    const synonyms = (displayData.synonyms || []).slice(0, 3);
    const antonyms = (displayData.antonyms || []).slice(0, 3);
    const forms = displayData.forms || [];
    const wordState = getAudioButtonState('word');
    const meaningState = getAudioButtonState('meaning');
    const nativeWordState = getAudioButtonState('native-word');
    const nativeDescState = getAudioButtonState('native-description');
    const nativeLang = { hindi: 'hi', telugu: 'te', tamil: 'ta' }[selectedNativeLanguage];

    // ===== NORMAL / SEARCH RESULT VIEW =====
    return (
        <div className="vocab-container">
            <div className="vocab-glass-container">

                {renderTopBar()}

                <main className="vocab-grid">

                    {/* MAIN ENTRY: word, meaning, examples, relations */}
                    <article className="vocab-card vocab-entry" aria-label={`Entry for ${displayData.word}`}>
                        <div className="vocab-entry-meta">
                            {displayData.wordType && <span className="vocab-category-pill">{displayData.wordType}</span>}
                            {displayData.domain && (
                                <span className="vocab-domain-chip">
                                    <span aria-hidden="true">{getDomainIcon(displayData.domain)}</span> {displayData.domain}
                                </span>
                            )}
                        </div>

                        <div className="vocab-word-row">
                            <div className="vocab-word-text">
                                <h1 className="vocab-hero-word vocab-serif">{displayData.word}</h1>
                                {displayData.phonetic && <p className="vocab-phonetic">{displayData.phonetic}</p>}
                            </div>
                            <button
                                type="button"
                                className={`vocab-listen-btn ${wordState.isPlaying ? 'playing' : ''}`}
                                onClick={() => handleAudio(displayData.word, 'word')}
                                disabled={wordState.isLoading}
                                aria-label={wordState.isPlaying ? `Pause pronunciation of ${displayData.word}` : `Listen to ${displayData.word}`}
                                aria-pressed={wordState.isPlaying}
                            >
                                {wordState.isLoading ? <span className="audio-loading-spinner audio-loading-spinner--light" aria-hidden="true"></span>
                                    : wordState.isPlaying ? <IconPause size={18} /> : <IconSpeaker size={20} />}
                                <span className="vocab-listen-label">{wordState.isPlaying ? 'Pause' : 'Listen'}</span>
                            </button>
                        </div>

                        <section className="vocab-section" aria-labelledby="vocab-h-meaning">
                            <h5 id="vocab-h-meaning">Meaning</h5>
                            <div className="vocab-meaning-block">
                                <p className="vocab-meaning-text">{displayData.meaning}</p>
                                <AudioBtn state={meaningState} onClick={() => handleAudio(displayData.meaning, 'meaning')} label="meaning" size="sm" />
                            </div>
                        </section>

                        {examples.length > 0 && (
                            <section className="vocab-section" aria-labelledby="vocab-h-examples">
                                <h5 id="vocab-h-examples">Examples</h5>
                                <ul className="vocab-example-list">
                                    {examples.map((ex, i) => {
                                        const exampleState = getAudioButtonState(`example-${i}`);
                                        return (
                                            <li key={i} className={exampleState.isPlaying ? 'playing-audio' : ''}>
                                                <div className="vocab-ex-text">{renderExampleWithHighlight(ex)}</div>
                                                <AudioBtn state={exampleState} onClick={() => handleAudio(ex, `example-${i}`)} label={`example ${i + 1}`} size="sm" />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        )}

                        {(synonyms.length > 0 || antonyms.length > 0 || forms.length > 0) && (
                            <section className="vocab-relations" aria-label="Related words">
                                {synonyms.length > 0 && (
                                    <div className="vocab-rel-group">
                                        <h5>Synonyms</h5>
                                        <div className="vocab-tags-row">
                                            {synonyms.map((s, i) => (
                                                <span key={i} className={`vocab-pill-tag ${i === 0 ? 'vocab-blue-fill' : ''}`}>{typeof s === 'string' ? s : s.word}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {antonyms.length > 0 && (
                                    <div className="vocab-rel-group">
                                        <h5>Antonyms</h5>
                                        <div className="vocab-tags-row">
                                            {antonyms.map((a, i) => (
                                                <span key={i} className="vocab-pill-tag vocab-red-fill">{typeof a === 'string' ? a : a.word}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {forms.length > 0 && (
                                    <div className="vocab-rel-group">
                                        <h5>Forms</h5>
                                        <div className="vocab-tags-row">
                                            {forms.map((f, i) => (<span key={i} className="vocab-pill-tag">{f}</span>))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </article>

                    {/* ASIDE: picture + native language */}
                    <aside className="vocab-aside">
                        <figure className="vocab-card vocab-figure">{renderImage()}</figure>

                        <section className="vocab-card vocab-native-card" aria-labelledby="vocab-h-native">
                            <div className="vocab-header-with-action">
                                <h5 id="vocab-h-native">In your language</h5>
                                <select
                                    className="vocab-language-select"
                                    aria-label="Native language"
                                    value={selectedNativeLanguage}
                                    onChange={handleLanguageChange}
                                >
                                    <option value="hindi">Hindi (हिन्दी)</option>
                                    <option value="telugu">Telugu (తెలుగు)</option>
                                    <option value="tamil">Tamil (தமிழ்)</option>
                                </select>
                            </div>
                            <div className="vocab-native-content" lang={nativeLang}>
                                <div className="vocab-audio-row">
                                    <h2 className="vocab-native-script">{nativeData?.word || "Translation unavailable"}</h2>
                                    <AudioBtn state={nativeWordState} onClick={() => handleAudio(nativeData?.word || "", 'native-word')} label="native word" size="sm" />
                                </div>
                                {nativeData?.description && (
                                    <div className="vocab-audio-row vocab-audio-row--top">
                                        <p className="vocab-sub-text vocab-desc">{nativeData.description}</p>
                                        <AudioBtn state={nativeDescState} onClick={() => handleAudio(nativeData.description, 'native-description')} label="native meaning" size="sm" />
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </main>

                {/* --- LESSON NAVIGATION --- */}
                {SHOW_LESSON_NAV && totalCards > 0 && (
                    <footer className="vocab-footer-section">
                        <div className="vocab-progress-container" aria-hidden="true">
                            <div className="vocab-progress-track">
                                <div className="vocab-progress-fill" style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="vocab-action-buttons-row">
                            <button type="button" className="vocab-footer-btn vocab-outline" onClick={handlePrevious} disabled={currentIndex === 0 || isSearchMode}>
                                <IconChevL /> Previous
                            </button>
                            <button type="button" className="vocab-footer-btn vocab-solid" onClick={handleNext} disabled={isSearchMode}>
                                {currentIndex >= totalCards - 1 ? 'Finish' : 'Next'}
                                {currentIndex < totalCards - 1 && <IconChevR />}
                            </button>
                        </div>
                    </footer>
                )}

            </div>
        </div>
    );
};

export default VocabularyCard;



