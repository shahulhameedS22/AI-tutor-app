'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  ArrowLeft,
  Bot,
  Send,
  User,
} from 'lucide-react';

import { askCryptography } from './actions';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function CryptographyPage() {
  const router = useRouter();

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    setErrorMessage('');

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const history = [
        ...messages,
        userMessage,
      ].map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const answer =
        await askCryptography(
          text,
          history
        );

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        'Cryptography chatbot error:',
        error
      );

      setErrorMessage(
        'The AI could not respond right now. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setInput('');
    setErrorMessage('');
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="min-h-[70vh]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full border p-2">
                  <Bot className="h-6 w-6" />
                </div>

                <div>
                  <CardTitle>
                    Cryptography Tutor
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask an AI tutor about
                    cryptography, networking and
                    security.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={clearChat}
                disabled={
                  messages.length === 0 &&
                  !input
                }
              >
                New Chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-[60vh] flex-col p-4">
            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.length === 0 && (
                <div className="flex min-h-[45vh] items-center justify-center">
                  <div className="max-w-md text-center">
                    <Bot className="mx-auto mb-4 h-12 w-12" />

                    <h2 className="text-xl font-semibold">
                      Hi! I'm your Cryptography
                      Tutor.
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Ask me anything about
                      encryption, hashing,
                      authentication, network
                      security or cryptography.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.role ===
                    'assistant' && (
                    <div className="mt-1 rounded-full border p-2">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl border p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="mt-1 rounded-full border p-2">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="mt-1 rounded-full border p-2">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="rounded-xl border bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Thinking...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mb-3 rounded-lg border p-3">
                <p className="text-sm">
                  {errorMessage}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t pt-4"
            >
              <Input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask a cryptography question..."
                disabled={isLoading}
                className="flex-1"
              />

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !input.trim()
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
