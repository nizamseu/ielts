"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    X,
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Layers,
    CheckSquare,
    AlignLeft,
    List,
    ToggleRight,
    ToggleLeft,
    Edit3,
    Save,
    CheckCircle,
} from "lucide-react";

interface ExamDetailModalProps {
    exam: any;
    onClose: () => void;
}

const QUESTION_TYPES = [
    {
        value: "multiple_choice_single",
        label: "Multiple Choice",
        icon: CheckSquare,
    },
    { value: "short_answer", label: "Short Answer / Fill in", icon: AlignLeft },
    { value: "true_false_not_given", label: "True/False/NG", icon: List },
    { value: "matching", label: "Matching", icon: Layers },
    { value: "essay", label: "Essay / Writing Task", icon: AlignLeft },
];

function QuestionForm({
    sectionId,
    sectionModule,
    onAdded,
}: {
    sectionId: string;
    sectionModule: string;
    onAdded: (question: any) => void;
}) {
    const [questionType, setQuestionType] = useState("multiple_choice_single");
    const [promptText, setPromptText] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState<string>("");

    const { data: banks } = useQuery({
        queryKey: ["questionBanks"],
        queryFn: async () => {
            const res = await api.get("/api/question-banks");
            return res.data;
        },
        enabled: isOpen,
    });

    // Automatically select first bank or create one if none exist
    useEffect(() => {
        if (banks?.length > 0 && !selectedBankId) {
            setSelectedBankId(banks[0]._id);
        }
    }, [banks]);

    const createBankMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/api/question-banks", {
                name: "Default Bank",
                description: "Automatically created for exam content",
            });
            return res.data;
        },
        onSuccess: (data) => {
            setSelectedBankId(data._id);
        },
    });

    const createQuestionMutation = useMutation({
        mutationFn: async () => {
            let bankId = selectedBankId;

            if (!bankId && (!banks || banks.length === 0)) {
                const newBank = await createBankMutation.mutateAsync();
                bankId = newBank._id;
            }

            // Backend evaluator expects objects with questionNo and value
            // For now, we assume this is question 1 in its set
            const correctAnswers = correctAnswer
                ? [{ questionNo: 1, value: correctAnswer }]
                : [];

            const questionData: any = {
                questionBankId: bankId,
                module: sectionModule,
                questionType,
                prompt: { text: promptText },
                correctAnswers,
            };

            if (questionType === "multiple_choice_single") {
                questionData.questionTypeData = {
                    options: options.filter((o) => o.trim()),
                };
            }

            const qRes = await api.post("/api/questions", questionData);
            await api.post(`/api/exam-sections/${sectionId}/add-question`, {
                questionId: qRes.data._id,
            });

            return qRes.data;
        },
        onSuccess: (q) => {
            onAdded(q);
            setPromptText("");
            setOptions(["", "", "", ""]);
            setCorrectAnswer("");
            setIsOpen(false);
        },
    });

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition-all group"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                    <Plus className="h-4 w-4" />
                </div>
                Add New Question
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 shadow-lg shadow-blue-500/5 p-5 space-y-5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Plus className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Create Question
                    </h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question Type */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {QUESTION_TYPES.slice(0, 4).map((qt) => (
                            <button
                                key={qt.value}
                                type="button"
                                onClick={() => setQuestionType(qt.value)}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                                    questionType === qt.value
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                }`}
                            >
                                <qt.icon className="h-3.5 w-3.5" />
                                {qt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bank Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Question Bank
                    </label>
                    <div className="relative">
                        <select
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            {banks?.length > 0 ? (
                                banks.map((b: any) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">
                                    No banks found (will create default)
                                </option>
                            )}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Prompt Content
                </label>
                <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Enter the IELTS question prompt here..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed transition-all"
                />
            </div>

            {/* Options for MCQ */}
            {questionType === "multiple_choice" && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Multiple Choice Options
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt, i) => (
                            <div key={i} className="group relative">
                                <div
                                    className={`absolute left-0 inset-y-0 w-10 flex items-center justify-center font-bold text-xs rounded-l-xl ${
                                        correctAnswer === opt && opt
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                    }`}
                                >
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                        const updated = [...options];
                                        updated[i] = e.target.value;
                                        setOptions(updated);
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                    className="w-full pl-12 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <button
                                    onClick={() => setCorrectAnswer(opt)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${
                                        correctAnswer === opt && opt
                                            ? "text-emerald-500"
                                            : "text-slate-300 hover:text-slate-500"
                                    }`}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correct Answer for non-essay */}
            {questionType !== "essay" && questionType !== "multiple_choice" && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Correct Answer
                    </label>
                    <input
                        type="text"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Type the exact expected answer..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            )}

            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:flex-none flex-1 rounded-xl px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => createQuestionMutation.mutate()}
                    disabled={
                        !promptText.trim() || createQuestionMutation.isPending
                    }
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {createQuestionMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Create & Attach Question
                        </>
                    )}
                </button>
            </div>

            {createQuestionMutation.isError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                    Error:{" "}
                    {(createQuestionMutation.error as any)?.response?.data
                        ?.message || "Failed to save question."}
                </p>
            )}
        </div>
    );
}

