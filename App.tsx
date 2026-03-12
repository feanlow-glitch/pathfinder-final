
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { QUESTIONS, CATEGORY_DESCRIPTIONS, CAREER_DATABASE, PATHWAYS_BY_CATEGORY } from './constants';
import { CategoryKey, QuizResults } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [occupationSearch, setOccupationSearch] = useState('');
  const [studentName, setStudentName] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAnswer = (val: boolean) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQuestionIndex].id]: val }));
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    } else {
      setStep('results');
    }
  };

  const results = useMemo((): QuizResults => {
    const scores: Record<CategoryKey, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    QUESTIONS.forEach(q => {
      if (answers[q.id]) {
        scores[q.category]++;
      }
    });

    const topThree = (Object.keys(scores) as CategoryKey[])
      .sort((a, b) => {
        if (scores[b] !== scores[a]) return scores[b] - scores[a];
        // Standard tie-breaker order: R, I, A, S, E, C
        const order: CategoryKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];
        return order.indexOf(a) - order.indexOf(b);
      })
      .slice(0, 3);

    return {
      scores,
      topThree,
      code: topThree.join('')
    };
  }, [answers]);

  const filteredOccupations = useMemo(() => {
    const allMatching = results.topThree.flatMap(key => CAREER_DATABASE[key]);
    const unique = Array.from(new Set(allMatching)) as string[];
    if (!occupationSearch) return unique.sort();
    return unique
      .filter((occ: string) => occ.toLowerCase().includes(occupationSearch.toLowerCase()))
      .sort();
  }, [results, occupationSearch]);

  const fetchRealTimeInsights = async () => {
    setIsSearching(true);
    setAiInsights(null);
    setGroundingLinks([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the Holland RIASEC career code "${results.code}" (Primary Interest: ${CATEGORY_DESCRIPTIONS[results.topThree[0]].title}), identify 5 high-demand career paths for 2025-2030 and 3 trending college majors that align with this profile. Use Google Search to provide up-to-date labor market information and educational trends. Provide a professional summary suitable for a high school student.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      setAiInsights(text || "We couldn't retrieve specific insights right now. Please try again.");
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web?.title || "Educational Resource",
            uri: chunk.web?.uri || ""
          }))
          .filter(link => link.uri);
        setGroundingLinks(links);
      }
    } catch (error) {
      console.error("AI Insight error:", error);
      setAiInsights("There was an error connecting to the career database. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const submitToGoogleSheets = async () => {
    if (!studentName) return;
    setSubmissionStatus('submitting');
    
    try {
      const payload = {
        name: studentName,
        R: results.scores.R,
        I: results.scores.I,
        A: results.scores.A,
        S: results.scores.S,
        E: results.scores.E,
        C: results.scores.C,
        interestCode: results.code
      };

      // Using text/plain to avoid CORS preflight (OPTIONS) which Google Apps Script doesn't support.
      // mode: 'no-cors' ensures the request is sent even if we can't read the response.
      await fetch('https://script.google.com/macros/s/AKfycbxX-2PpJKqlEg5xkpuds1ZdUFiCoNCkCPmOC1JfhyhBY-S1Mt_DiiNY3zxhZ2Tt24FN/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      });

      console.log("Data sent to Google Sheets:", payload);
      setSubmissionStatus('success');
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionStatus('error');
    }
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-16 text-center border border-blue-100">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">Pathfinder</h1>
          <p className="text-slate-600 text-xl mb-12 leading-relaxed max-w-lg mx-auto font-medium">
            Discover your interests and find the right educational pathway for your future.
          </p>
          
          <div className="max-w-sm mx-auto mb-10 text-left">
            <label className="block text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-3 ml-1">Student Name</label>
            <input 
              type="text" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl text-lg font-bold outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('quiz')}
              disabled={!studentName.trim()}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-xl active:scale-95 text-xl flex items-center justify-center gap-3"
            >
              Begin Assessment
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">42 Statements • RIASEC Framework</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center">
        <div className="max-w-xl w-full">
          <header className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-blue-700 font-bold text-sm uppercase tracking-widest block mb-1">Career Quiz</span>
                <h2 className="text-3xl font-black text-blue-900">{currentQuestionIndex + 1} <span className="text-slate-300 font-bold">/ 42</span></h2>
              </div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
              <div className="bg-blue-600 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </header>

          <main className="bg-white rounded-3xl shadow-xl p-12 md:p-20 mb-8 min-h-[340px] flex flex-col justify-center text-center border border-slate-100 relative group">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-100 rounded-full"></div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              "{q.text}"
            </h3>
          </main>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleAnswer(true)}
              className="py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-2xl flex items-center justify-center gap-3 border-b-4 border-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="py-6 bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-900 border-2 border-slate-200 font-black rounded-2xl shadow-md transition-all active:scale-95 text-2xl flex items-center justify-center gap-3 border-b-4 border-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No
            </button>
          </div>
          
          <footer className="mt-12 flex justify-center">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              className={`text-slate-400 hover:text-blue-700 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${currentQuestionIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
              disabled={currentQuestionIndex === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Dynamic Results Header */}
      <div className="bg-blue-900 text-white pt-24 pb-40 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-5 py-2 bg-blue-800 text-blue-300 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-700 shadow-lg">Assessment Profile</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">Your Interest Code: <span className="text-blue-400">{results.code}</span></h1>
          <p className="text-blue-100 text-xl md:text-2xl font-medium opacity-90 max-w-3xl mx-auto leading-relaxed">
            Your results show a strong affinity for <span className="text-white font-bold underline decoration-blue-400 decoration-4 underline-offset-8">{CATEGORY_DESCRIPTIONS[results.topThree[0]].title}</span> roles.
          </p>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -ml-20 -mb-20"></div>
      </div>

      <div className="max-w-7xl mx-auto -mt-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Insights Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Real-time Insights Card */}
            <section className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                  <div className="max-w-md">
                    <h2 className="text-3xl font-black text-blue-900 mb-2">Future Career Outlook</h2>
                    <p className="text-slate-500 font-medium">Using Google Search to identify high-demand trends for the {results.code} profile in 2025.</p>
                  </div>
                  <button 
                    onClick={fetchRealTimeInsights}
                    disabled={isSearching}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1"
                  >
                    {isSearching ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Trends...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Get Market Data
                      </>
                    )}
                  </button>
                </div>

                {aiInsights ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 mb-8">
                      <div className="prose prose-blue max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {aiInsights}
                      </div>
                    </div>
                    
                    {groundingLinks.length > 0 && (
                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recommended Sources</h4>
                        <div className="flex flex-wrap gap-3">
                          {groundingLinks.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isSearching && (
                  <div className="py-20 text-center border-4 border-dashed border-blue-50 rounded-[2rem] flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5z"></path></svg>
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Discover real-world careers matching your code</p>
                  </div>
                )}
              </div>
            </section>

            {/* Top Categories Breakdowns */}
            <div className="space-y-8">
              <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em] px-4">Primary Interest Breakdown</h2>
              {results.topThree.map((key) => {
                const desc = CATEGORY_DESCRIPTIONS[key];
                return (
                  <div key={key} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden hover:border-blue-200 transition-all duration-300">
                    <div className="p-10 md:p-14">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg" style={{ backgroundColor: desc.color }}>
                          {key}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-blue-900 tracking-tight">{desc.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-500 font-bold text-lg">{results.scores[key]}</span>
                            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Points Collected</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium italic">
                        "{desc.description}"
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
                        <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                            <div className="w-6 h-0.5 bg-blue-100"></div> Educational Majors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {desc.majors.map(m => (
                              <span key={m} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 shadow-sm">{m}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                            <div className="w-6 h-0.5 bg-slate-100"></div> Career Pathways
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {PATHWAYS_BY_CATEGORY[key].map(p => (
                              <span key={p} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 shadow-sm">{p}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Submission Card */}
            <div className="bg-blue-50 rounded-[2.5rem] border-2 border-blue-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-blue-900 mb-2">Submit to Teacher</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Send your RIASEC profile directly to your teacher's records.</p>
              
              {submissionStatus === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in zoom-in duration-300">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-800 font-bold text-sm">Data saved successfully!</p>
                  <p className="text-emerald-600 text-xs mt-1">Your teacher has received your results.</p>
                </div>
              ) : (
                <button 
                  onClick={submitToGoogleSheets}
                  disabled={submissionStatus === 'submitting'}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-300"
                >
                  {submissionStatus === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Results
                    </>
                  )}
                </button>
              )}
              {submissionStatus === 'error' && (
                <p className="text-red-500 text-xs font-bold mt-4 text-center">Failed to submit. Please try again.</p>
              )}
            </div>

            {/* Career Database Sidebar */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 sticky top-10">
              <div className="mb-8">
                <h3 className="text-xl font-black text-blue-900 mb-2">Occupation Search</h3>
                <p className="text-slate-500 text-sm font-medium">Browse careers from the DOL database matching your profile.</p>
              </div>

              <div className="mb-8 relative">
                <input 
                  type="text" 
                  placeholder="Find a career..." 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                  value={occupationSearch}
                  onChange={(e) => setOccupationSearch(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                {filteredOccupations.length > 0 ? (
                  filteredOccupations.map(occ => (
                    <div key={occ} className="p-4 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-slate-100 hover:border-blue-600 transition-all cursor-default shadow-sm group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-tight leading-tight">{occ}</span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No matches found</p>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Retake Assessment
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section, .space-y-8 > div {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
