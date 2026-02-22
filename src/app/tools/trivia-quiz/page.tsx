"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Play, RefreshCw, CheckCircle2, XCircle, Trophy, Loader2, RotateCcw } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface Question {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

const DIFFICULTIES = ["easy", "medium", "hard"];

const decodeHTML = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

export default function TriviaQuiz() {
    const [difficulty, setDifficulty] = useState("medium");
    const [amount, setAmount] = useState(5);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<string[][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showResults, setShowResults] = useState(false);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError("");
        setQuestions([]);
        setCurrent(0);
        setAnswers([]);
        setShowResults(false);
        try {
            const res = await fetch(
                `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`
            );
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            if (data.response_code !== 0 || !data.results?.length) {
                throw new Error("No questions available. Try different settings.");
            }
            setQuestions(data.results);
            setAnswers(new Array(data.results.length).fill(null));
            // Shuffle options for each question
            const shuffled = data.results.map((q: Question) => {
                const opts = [...q.incorrect_answers, q.correct_answer];
                for (let i = opts.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [opts[i], opts[j]] = [opts[j], opts[i]];
                }
                return opts;
            });
            setShuffledOptions(shuffled);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch questions.");
        } finally {
            setLoading(false);
        }
    }, [amount, difficulty]);

    const selectAnswer = (answer: string) => {
        if (answers[current] !== null) return; // already answered
        const newAnswers = [...answers];
        newAnswers[current] = answer;
        setAnswers(newAnswers);
    };

    const next = () => {
        if (current < questions.length - 1) setCurrent(current + 1);
        else setShowResults(true);
    };

    const score = answers.filter((a, i) => a === questions[i]?.correct_answer).length;

    const q = questions[current];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Trivia Quiz</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Test your knowledge with random trivia questions. Powered by Open Trivia DB.
                </p>
            </div>

            {/* Setup or no quiz started */}
            {questions.length === 0 && !loading && (
                <MacWindow title="Setup">
                    <div className="space-y-5">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Difficulty</label>
                            <div className="flex gap-2">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all capitalize ${difficulty === d
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-border hover:border-border/80 text-muted-foreground"
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Questions</label>
                                <span className="font-mono text-xs font-bold">{amount}</span>
                            </div>
                            <input type="range" min="5" max="20" step="5" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        </div>

                        <button onClick={fetchQuestions} className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2">
                            <Play size={16} /> Start Quiz
                        </button>
                    </div>
                </MacWindow>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <span className="font-mono text-sm text-muted-foreground">Loading questions...</span>
                </div>
            )}

            {error && (
                <div className="border border-red-500/30 p-4 text-center">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                    <button onClick={fetchQuestions} className="mt-3 btn-brutal text-[10px] inline-flex items-center gap-1.5">
                        <RefreshCw size={11} /> Retry
                    </button>
                </div>
            )}

            {/* Quiz in progress */}
            {q && !showResults && !loading && (
                <div className="space-y-5">
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Question {current + 1}/{questions.length}
                        </span>
                        <div className="flex-1 h-1 bg-border">
                            <div className="h-1 bg-accent transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-border text-muted-foreground capitalize">
                            {q.difficulty}
                        </span>
                    </div>

                    <MacWindow title={decodeHTML(q.category)}>
                        <div className="py-2">
                            <p className="text-lg font-bold mb-6 leading-relaxed">{decodeHTML(q.question)}</p>

                            <div className="space-y-3">
                                {shuffledOptions[current]?.map((opt) => {
                                    const answered = answers[current] !== null;
                                    const isSelected = answers[current] === opt;
                                    const isCorrect = opt === q.correct_answer;
                                    let cls = "border-border hover:border-accent/30 text-foreground";
                                    if (answered) {
                                        if (isCorrect) cls = "border-green-500/60 bg-green-500/10 text-green-400";
                                        else if (isSelected) cls = "border-red-500/60 bg-red-500/10 text-red-400";
                                        else cls = "border-border/40 text-muted-foreground/50";
                                    }
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => selectAnswer(opt)}
                                            disabled={answered}
                                            className={`w-full text-left p-4 border transition-all font-mono text-sm flex items-center gap-3 ${cls}`}
                                        >
                                            {answered && isCorrect && <CheckCircle2 size={16} className="text-green-400 shrink-0" />}
                                            {answered && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0" />}
                                            {decodeHTML(opt)}
                                        </button>
                                    );
                                })}
                            </div>

                            {answers[current] !== null && (
                                <button onClick={next} className="mt-5 btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2">
                                    {current < questions.length - 1 ? "Next Question" : "See Results"}
                                </button>
                            )}
                        </div>
                    </MacWindow>
                </div>
            )}

            {/* Results */}
            {showResults && (
                <div className="space-y-5">
                    <MacWindow title="Results">
                        <div className="text-center py-6">
                            <Trophy size={40} className="text-accent mx-auto mb-4" />
                            <div className="text-4xl font-black text-accent">{score}/{questions.length}</div>
                            <p className="font-mono text-sm text-muted-foreground mt-2">
                                {score === questions.length ? "Perfect score! 🎉" : score >= questions.length / 2 ? "Good job! 👏" : "Better luck next time! 💪"}
                            </p>
                        </div>
                    </MacWindow>

                    {/* Review */}
                    <MacWindow title="Review">
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {questions.map((qq, i) => (
                                <div key={i} className="p-3 border border-border">
                                    <p className="text-sm font-bold mb-2">{i + 1}. {decodeHTML(qq.question)}</p>
                                    <p className="font-mono text-xs">
                                        <span className="text-muted-foreground">Your answer: </span>
                                        <span className={answers[i] === qq.correct_answer ? "text-green-400" : "text-red-400"}>
                                            {answers[i] ? decodeHTML(answers[i]!) : "—"}
                                        </span>
                                    </p>
                                    {answers[i] !== qq.correct_answer && (
                                        <p className="font-mono text-xs">
                                            <span className="text-muted-foreground">Correct: </span>
                                            <span className="text-green-400">{decodeHTML(qq.correct_answer)}</span>
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </MacWindow>

                    <button onClick={() => { setQuestions([]); setShowResults(false); }} className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2">
                        <RotateCcw size={16} /> Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
