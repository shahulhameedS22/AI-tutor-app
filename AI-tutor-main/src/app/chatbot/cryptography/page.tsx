'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import {
  ScrollArea,
} from '@/components/ui/scroll-area';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import { cryptographyChatbot } from '@/ai/flows/cryptography-chatbot';

import { Header } from '@/components/layout/header';

import {
  Bot,
  MessageSquare,
  Plus,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useUser,
  useFirestore,
  useCollection,
  setDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';

import { useRouter } from 'next/navigation';

import {
  collection,
  query,
  orderBy,
  doc,
} from 'firebase/firestore';

const formSchema = z.object({
  question: z
    .string()
    .min(1, { message: 'Please enter a question.' }),
});

type Message = {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
};

type Chat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export default function CryptographyChatbotPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Current conversation
  const [messages, setMessages] = useState<Message[]>([]);

  // Currently selected chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // History panel
  const [showHistory, setShowHistory] = useState(true);

  const { user, isUserLoading } = useUser();

  const router = useRouter();

  const firestore = useFirestore();

  /*
   * ---------------------------------------------------------
   * CHAT HISTORY
   * ---------------------------------------------------------
   */

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;

    return query(
      collection(
        firestore,
        'users',
        user.uid,
        'cryptographyChats'
      ),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const {
    data: chats,
    isLoading: isChatsLoading,
  } = useCollection<Chat>(chatsQuery);

  /*
   * ---------------------------------------------------------
   * CURRENT CHAT MESSAGES
   * ---------------------------------------------------------
   */

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !activeChatId) return null;

    return query(
      collection(
        firestore,
        'users',
        user.uid,
        'cryptographyChats',
        activeChatId,
        'messages'
      ),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user, activeChatId]);

  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
  } = useCollection<Message>(messagesQuery);

  /*
   * Load selected chat messages
   */
  useEffect(() => {
    if (activeChatId && chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages, activeChatId]);

  /*
   * ---------------------------------------------------------
   * FORM
   * ---------------------------------------------------------
   */

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      question: '',
    },
  });

  /*
   * ---------------------------------------------------------
   * LOGIN CHECK
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  /*
   * ---------------------------------------------------------
   * START NEW CHAT
   * ---------------------------------------------------------
   */

  function startNewChat() {
    setActiveChatId(null);
    setMessages([]);
    form.reset();

    // On mobile/tablet, close history after selecting new chat
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowHistory(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * OPEN OLD CHAT
   * ---------------------------------------------------------
   */

  function openChat(chatId: string) {
    setActiveChatId(chatId);
    setMessages([]);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowHistory(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * CREATE CHAT TITLE
   * ---------------------------------------------------------
   */

  function createChatTitle(question: string) {
    const cleaned = question.trim();

    if (cleaned.length <= 45) {
      return cleaned;
    }

    return cleaned.substring(0, 45) + '...';
  }

  /*
   * ---------------------------------------------------------
   * SAVE MESSAGE
   * ---------------------------------------------------------
   */

  function saveMessage(
    chatId: string,
    message: Message
  ) {
    if (!user) return;

    const messagesCollection = collection(
      firestore,
      'users',
      user.uid,
      'cryptographyChats',
      chatId,
      'messages'
    );

    const messageRef = doc(messagesCollection);

    setDocumentNonBlocking(
      messageRef,
      {
        id: messageRef.id,
        role: message.role,
        content: message.content,
        createdAt:
          message.createdAt ||
          new Date().toISOString(),
      },
      {}
    );
  }

  /*
   * ---------------------------------------------------------
   * SUBMIT MESSAGE
   * ---------------------------------------------------------
   */

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {
    if (!user) return;

    const question = values.question.trim();

    if (!question) return;

    setIsLoading(true);

    form.reset();

    try {
      let currentChatId = activeChatId;

      /*
       * -----------------------------------------------------
       * CREATE A NEW CHAT IF THIS IS THE FIRST MESSAGE
       * -----------------------------------------------------
       */

      if (!currentChatId) {
        const chatsCollection = collection(
          firestore,
          'users',
          user.uid,
          'cryptographyChats'
        );

        const newChatRef = doc(chatsCollection);

        currentChatId = newChatRef.id;

        const now = new Date().toISOString();

        setDocumentNonBlocking(
          newChatRef,
          {
            id: currentChatId,

            title: createChatTitle(question),

            userId: user.uid,

            createdAt: now,

            updatedAt: now,
          },
          {}
        );

        setActiveChatId(currentChatId);
      } else {
        /*
         * Update chat's last activity time
         */
        const chatRef = doc(
          firestore,
          'users',
          user.uid,
          'cryptographyChats',
          currentChatId
        );

        setDocumentNonBlocking(
          chatRef,
          {
            updatedAt: new Date().toISOString(),
          },
          {
            merge: true,
          }
        );
      }

      /*
       * -----------------------------------------------------
       * USER MESSAGE
       * -----------------------------------------------------
       */

      const userMessage: Message = {
        role: 'user',
        content: question,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      saveMessage(
        currentChatId,
        userMessage
      );

      /*
       * -----------------------------------------------------
       * GREETING HANDLER
       * -----------------------------------------------------
       */

      const greetingPattern =
        /^(hi|hii|hiii|hello|hey|heyy|hai|good morning|good afternoon|good evening)[!. ]*$/i;

      if (greetingPattern.test(question)) {
        const welcomeMessage: Message = {
          role: 'model',

          content:
            'Hello! 👋 Welcome to the Cryptography Tutor. How can I help you today?',

          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [
          ...prev,
          welcomeMessage,
        ]);

        saveMessage(
          currentChatId,
          welcomeMessage
        );

        setIsLoading(false);

        return;
      }

      /*
       * -----------------------------------------------------
       * SEND TO AI
       * -----------------------------------------------------
       */

      const historyForAI = [
        ...messages,
        userMessage,
      ].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result =
        await cryptographyChatbot({
          history: historyForAI.slice(0, -1),

          question,
        });

      /*
       * -----------------------------------------------------
       * AI RESPONSE
       * -----------------------------------------------------
       */

      const modelMessage: Message = {
        role: 'model',

        content: result.response,

        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        modelMessage,
      ]);

      saveMessage(
        currentChatId,
        modelMessage
      );

      /*
       * Update chat activity
       */

      const chatRef = doc(
        firestore,
        'users',
        user.uid,
        'cryptographyChats',
        currentChatId
      );

      setDocumentNonBlocking(
        chatRef,
        {
          updatedAt: new Date().toISOString(),
        },
        {
          merge: true,
        }
      );
    } catch (error: any) {
      console.error(
        'Cryptography chatbot error:',
        error
      );

      /*
       * Professional error message
       */

      let friendlyMessage =
        'The AI tutor is temporarily unavailable. Please try again in a moment.';

      const errorText =
        error?.message || '';

      if (
        errorText.includes('429') ||
        errorText.includes('quota') ||
        errorText.includes('Too Many Requests')
      ) {
        friendlyMessage =
          'The AI tutor has temporarily reached its usage limit. Please try again after a short while.';
      }

      const errorMessage: Message = {
        role: 'model',

        content: friendlyMessage,

        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);

      /*
       * Don't save temporary API errors
       * into the permanent chat history.
       */
    } finally {
      setIsLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * USER INITIALS
   * ---------------------------------------------------------
   */

  const getInitials = (
    name?: string | null
  ) => {
    if (!name) return 'U';

    const names = name.split(' ');

    if (
      names.length > 1 &&
      names[names.length - 1]
    ) {
      return (
        names[0][0] +
        names[names.length - 1][0]
      );
    }

    return name.substring(0, 2);
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (
    isUserLoading ||
    !user ||
    isChatsLoading
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex justify-center items-center p-4">

        <Card className="w-full max-w-6xl h-[80vh] flex overflow-hidden">

          {/* =================================================
              HISTORY SIDEBAR
          ================================================= */}

          {showHistory && (
            <div className="hidden md:flex w-72 border-r flex-col bg-muted/20">

              <div className="p-4 border-b">

                <Button
                  className="w-full"
                  onClick={startNewChat}
                >
                  <Plus className="mr-2 h-4 w-4" />

                  New Chat
                </Button>

              </div>

              <div className="px-4 pt-4">

                <div className="flex items-center gap-2 text-sm font-semibold">

                  <History className="h-4 w-4" />

                  Chat History

                </div>

              </div>

              <ScrollArea className="flex-1 p-3">

                <div className="space-y-2">

                  {!chats ||
                  chats.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No previous chats yet.
                    </div>
                  ) : (
                    chats.map((chat) => (

                      <button
                        key={chat.id}
                        onClick={() =>
                          openChat(chat.id)
                        }
                        className={`w-full text-left rounded-lg p-3 transition hover:bg-muted ${
                          activeChatId === chat.id
                            ? 'bg-muted'
                            : ''
                        }`}
                      >

                        <div className="flex items-start gap-2">

                          <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />

                          <div className="min-w-0">

                            <p className="text-sm font-medium truncate">
                              {chat.title}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(
                                chat.updatedAt
                              ).toLocaleDateString()}
                            </p>

                          </div>

                        </div>

                      </button>

                    ))
                  )}

                </div>

              </ScrollArea>

            </div>
          )}

          {/* =================================================
              CHAT AREA
          ================================================= */}

          <div className="flex-1 flex flex-col min-w-0">

            <CardHeader className="border-b">

              <div className="flex items-center justify-between">

                <CardTitle className="flex items-center gap-2">

                  <Bot />

                  Cryptography Tutor

                </CardTitle>

                <div className="flex items-center gap-2">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowHistory(
                        !showHistory
                      )
                    }
                  >

                    <History className="h-4 w-4 mr-2" />

                    History

                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startNewChat}
                  >

                    <Plus className="h-4 w-4 mr-2" />

                    New Chat

                  </Button>

                </div>

              </div>

            </CardHeader>

            {/* =================================================
                MESSAGES
            ================================================= */}

            <CardContent className="flex-1 overflow-hidden">

              <ScrollArea className="h-full pr-4">

                <div className="space-y-4 py-4">

                  {/* NEW CHAT SCREEN */}

                  {messages.length === 0 &&
                    !isLoading && (
                      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">

                        <div className="rounded-full bg-primary/10 p-4 mb-4">

                          <Bot className="h-10 w-10 text-primary" />

                        </div>

                        <h2 className="text-xl font-semibold">
                          Cryptography Tutor
                        </h2>

                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                          Ask questions about encryption,
                          hashing, digital signatures,
                          cryptographic algorithms,
                          network security and more.
                        </p>

                        <div className="flex gap-2 mt-6 flex-wrap justify-center">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              form.setValue(
                                'question',
                                'What is cryptography?'
                              )
                            }
                          >
                            What is cryptography?
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              form.setValue(
                                'question',
                                'Explain RSA'
                              )
                            }
                          >
                            Explain RSA
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              form.setValue(
                                'question',
                                'What is hashing?'
                              )
                            }
                          >
                            What is hashing?
                          </Button>

                        </div>

                      </div>
                    )}

                  {messages.map(
                    (message, index) => (

                      <div
                        key={
                          message.id ||
                          `${message.createdAt}-${index}`
                        }
                        className={`flex items-start gap-3 ${
                          message.role ===
                          'user'
                            ? 'justify-end'
                            : ''
                        }`}
                      >

                        {message.role ===
                          'model' && (
                          <Avatar className="h-8 w-8">

                            <AvatarFallback>
                              <Bot />
                            </AvatarFallback>

                          </Avatar>
                        )}

                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                            message.role ===
                            'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >

                          <p className="text-sm">
                            {message.content}
                          </p>

                        </div>

                        {message.role ===
                          'user' &&
                          user && (
                            <Avatar className="h-8 w-8">

                              <AvatarImage
                                src={
                                  user.photoURL ||
                                  ''
                                }
                              />

                              <AvatarFallback>
                                {getInitials(
                                  user.displayName
                                )}
                              </AvatarFallback>

                            </Avatar>
                          )}

                      </div>

                    )
                  )}

                  {isLoading && (
                    <div className="flex items-start gap-3">

                      <Avatar className="h-8 w-8">

                        <AvatarFallback>
                          <Bot />
                        </AvatarFallback>

                      </Avatar>

                      <div className="rounded-lg px-4 py-2 bg-muted">

                        <p className="text-sm">
                          Thinking...
                        </p>

                      </div>

                    </div>
                  )}

                </div>

              </ScrollArea>

            </CardContent>

            {/* =================================================
                INPUT
            ================================================= */}

            <CardFooter className="border-t pt-4">

              <Form {...form}>

                <form
                  onSubmit={form.handleSubmit(
                    onSubmit
                  )}
                  className="flex w-full items-center space-x-2"
                >

                  <FormField
                    control={form.control}
                    name="question"
                    render={({
                      field,
                    }) => (

                      <FormItem className="flex-1">

                        <FormControl>

                          <Input
                            placeholder="Ask about cryptography..."
                            {...field}
                            disabled={
                              isLoading
                            }
                          />

                        </FormControl>

                        <FormMessage />

                      </FormItem>

                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    Send
                  </Button>

                </form>

              </Form>

            </CardFooter>

          </div>

        </Card>

      </div>

    </div>
  );
}
