import React, { useState, useEffect, useCallback } from 'react';
import type { Tab, Achievement, Project, GalleryItem, FamilyMember, BlogPost } from './types';

// --- ICONS ---
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const SocialIcons = {
    instagram: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>,
    linkedin: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>,
    github: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>,
    youtube: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.63 6.38 2 12 2s9.5 2.63 9.5 5c0 3.07 0 6.93 0 10a2.5 2.5 0 0 1-2.5 2.5c-3.07 0-6.93 0-10 0A2.5 2.5 0 0 1 2.5 17Z"></path><path d="m10 15 5-3-5-3z"></path></svg>,
};
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


// --- UTILITY HOOKS & FUNCTIONS ---

const useLocalStorageState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [key, state]);

    return [state, setState];
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});


const useStarTrail = () => {
    useEffect(() => {
        const stars: HTMLDivElement[] = [];
        const numStars = 20;
        const trailColors = ['#FFD700', '#ADD8E6', '#FFB6C1', '#98FB98', '#E6E6FA'];

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.style.position = 'fixed';
            star.style.top = '0';
            star.style.left = '0';
            star.style.width = '2px';
            star.style.height = '2px';
            star.style.borderRadius = '50%';
            star.style.backgroundColor = trailColors[Math.floor(Math.random() * trailColors.length)];
            star.style.pointerEvents = 'none';
            star.style.opacity = '0';
            star.style.transition = 'opacity 0.5s, transform 0.5s';
            star.style.zIndex = '9999';
            document.body.appendChild(star);
            stars.push(star);
        }

        const handleMouseMove = (e: MouseEvent) => {
            let index = 0;
            const moveStars = () => {
                if (index < numStars) {
                    const star = stars[index];
                    star.style.opacity = '1';
                    star.style.left = `${e.clientX}px`;
                    star.style.top = `${e.clientY}px`;
                    star.style.transform = `translate(-50%, -50%) scale(${1 - index / numStars})`;

                    setTimeout(() => {
                        star.style.opacity = '0';
                    }, 500);

                    index++;
                    setTimeout(moveStars, 20);
                }
            };
            moveStars();
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            stars.forEach(star => star.remove());
        };
    }, []);
};

// --- BACKGROUND ELEMENTS ---
const ParticleBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {[...Array(30)].map((_, i) => {
            const size = Math.random() * 3 + 1;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * -20;
            const xStart = Math.random() * 100;
            const xEnd = Math.random() * 100;
            const yStart = Math.random() * 100;
            const yEnd = Math.random() * 100;
            
            return (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-purple-400 to-cyan-300 opacity-20"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    animation: `float ${duration}s infinite ease-in-out`,
                    animationDelay: `${delay}s`,
                    top: `${yStart}%`,
                    left: `${xStart}%`,
                    '--x-end': `${xEnd}vw`,
                    '--y-end': `${yEnd}vh`
                } as React.CSSProperties}
            ></div>
            );
        })}
        <style>{`
            @keyframes float {
                0% { transform: translate(0, 0); }
                50% { transform: translate(calc(var(--x-end) - 50vw), calc(var(--y-end) - 50vh)); }
                100% { transform: translate(0, 0); }
            }
        `}</style>
    </div>
);

const FloatingShapes = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {[...Array(15)].map((_, i) => {
            const duration = Math.random() * 30 + 20;
            const delay = Math.random() * -25;
            const xStart = Math.random() * 100;
            const shapes = ['🎈', '✨', '💜', '⭐', '🌙', '💖', '🎉', '💫', '🦋'];
            
            return (
                <div key={i} className="absolute text-3xl md:text-5xl"
                    style={{
                        left: `${xStart}%`,
                        animation: `float-up ${duration}s infinite ease-in-out`,
                        animationDelay: `${delay}s`,
                    }}>
                    {shapes[i % shapes.length]}
                </div>
            );
        })}
    </div>
);

const FloatingDecorations = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
            const duration = Math.random() * 25 + 15;
            const delay = Math.random() * -20;
            const xStart = Math.random() * 100;
            const decorations = ['🌸', '💎', '🎀', '🎼', '🪐', '💌'];
            
            return (
                <div key={i} className="absolute text-2xl md:text-3xl"
                    style={{
                        left: `${xStart}%`,
                        animation: `float-up ${duration}s infinite ease-in-out`,
                        animationDelay: `${delay}s`,
                        opacity: Math.random() * 0.5 + 0.3,
                    }}>
                    {decorations[i % decorations.length]}
                </div>
            );
        })}
    </div>
);


