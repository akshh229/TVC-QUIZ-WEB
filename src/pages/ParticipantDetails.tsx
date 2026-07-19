// src/pages/ParticipantDetails.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/StepIndicator";
import { useGameStore } from "@/store/gameStore";

export default function ParticipantDetails() {
  const navigate = useNavigate();
  const setParticipant = useGameStore((s) => s.setParticipant);
  const storedName = useGameStore((s) => s.participantName);
  const storedDept = useGameStore((s) => s.department);

  const [name, setName] = useState(storedName);
  const [department, setDepartment] = useState(storedDept);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Please tell us your name — at least 2 characters.");
      return;
    }
    setNameError(null);
    setParticipant(trimmed, department);
    navigate("/spin");
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-12 sm:px-10 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Editorial intro column */}
      <div className="flex flex-col justify-center pt-4 lg:pt-0">
        <StepIndicator current={1} />
        <h1 className="mt-6 max-w-md font-serif text-4xl leading-tight text-ink sm:text-5xl">
          Before you lead, introduce yourself.
        </h1>
        <p className="mt-4 max-w-sm text-ink/60">
          We keep it short — a name is all it takes to get on the board.
        </p>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-lg border border-ink/10 bg-card p-8 shadow-card sm:p-10"
        >
          <div className="space-y-7">
            <div className="space-y-2.5">
              <Label htmlFor="participant-name">
                Full name <span className="text-terracotta">*</span>
              </Label>
              <Input
                id="participant-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError && e.target.value.trim().length >= 2) setNameError(null);
                }}
                placeholder="e.g., Ananya Sharma"
                autoComplete="off"
                aria-required="true"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
                className="text-lg"
              />
              {nameError && (
                <p id="name-error" className="text-sm text-terracotta" role="alert">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="participant-dept">
                Course / Department{" "}
                <span className="text-xs font-normal text-ink/40">(optional)</span>
              </Label>
              <Input
                id="participant-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., B.Tech CSE, First year"
                autoComplete="off"
                className="text-lg"
              />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft aria-hidden="true" />
                Back
              </Link>
            </Button>
            <Button type="submit" size="lg" className="group flex-1 sm:flex-none sm:px-10">
              Continue
              <ArrowRight
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
