"use client";

import * as React from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askAssistantAction } from "@/app/(dashboard)/assistente/actions";

const SUGGESTIONS = [
  "Quanto gastei com alimentação este mês?",
  "Qual meu saldo atual?",
  "Quanto recebi de receitas nos últimos 3 meses?",
];

interface Exchange {
  question: string;
  answer: string;
}

export function AssistantWidget() {
  const [question, setQuestion] = React.useState("");
  const [history, setHistory] = React.useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleAsk(q: string) {
    if (!q.trim() || isLoading) return;
    setIsLoading(true);
    setQuestion("");
    try {
      const result = await askAssistantAction(q);
      setHistory((prev) => [
        ...prev,
        { question: q, answer: result.success ? result.answer : result.error },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">Assistente Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleAsk(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {history.map((exchange, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium">{exchange.question}</p>
                <p className="rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">{exchange.answer}</p>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Pergunte sobre suas finanças..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !question.trim()}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