function SectionAccordion({
    section,
    examId,
}: {
    section: any;
    examId: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const queryClient = useQueryClient();
    const [localQuestions, setLocalQuestions] = useState<any[]>([]);

    const { data: sectionData, isLoading } = useQuery({
        queryKey: ["section", section._id],
        queryFn: async () => {
            const res = await api.get(`/api/exam-sections/${section._id}`);
            return res.data;
        },
        enabled: expanded,
    });

    const removeQuestionMutation = useMutation({
        mutationFn: async (questionId: string) => {
            await api.delete(
                `/api/exam-sections/${section._id}/remove-question/${questionId}`,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["section", section._id],
            });
        },
    });

    const questions = sectionData?.questionIds || [];

    const moduleColors: Record<string, string> = {
        listening: "blue",
        reading: "violet",
        writing: "amber",
        speaking: "emerald",
    };
    const color = moduleColors[section.module] || "slate";

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-500/20 text-${color}-700 dark:text-${color}-400 text-xs font-bold uppercase`}
                >
                    {section.module?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {section.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {section.module} · {section.durationMinutes} min ·{" "}
                        {section.questionIds?.length || 0} questions
                    </p>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                </div>
                            ) : questions.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-3">
                                    No questions yet. Add some below.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {questions.map((q: any, i: number) => (
                                        <div
                                            key={q._id}
                                            className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 group"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-900 dark:text-white line-clamp-2">
                                                    {q.prompt?.text}
                                                </p>
                                                <span className="text-xs text-slate-400 capitalize">
                                                    {q.questionType?.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeQuestionMutation.mutate(
                                                        q._id,
                                                    )
                                                }
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <QuestionForm
                                sectionId={section._id}
                                sectionModule={section.module}
                                onAdded={() => {
                                    queryClient.invalidateQueries({
                                        queryKey: ["section", section._id],
                                    });
                                    queryClient.invalidateQueries({
                                        queryKey: ["adminExams"],
                                    });
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ExamDetailModal({ exam, onClose }: ExamDetailModalProps) {
    const queryClient = useQueryClient();

    const { data: fullExam, isLoading } = useQuery({
        queryKey: ["examFull", exam._id],
        queryFn: async () => {
            const res = await api.get(`/api/exam-templates/${exam._id}`);
            return res.data;
        },
    });

    const publishMutation = useMutation({
        mutationFn: async (published: boolean) => {
            const res = await api.patch(
                `/api/exam-templates/${exam._id}/publish`,
                { published },
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminExams"] });
            queryClient.invalidateQueries({ queryKey: ["examFull", exam._id] });
        },
    });

    const currentExam = fullExam || exam;
    const sections = currentExam?.sectionIds || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                            {currentExam.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 capitalize">
                                {currentExam.examType?.replace("_", " ")}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">
                                ·
                            </span>
                            <span className="text-xs text-slate-500">
                                {currentExam.durationMinutes} min total
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                            onClick={() =>
                                publishMutation.mutate(!currentExam.published)
                            }
                            disabled={publishMutation.isPending}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                currentExam.published
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                        >
                            {currentExam.published ? (
                                <ToggleRight className="h-3.5 w-3.5" />
                            ) : (
                                <ToggleLeft className="h-3.5 w-3.5" />
                            )}
                            {currentExam.published ? "Published" : "Draft"}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Sections List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : sections.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Layers className="mx-auto h-10 w-10 mb-3 opacity-50" />
                            <p className="text-sm">
                                No sections configured for this exam.
                            </p>
                        </div>
                    ) : (
                        sections.map((section: any) => (
                            <SectionAccordion
                                key={section._id}
                                section={section}
                                examId={exam._id}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sections.length} section
                        {sections.length !== 1 ? "s" : ""} configured ·{" "}
                        {sections.reduce(
                            (acc: number, s: any) =>
                                acc + (s.questionIds?.length || 0),
                            0,
                        )}{" "}
                        questions total
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
