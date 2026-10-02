import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Moon,
  Utensils,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Crown,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendCoachMessage, getDailySummary } from "../services/aiCoachService";
import type { Meal, SleepData, AICoachMessage, AICoachResponse } from "../types";

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  sleepData: SleepData | null;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  meals,
  sleepData,
}) => {
  const { subscriptionTier, openPricingModal } = useAuth();
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<AICoachResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hoursSlept = sleepData?.hours_slept ?? 7.0;
  const isSleepDeprived = hoursSlept < 6.0;

  // Auto-generate initial greeting/prescriptions on open
  useEffect(() => {
    if (!isOpen) return;

    if (subscriptionTier === 1 && !dailySummary) {
      setIsSummaryLoading(true);
      getDailySummary(meals, sleepData, subscriptionTier)
        .then((res) => setDailySummary(res))
        .finally(() => setIsSummaryLoading(false));
    } else if (subscriptionTier >= 2 && messages.length === 0) {
      setIsLoading(true);
      sendCoachMessage(
        "Diagnose my metabolic status today and advise on my next meal.",
        meals,
        sleepData,
        subscriptionTier,
        []
      )
        .then((res) => {
          const initialMessage: AICoachMessage = {
            id: `msg_init_${Date.now()}`,
            sender: "coach",
            text: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggested_meal: res.suggested_meal,
            metabolic_focus: res.metabolic_focus,
          };
          setMessages([initialMessage]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, subscriptionTier, dailySummary, messages.length, meals, sleepData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: AICoachMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendCoachMessage(
        text,
        meals,
        sleepData,
        subscriptionTier,
        [...messages, userMsg]
      );

      const coachMsg: AICoachMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "coach",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggested_meal: response.suggested_meal,
        metabolic_focus: response.metabolic_focus,
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error("AI Coach error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSummary = () => {
    setIsSummaryLoading(true);
    getDailySummary(meals, sleepData, subscriptionTier)
      .then((res) => setDailySummary(res))
      .finally(() => setIsSummaryLoading(false));
  };

  const quickPrompts = [
    "What should my next meal be based on my sleep & today's food?",
    isSleepDeprived
      ? "How do I counteract insulin resistance and cravings from < 6h sleep?"
      : "How can I maximize autophagy before my next meal?",
    "Suggest an authentic high-protein, low-GI dinner.",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Slide-out Drawer Container */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg bg-[#141414] border-l border-[#2A2A2A] shadow-2xl flex flex-col h-full z-10 overflow-hidden"
        >
          {/* Subtle gold gradient accent on top */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C5A059] via-[#DFBE7A] to-[#78866B]" />

          {/* Drawer Header */}
          <div className="p-5 border-b border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-gold-glow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F0]">
                    AI Personal Food Trainer
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059]">
                    {subscriptionTier === 1
                      ? "Level 1: Daily Summary"
                      : subscriptionTier === 2
                      ? "Level 2: Live Chat"
                      : "Level 3: Clinical"}
                  </span>
                </div>
                <p className="text-[11px] text-[#888888] font-sans">
                  Gemini API Metabolic Intelligence &bull; Indian Haute Nutrition
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#141414] border border-[#2A2A2A] text-[#888888] hover:text-[#F5F5F0] hover:border-[#C5A059] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Telemetry Snapshot Bar */}
          <div className="px-5 py-3 bg-[#181818] border-b border-[#2A2A2A] flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[#888888]">Today's Intake:</span>
              <span className="font-mono font-bold text-[#F5F5F0]">
                {meals.length} Meal{meals.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-[#DFBE7A]" />
              <span className="text-[#888888]">Sleep:</span>
              <span
                className={`font-mono font-bold ${
                  isSleepDeprived ? "text-[#9E4747]" : "text-[#78866B]"
                }`}
              >
                {hoursSlept.toFixed(1)}h {isSleepDeprived ? "(Debt)" : "(Restorative)"}
              </span>
            </div>

            {subscriptionTier >= 3 && (
              <div className="flex items-center gap-1 text-[10px] text-[#C5A059] font-mono">
                <Crown className="w-3 h-3" />
                <span>Correlation Engine</span>
              </div>
            )}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* LEVEL 1 (PLUS): Daily Text Summary Mode */}
            {subscriptionTier === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <h4 className="text-xs uppercase font-mono font-bold text-[#F5F5F0]">
                        Daily Metabolic Synthesis Report
                      </h4>
                    </div>
                    <button
                      onClick={handleRefreshSummary}
                      disabled={isSummaryLoading}
                      className="p-1 rounded-full text-[#888888] hover:text-[#C5A059] transition-colors"
                      title="Refresh Analysis"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSummaryLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {isSummaryLoading ? (
                    <div className="py-8 text-center text-[#888888] space-y-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs">Synthesizing meals and sleep telemetry via Gemini...</p>
                    </div>
                  ) : dailySummary ? (
                    <div className="space-y-3">
                      <div className="text-xs text-[#F5F5F0]/90 leading-relaxed font-sans whitespace-pre-line bg-[#141414] p-3.5 rounded-xl border border-[#2A2A2A]">
                        {dailySummary.reply}
                      </div>

                      {dailySummary.suggested_meal && (
                        <div className="p-3 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#C5A059] block mb-1">
                            Prescribed Next Plate
                          </span>
                          <p className="text-xs font-serif font-bold text-[#F5F5F0]">
                            {dailySummary.suggested_meal}
                          </p>
                          {dailySummary.glycemic_recommendation && (
                            <p className="text-[11px] text-[#78866B] mt-0.5">
                              {dailySummary.glycemic_recommendation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Upsell Banner to Pro for Real-time Chat */}
                <div
                  onClick={() => openPricingModal(2, "Real-time AI Chat Coach")}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#181818] to-[#0A0A0A] border border-[#C5A059]/40 cursor-pointer group hover:border-[#C5A059] transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-[#C5A059]">
                    <Lock className="w-4 h-4" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                      Upgrade to Level 2 (Pro)
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0]">
                    Unlock Interactive Real-time Chat Coach
                  </h4>
                  <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                    Have an ongoing bidirectional conversation with your personal food trainer to customize recipes, ingredients, and dining-out choices in real-time.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                    <span>Unlock Live Chat (₹799/mo)</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 2 & 3 (PRO / CLINICAL): Interactive Real-time Chat Stream */}
            {subscriptionTier >= 2 && (
              <>
                {/* Level 3 Clinical Notification Badge */}
                {subscriptionTier >= 3 && (
                  <div className="p-3 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <p className="text-[11px] text-[#DFBE7A] font-sans leading-snug">
                      <strong>Sleep-Metabolic Correlation Engine Active:</strong> Trainer automatically recalibrates meal macro ratios to counter circadian sleep loss.
                    </p>
                  </div>
                )}

                {/* Messages stream */}
                <div className="space-y-3.5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-mono text-[#888888]">
                          {msg.sender === "user" ? "Patron" : "Michelin Food Trainer"}
                        </span>
                        <span className="text-[9px] text-[#888888]/60">&bull;</span>
                        <span className="text-[9px] text-[#888888]/60">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`rounded-2xl p-3.5 max-w-[90%] text-xs leading-relaxed font-sans ${
                          msg.sender === "user"
                            ? "bg-[#C5A059] text-[#0A0A0A] font-medium rounded-tr-sm"
                            : "bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F0] rounded-tl-sm shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>

                        {msg.suggested_meal && msg.sender === "coach" && (
                          <div className="mt-3 pt-2.5 border-t border-[#2A2A2A] flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                            <span className="text-[11px] text-[#DFBE7A] font-serif font-bold">
                              {msg.suggested_meal}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-[#888888] bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-3 max-w-[70%]">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[11px] text-[#888888]">Analyzing metabolic telemetry...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>

          {/* Quick Prompts & Chat Input Area (Tier 2+) */}
          {subscriptionTier >= 2 ? (
            <div className="p-4 border-t border-[#2A2A2A] bg-[#0A0A0A] space-y-3">
              {/* Quick suggestions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    disabled={isLoading}
                    className="shrink-0 text-[10px] font-sans px-2.5 py-1 rounded-full bg-[#141414] border border-[#2A2A2A] text-[#888888] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask your food trainer about your next meal..."
                  disabled={isLoading}
                  className="flex-1 glass-input rounded-full px-4 py-2.5 text-xs text-[#F5F5F0] placeholder-[#888888] focus:border-[#C5A059]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="btn-pill-gold w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
                >
                  <Send className="w-4 h-4 text-[#0A0A0A]" />
                </button>
              </form>
            </div>
          ) : (
            /* Tier 1 Upgrade Footer */
            <div className="p-4 border-t border-[#2A2A2A] bg-[#0A0A0A] text-center">
              <p className="text-[11px] text-[#888888] font-sans">
                Level 1 provides daily metabolic summaries. Upgrade to Level 2 for interactive real-time chat.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Export Floating Action Button (FAB)
interface AICoachFABProps {
  onOpen: () => void;
}

export const AICoachFAB: React.FC<AICoachFABProps> = ({ onOpen }) => {
  const { subscriptionTier, openPricingModal } = useAuth();

  const handleClick = () => {
    if (subscriptionTier < 1) {
      openPricingModal(1, "AI Personal Food Trainer");
    } else {
      onOpen();
    }
  };

  const isLocked = subscriptionTier < 1;

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleClick}
        title="AI Personal Food Trainer"
        className="relative group p-0 w-14 h-14 rounded-full bg-[#141414] border border-[#C5A059] shadow-gold-glow flex items-center justify-center text-[#C5A059] transition-all"
      >
        {/* Subtle pulsing outer ring */}
        <span className="absolute -inset-1 rounded-full bg-[#C5A059]/20 animate-ping opacity-35 pointer-events-none" />

        {/* Bot & Sparkle icon */}
        <div className="relative flex items-center justify-center">
          <Bot className="w-6 h-6 text-[#C5A059]" />
          <Sparkles className="w-3.5 h-3.5 text-[#DFBE7A] absolute -top-1.5 -right-1.5 animate-pulse" />
        </div>

        {/* Subtle Lock indicator if Tier < 1 */}
        {isLocked && (
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0A0A0A] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <Lock className="w-2.5 h-2.5 text-[#C5A059]" />
          </div>
        )}

        {/* Tooltip on hover */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-xs font-serif font-bold text-[#F5F5F0] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
          {isLocked ? "Unlock AI Food Trainer" : "Consult AI Food Trainer"}
        </span>
      </motion.button>
    </div>
  );
};