// --- HEADER ---
interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    toggleTheme: () => void;
    theme: 'dark' | 'aurora';
}
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleTheme, theme }) => {
    const tabs: { id: Tab; label: string }[] = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About Me' },
        { id: 'blog', label: 'Blog' },
        { id: 'achievements', label: 'Achievements' },
        { id: 'projects', label: 'Projects' },
        { id: 'gallery', label: 'Gallery' },
    ];
    
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-md p-4 flex justify-between items-center transition-all duration-300">
            <div className="text-2xl font-display font-bold text-white tracking-widest">🌙 Fionaverse</div>
            <nav className="hidden md:flex items-center space-x-6">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-lg transition-all duration-300 relative ${activeTab === tab.id ? 'text-cyan-300' : 'text-gray-300 hover:text-white'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-cyan-300 rounded-full animate-pulse"></span>}
                    </button>
                ))}
            </nav>
            <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="holographic-btn p-2 rounded-full">
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    );
};


// --- HERO SECTION ---
interface HeroProps {
    onEnter: () => void;
}
const Hero: React.FC<HeroProps> = ({ onEnter }) => {
    const [profileImage, setProfileImage] = useLocalStorageState('profileImage', 'https://picsum.photos/200');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setProfileImage(base64);
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden p-4">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <label htmlFor="profile-upload" className="cursor-pointer">
                    <img src={profileImage} alt="Fiona Sachdeva" className="relative w-48 h-48 rounded-full object-cover border-4 border-gray-800" />
                </label>
                <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <h1 className="mt-8 text-6xl md:text-7xl font-display font-bold text-white animate-glow-text">Fiona Sachdeva</h1>
            <p className="mt-2 text-xl text-gray-300">🌸 Currently Creating...</p>
            <p className="mt-4 text-2xl font-light tracking-widest text-gray-200">Dream. Create. Shine. Repeat.</p>
            <button onClick={onEnter} className="mt-8 holographic-btn px-8 py-4 rounded-lg text-lg font-bold">✨ Enter My Universe</button>
            <style>{`
                @keyframes glow-text {
                    0%, 100% { text-shadow: 0 0 10px #fff, 0 0 20px #ab47bc, 0 0 30px #4dd0e1; }
                    50% { text-shadow: 0 0 20px #fff, 0 0 30px #ab47bc, 0 0 40px #4dd0e1; }
                }
                .animate-glow-text {
                    animation: glow-text 3s ease-in-out infinite;
                }
                .animate-tilt {
                  animation: tilt 10s infinite linear;
                }
                @keyframes tilt {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};


// --- SECTION WRAPPER ---
interface SectionWrapperProps {
    title: string;
    children: React.ReactNode;
    onAdd?: () => void;
    addLabel?: string;
}
const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, onAdd, addLabel, children }) => (
    <section className="min-h-screen pt-24 pb-12 px-4 md:px-10 lg:px-20 animate-fade-in">
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
        <div className="container mx-auto">
            <div className="flex justify-center items-center mb-12 relative">
                 <h2 className="text-5xl font-display font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">{title}</h2>
                 {onAdd && addLabel && (
                    <button onClick={onAdd} className="absolute right-0 flex items-center holographic-btn px-4 py-2 rounded-md text-sm font-semibold">
                       <PlusIcon/> {addLabel}
                    </button>
                 )}
            </div>
            {children}
        </div>
    </section>
);


// --- PAGE CONTENT COMPONENTS ---

const HomeContent: React.FC = () => {
    const [youtubeUrl, setYoutubeUrl] = useLocalStorageState('youtubeUrl', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
    const embedUrl = youtubeUrl.replace('watch?v=', 'embed/');

    return (
    <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-8">
        <p className="text-xl leading-relaxed text-gray-300">
            Welcome to my universe! I'm Fiona, a passionate creator, developer, and dreamer. This is my digital canvas where I share my journey, projects, and inspirations. Explore around and get a glimpse of the worlds I build and the stories I tell.
        </p>
        <div className="w-full">
            <div className="w-full aspect-video bg-black/30 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20">
                 <iframe className="w-full h-full" src={embedUrl} title="Welcome Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <div className="mt-4 text-left">
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-400 mb-1">Edit Welcome Video URL (YouTube):</label>
                <input 
                    id="youtube-url"
                    type="text" 
                    value={youtubeUrl} 
                    onChange={(e) => setYoutubeUrl(e.target.value)} 
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                />
            </div>
        </div>
        <div className="mt-8 border-t-2 border-purple-500/50 pt-8 w-full">
            <p className="text-2xl italic text-cyan-200">"The future belongs to those who believe in the beauty of their dreams."</p>
            <p className="text-lg text-gray-400 mt-2">- Eleanor Roosevelt</p>
        </div>
    </div>
)};

const FamilyTree: React.FC = () => {
    const defaultFamily: FamilyMember[] = [
        { id: 'paternal_grandmother', name: 'Grandmother', image: null },
        { id: 'paternal_grandfather', name: 'Grandfather', image: null },
        { id: 'father', name: 'Father', image: null },
        { id: 'mother', name: 'Mother', image: null },
        { id: 'uncle', name: 'Uncle', image: null },
        { id: 'aunt', name: 'Aunt', image: null },
        { id: 'me', name: 'Me', image: null },
        { id: 'brother1', name: 'Brother', image: null },
        { id: 'brother2', name: 'Brother', image: null },
        { id: 'sister', name: 'Sister', image: null },
        { id: 'sister2', name: 'Sister', image: null },
        { id: 'sister3', name: 'Sister', image: null },
    ];
    const [family, setFamily] = useLocalStorageState<FamilyMember[]>('familyTree', defaultFamily);
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId: FamilyMember['id']) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setFamily(prev => prev.map(member => member.id === memberId ? { ...member, image: base64 } : member));
        }
    };
    
    const renderMember = (id: FamilyMember['id'], extraClasses: string = '') => {
        const member = family.find(m => m.id === id);
        if (!member) return null;
        return (
            <div className={`family-tree-node ${extraClasses}`}>
                <label htmlFor={`upload-${member.id}`} className="cursor-pointer">
                    <img src={member.image || `https://via.placeholder.com/100?text=${member.name.replace(' ', '%0A')}`} alt={member.name} />
                </label>
                <input id={`upload-${member.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, member.id)} />
                <p className="mt-2 font-semibold text-gray-300 text-sm md:text-base">{member.name}</p>
            </div>
        );
    };

    return (
        <div className="bg-white/5 p-6 sm:p-8 rounded-lg mt-12">
            <h3 className="text-3xl font-bold text-purple-300 mb-12 text-center font-display">My Family Tree</h3>
            <div className="flex flex-col items-center gap-y-10 md:gap-y-12">
                
                {/* Grandparents */}
                <div className="flex justify-center gap-8 md:gap-16">
                    {renderMember('paternal_grandfather')}
                    {renderMember('paternal_grandmother')}
                </div>
                
                {/* Parents & Aunts/Uncles */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {renderMember('uncle')}
                    {renderMember('father')}
                    {renderMember('mother')}
                    {renderMember('aunt')}
                </div>

                {/* Me */}
                <div className="flex justify-center">
                    {renderMember('me', 'family-tree-me')}
                </div>

                {/* Siblings */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {renderMember('brother1')}
                    {renderMember('brother2')}
                    {renderMember('sister')}
                    {renderMember('sister2')}
                    {renderMember('sister3')}
                </div>

            </div>
        </div>
    );
};

const AboutContent: React.FC = () => {
    const [aboutImage, setAboutImage] = useLocalStorageState('aboutImage', 'https://picsum.photos/600/800');
    const [bio, setBio] = useLocalStorageState('bio', "I thrive at the intersection of technology and art. My goal is to build meaningful digital experiences that are not only functional but also beautiful and intuitive. I'm driven by curiosity and a desire to constantly learn and grow.");
    const [funFacts, setFunFacts] = useLocalStorageState('funFacts', [
        "I can solve a Rubik's cube in under a minute.",
        "My dream project is to create an interactive educational game for kids.",
        "I'm an avid stargazer and love astrophotography.",
        "My personality type is INFJ - The Advocate.",
    ]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAboutImage(await fileToBase64(e.target.files[0]));
        }
    };

    const updateFact = (index: number, text: string) => {
        setFunFacts(facts => facts.map((fact, i) => i === index ? text : fact));
    };

    const addFact = () => setFunFacts(facts => [...facts, 'New fun fact!']);
    const removeFact = (index: number) => setFunFacts(facts => facts.filter((_, i) => i !== index));

    return (
        <>
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/3 w-full flex-shrink-0 relative group">
                     <img src={aboutImage} alt="About Fiona" className="rounded-lg shadow-2xl shadow-cyan-500/20 w-full" />
                     <label htmlFor="about-image-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <span className="text-white font-bold">Change Image</span>
                     </label>
                     <input id="about-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                <div className="md:w-2/3 w-full space-y-6 text-lg">
                    <p contentEditable suppressContentEditableWarning onBlur={e => setBio(e.currentTarget.textContent || '')} className="p-2 rounded-md">
                        {bio}
                    </p>
                    <div className="bg-white/5 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-purple-300 mb-2">Fun Facts About Me ✨</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {funFacts.map((fact, index) => (
                                <li key={index} className="flex items-center group">
                                    <span 
                                        contentEditable 
                                        suppressContentEditableWarning 
                                        onBlur={e => updateFact(index, e.currentTarget.textContent || '')}
                                        className="flex-grow p-1 rounded-md"
                                    >
                                        {fact}
                                    </span>
                                    <button onClick={() => removeFact(index)} className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={addFact} className="flex items-center holographic-btn px-3 py-1 rounded-md text-sm font-semibold mt-4">
                            <PlusIcon/> Add Fact
                        </button>
                    </div>
                </div>
            </div>
            <FamilyTree />
        </>
    );
};

const AchievementsContent: React.FC<{ achievements: Achievement[]; setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>; openLightbox: (src: string) => void }> = ({ achievements, setAchievements, openLightbox }) => {
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
            setAchievements(prev => prev.filter(a => a.id !== id));
        }
    };
    
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {achievements.map(ach => (
            <div key={ach.id} className="group relative overflow-hidden rounded-lg shadow-lg bg-black/30">
                <img src={ach.image} alt={ach.caption} className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={() => openLightbox(ach.image)}>
                    <p className="text-white text-lg text-center p-4">{ach.caption}</p>
                </div>
                 <button onClick={() => handleDelete(ach.id)} className="absolute top-2 right-2 z-10 p-2 bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon />
                </button>
            </div>
        ))}
        {achievements.length === 0 && <p className="text-center text-gray-400 col-span-full">No achievements yet. Add one!</p>}
    </div>
)};


const ProjectsContent: React.FC<{ projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ projects, setProjects }) => {
     const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(proj => (
            <div key={proj.id} className="bg-white/5 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-2 group relative">
                 <button onClick={() => handleDelete(proj.id)} className="absolute top-2 right-2 z-10 p-2 bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon />
                </button>
                <img src={proj.image} alt={proj.title} className="w-full h-56 object-cover"/>
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{proj.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {proj.tags.map(tag => <span key={tag} className="bg-cyan-400/20 text-cyan-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                    <p className="text-gray-400 mb-4 h-24 overflow-y-auto">{proj.description}</p>
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="holographic-btn inline-block w-full text-center py-2 rounded-md font-semibold">
                        View Project
                    </a>
                </div>
            </div>
        ))}
         {projects.length === 0 && <p className="text-center text-gray-400 col-span-full">No projects yet. Add one!</p>}
    </div>
)};


const GalleryContent: React.FC<{ items: GalleryItem[]; setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>; openLightbox: (src: string) => void }> = ({ items, setItems, openLightbox }) => {
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent lightbox from opening
        if (window.confirm('Are you sure you want to delete this memory?')) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const getFrameClass = (frame: GalleryItem['frame']) => {
        switch(frame) {
            case 'circle': return 'rounded-full w-full h-full object-cover';
            case 'polaroid': return 'bg-white p-2 pb-16 shadow-lg rotate-3';
            default: return 'rounded-lg';
        }
    };
    
    return (
        <div>
             {items.length === 0 && <p className="text-center text-gray-400">Your gallery is empty. Add a memory!</p>}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {items.map(item => (
                    <div key={item.id} className={`relative break-inside-avoid group cursor-pointer ${item.frame === 'polaroid' ? 'p-4' : ''}`} onClick={() => openLightbox(item.image)}>
                         <img src={item.image} alt={item.caption} className={getFrameClass(item.frame)} />
                         {item.caption && item.frame !== 'polaroid' && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                                <p className="text-white text-center">{item.caption}</p>
                             </div>
                         )}
                         {item.frame === 'polaroid' && <p className="absolute bottom-4 left-4 right-4 text-center font-display text-gray-800">{item.caption}</p>}
                         <button onClick={(e) => handleDelete(e, item.id)} className="absolute top-2 right-2 z-10 p-2 bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BlogContent: React.FC = () => {
    const [posts, setPosts] = useLocalStorageState<BlogPost[]>('blogPosts', []);
    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return;
        
        const post: BlogPost = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            title: newPost.title,
            content: newPost.content,
            imageUrl: newPost.imageUrl || undefined
        };
        setPosts(prev => [post, ...prev]);
        setNewPost({ title: '', content: '', imageUrl: '' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleAddPost} className="bg-white/5 p-6 rounded-lg mb-12 space-y-4">
                <h3 className="text-2xl font-bold text-purple-300">Create a New Post</h3>
                <input type="text" placeholder="Post Title" value={newPost.title} onChange={e => setNewPost(p => ({...p, title: e.target.value}))} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" required/>
                <textarea placeholder="What's on your mind?" value={newPost.content} onChange={e => setNewPost(p => ({...p, content: e.target.value}))} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-400 h-28 focus:outline-none focus:ring-2 focus:ring-purple-500" required></textarea>
                <input type="text" placeholder="Image URL (optional)" value={newPost.imageUrl} onChange={e => setNewPost(p => ({...p, imageUrl: e.target.value}))} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                <button type="submit" className="holographic-btn w-full py-2 rounded-md font-semibold">Post</button>
            </form>
            <div className="space-y-8">
                {posts.map(post => (
                    <div key={post.id} className="bg-white/5 rounded-lg overflow-hidden shadow-lg">
                        {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover" />}
                        <div className="p-6">
                            <h4 className="text-3xl font-bold text-white mb-2 font-display">{post.title}</h4>
                            <p className="text-sm text-gray-400 mb-4">{new Date(post.timestamp).toLocaleString()}</p>
                            <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>
                ))}
                 {posts.length === 0 && <p className="text-center text-gray-400 text-lg">No blog posts yet. Create one above!</p>}
            </div>
        </div>
    );
};


// --- UI COMPONENTS ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close-btn">&times;</button>
                {children}
            </div>
        </div>
    );
};

const Lightbox: React.FC<{ src: string | null; onClose: () => void; }> = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <img src={src} alt="Enlarged view" />
        </div>
    );
};

// --- FOOTER ---
const Footer = () => (
    <footer className="py-8 bg-black/30 mt-12 text-center">
        <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"><SocialIcons.instagram /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"><SocialIcons.linkedin /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"><SocialIcons.github /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"><SocialIcons.youtube /></a>
        </div>
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Fionaverse. All rights reserved.</p>
    </footer>
);


// --- MAIN APP ---
export default function App() {
    useStarTrail();
    const [theme, setTheme] = useLocalStorageState<'dark' | 'aurora'>('theme', 'dark');
    const [view, setView] = useState<'hero' | 'main'>('hero');
    const [activeTab, setActiveTab] = useLocalStorageState<Tab>('activeTab', 'home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const [achievements, setAchievements] = useLocalStorageState<Achievement[]>('achievements', []);
    const [projects, setProjects] = useLocalStorageState<Project[]>('projects', []);
    const [galleryItems, setGalleryItems] = useLocalStorageState<GalleryItem[]>('galleryItems', []);
    
    const toggleTheme = () => setTheme(current => (current === 'dark' ? 'aurora' : 'dark'));
    const onEnter = () => {
        setActiveTab('about');
        setView('main');
    };

    const handleOpenModal = (content: React.ReactNode) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleAddAchievement = () => handleOpenModal(<AchievementForm onAdd={ach => { setAchievements(prev => [ach, ...prev]); setIsModalOpen(false); }} />);
    const handleAddProject = () => handleOpenModal(<ProjectForm onAdd={proj => { setProjects(prev => [proj, ...prev]); setIsModalOpen(false); }} />);
    const handleAddGalleryItem = () => handleOpenModal(<GalleryForm onAdd={item => { setGalleryItems(prev => [item, ...prev]); setIsModalOpen(false); }} />);

    const renderContent = () => {
        switch(activeTab) {
            case 'home': return <SectionWrapper title="🏠 Home"><HomeContent /></SectionWrapper>;
            case 'about': return <SectionWrapper title="💜 About Me"><AboutContent /></SectionWrapper>;
            case 'achievements': return <SectionWrapper title="🏆 Achievements" onAdd={handleAddAchievement} addLabel="Add Achievement"><AchievementsContent achievements={achievements} setAchievements={setAchievements} openLightbox={setLightboxImage} /></SectionWrapper>;
            case 'projects': return <SectionWrapper title="💻 Projects" onAdd={handleAddProject} addLabel="Add Project"><ProjectsContent projects={projects} setProjects={setProjects}/></SectionWrapper>;
            case 'gallery': return <SectionWrapper title="🎨 Gallery / Memories" onAdd={handleAddGalleryItem} addLabel="Add Image"><GalleryContent items={galleryItems} setItems={setGalleryItems} openLightbox={setLightboxImage} /></SectionWrapper>;
            case 'blog': return <SectionWrapper title="📝 My Blog"><BlogContent /></SectionWrapper>;
            default: return <SectionWrapper title="🏠 Home"><HomeContent /></SectionWrapper>;
        }
    };

    return (
        <div className={`transition-colors duration-500 ${theme === 'aurora' ? 'aurora' : ''}`}>
            <ParticleBackground />
            <FloatingShapes />
            <FloatingDecorations />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>{modalContent}</Modal>
            <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
            
            {view === 'hero' ? (
                <Hero onEnter={onEnter}/>
            ) : (
                <>
                    <Header activeTab={activeTab} setActiveTab={setActiveTab} toggleTheme={toggleTheme} theme={theme}/>
                    <main>{renderContent()}</main>
                    <Footer />
                </>
            )}
        </div>
    );
}

// --- FORM COMPONENTS for MODALS ---

const AchievementForm: React.FC<{ onAdd: (ach: Achievement) => void }> = ({ onAdd }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caption || !image) return alert('Please provide a caption and an image.');
        onAdd({ id: crypto.randomUUID(), caption, image });
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImage(await fileToBase64(e.target.files[0]));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">New Achievement</h3>
            <input type="text" placeholder="Caption" value={caption} onChange={e => setCaption(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white" required />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" required />
            {image && <img src={image} alt="Preview" className="max-h-40 rounded-md mx-auto" />}
            <button type="submit" className="holographic-btn w-full py-2 rounded-md font-semibold">Add</button>
        </form>
    );
};

const ProjectForm: React.FC<{ onAdd: (proj: Project) => void }> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState<string | null>(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !image) return alert('Please fill all required fields.');
        onAdd({ id: crypto.randomUUID(), title, description, link, tags: tags.split(',').map(t => t.trim()), image });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImage(await fileToBase64(e.target.files[0]));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">New Project</h3>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white" required />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white h-24" required></textarea>
            <input type="text" placeholder="Project Link" value={link} onChange={e => setLink(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white" />
            <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" required />
            {image && <img src={image} alt="Preview" className="max-h-40 rounded-md mx-auto" />}
            <button type="submit" className="holographic-btn w-full py-2 rounded-md font-semibold">Add</button>
        </form>
    );
};

const GalleryForm: React.FC<{ onAdd: (item: GalleryItem) => void }> = ({ onAdd }) => {
    const [caption, setCaption] = useState('');
    const [frame, setFrame] = useState<GalleryItem['frame']>('square');
    const [image, setImage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return alert('Please upload an image.');
        onAdd({ id: crypto.randomUUID(), caption, image, frame });
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImage(await fileToBase64(e.target.files[0]));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-300">New Gallery Item</h3>
            <input type="text" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white" />
            <select value={frame} onChange={e => setFrame(e.target.value as GalleryItem['frame'])} className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white">
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="polaroid">Polaroid</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" required />
            {image && <img src={image} alt="Preview" className="max-h-40 rounded-md mx-auto" />}
            <button type="submit" className="holographic-btn w-full py-2 rounded-md font-semibold">Add</button>
        </form>
    );
};