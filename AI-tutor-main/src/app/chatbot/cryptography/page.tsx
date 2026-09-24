'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Bot, History, Plus, Send } from 'lucide-react';

import { cryptographyChatbot } from '@/ai/flows/cryptography-chatbot';

import { Header } from '@/components/layout/header';

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
  doc,
  query,
  orderBy,
} from 'firebase/firestore';


const formSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, {
      message: 'Please enter a question.',
    }),
});


type Message = {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
};


export default function CryptographyChatbotPage() {

  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const {
    user,
    isUserLoading,
  } = useUser();

  const firestore = useFirestore();

  const router = useRouter();


  /*
   * --------------------------------------------------
   * FIRESTORE CHAT HISTORY
   * --------------------------------------------------
   */

  const chatHistoryQuery = useMemoFirebase(() => {

    if (!user) {
      return null;
    }

    return query(
      collection(
        firestore,
        'users',
        user.uid,
        'cryptographyChatHistory'
      ),
      orderBy('createdAt', 'asc')
    );

  }, [firestore, user]);


  const {
    data: savedMessages,
    isLoading: isHistoryLoading,
  } = useCollection<Message>(chatHistoryQuery);


  /*
   * --------------------------------------------------
   * AUTH CHECK
   * --------------------------------------------------
   */

  useEffect(() => {

    if (!isUserLoading && !user) {
      router.push('/login');
    }

  }, [
    user,
    isUserLoading,
    router,
  ]);


  /*
   * --------------------------------------------------
   * DO NOT AUTOMATICALLY LOAD OLD CHAT
   * --------------------------------------------------
   *
   * The user should start with a fresh chat.
   */

  useEffect(() => {

    if (!user) {
      return;
    }

    setMessages([]);

  }, [user]);


  /*
   * --------------------------------------------------
   * FORM
   * --------------------------------------------------
   */

  const form = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),

    defaultValues: {
      question: '',
    },
  });


  /*
   * --------------------------------------------------
   * START NEW CHAT
   * --------------------------------------------------
   */

  function startNewChat() {

    setMessages([]);

    setActiveChatId(null);

    form.reset();

    setHistoryOpen(false);

  }


  /*
   * --------------------------------------------------
   * GET INITIALS
   * --------------------------------------------------
   */

  function getInitials(
    name?: string | null
  ) {

    if (!name) {
      return 'U';
    }

    const names = name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (names.length >= 2) {

      return (
        names[0][0] +
        names[names.length - 1][0]
      ).toUpperCase();

    }

    return name
      .substring(0, 2)
      .toUpperCase();
  }


  /*
   * --------------------------------------------------
   * SEND MESSAGE
   * --------------------------------------------------
   */

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {

    if (!user) {
      return;
    }

    const question =
      values.question.trim();

    if (!question) {
      return;
    }

    setIsLoading(true);

    form.reset();


    /*
     * USER MESSAGE
     */

    const userMessage: Message = {
      role: 'user',
      content: question,
    };


    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);


    /*
     * FIRESTORE
     */

    try {

      const historyCollection =
        collection(
          firestore,
          'users',
          user.uid,
          'cryptographyChatHistory'
        );


      const userMessageRef =
        doc(historyCollection);


      setDocumentNonBlocking(
        userMessageRef,

        {
          id: userMessageRef.id,
          role: 'user',
          content: question,
          userId: user.uid,
          chatId:
            activeChatId ||
            userMessageRef.id,
          createdAt:
            new Date().toISOString(),
        },

        {
          merge: true,
        }
      );


      /*
       * --------------------------------------------------
       * GREETINGS
       * --------------------------------------------------
       */

      const greetingPattern =
        /^(hi|hii|hiii|hello|hey|heyy|hai|good morning|good afternoon|good evening)[!. ]*$/i;


      if (
        greetingPattern.test(question)
      ) {

        const welcomeMessage: Message = {
          role: 'model',

          content:
            'Hello! 👋 Welcome to the Cryptography Tutor. How can I help you today?',
        };


        setMessages((previous) => [
          ...previous,
          welcomeMessage,
        ]);


        const welcomeRef =
          doc(historyCollection);


        setDocumentNonBlocking(
          welcomeRef,

          {
            id: welcomeRef.id,
            role: 'model',
            content:
              welcomeMessage.content,
            userId: user.uid,
            chatId:
              activeChatId ||
              userMessageRef.id,
            createdAt:
              new Date().toISOString(),
          },

          {
            merge: true,
          }
        );


        return;
      }


      /*
       * --------------------------------------------------
       * AI HISTORY
       * --------------------------------------------------
       */

      const historyForAI = [
        ...messages,
        userMessage,
      ]
        .slice(-12)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));


      /*
       * --------------------------------------------------
       * CALL AI
       * --------------------------------------------------
       */

      const result =
        await cryptographyChatbot({
          history: historyForAI,
          question,
        });


      const response =
        result?.response ||
        'I could not generate a response right now. Please try again.';


      const modelMessage: Message = {
        role: 'model',
        content: response,
      };


      /*
       * SHOW AI RESPONSE
       */

      setMessages((previous) => [
        ...previous,
        modelMessage,
      ]);


      /*
       * SAVE AI RESPONSE
       */

      const modelMessageRef =
        doc(historyCollection);


      setDocumentNonBlocking(
        modelMessageRef,

        {
          id: modelMessageRef.id,
          role: 'model',
          content: response,
          userId: user.uid,
          chatId:
            activeChatId ||
            userMessageRef.id,
          createdAt:
            new Date().toISOString(),
        },

        {
          merge: true,
        }
      );

    } catch (error) {

      console.error(
        'Chatbot request failed:',
        error
      );


      /*
       * IMPORTANT:
       * Never crash the page.
       */

      const friendlyMessage: Message = {
        role: 'model',

        content:
          'The AI service is temporarily unavailable. Please wait a moment and try again.',
      };


      setMessages((previous) => [
        ...previous,
        friendlyMessage,
      ]);

    } finally {

      setIsLoading(false);

    }
  }


  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (
    isUserLoading ||
    !user
  ) {

    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  }


  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (

    <div className="flex min-h-screen flex-col">

      <Header />


      <main className="flex flex-1 justify-center p-4">

        <Card className="flex h-[78vh] w-full max-w-4xl flex-col">


          {/* HEADER */}

          <CardHeader className="border-b">

            <div className="flex items-center justify-between">

              <CardTitle className="flex items-center gap-2">

                <Bot className="h-6 w-6" />

                Cryptography Tutor

              </CardTitle>


              <div className="flex items-center gap-2">


                {/* NEW CHAT */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewChat}
                >

                  <Plus className="mr-2 h-4 w-4" />

                  New Chat

                </Button>


                {/* HISTORY */}

                <Dialog
                  open={historyOpen}
                  onOpenChange={setHistoryOpen}
                >

                  <DialogTrigger asChild>

                    <Button
                      variant="outline"
                      size="sm"
                    >

                      <History className="mr-2 h-4 w-4" />

                      History

                    </Button>

                  </DialogTrigger>


                  <DialogContent className="max-h-[80vh] overflow-y-auto">

                    <DialogHeader>

                      <DialogTitle>
                        Chat History
                      </DialogTitle>

                    </DialogHeader>


                    <div className="space-y-3">

                      {isHistoryLoading && (

                        <p className="text-sm text-muted-foreground">
                          Loading history...
                        </p>

                      )}


                      {!isHistoryLoading &&
                        (!savedMessages ||
                          savedMessages.length === 0) && (

                          <p className="text-sm text-muted-foreground">
                            No previous conversations yet.
                          </p>

                        )}


                      {savedMessages &&
                        savedMessages.length > 0 && (

                          <div className="space-y-2">

                            {savedMessages
                              .filter(
                                (message) =>
                                  message.role ===
                                  'user'
                              )
                              .map(
                                (
                                  message,
                                  index
                                ) => (

                                  <button
                                    key={
                                      message.id ||
                                      index
                                    }
                                    className="w-full rounded-lg border p-3 text-left transition hover:bg-muted"
                                    onClick={() => {

                                      const selectedIndex =
                                        savedMessages.findIndex(
                                          (item) =>
                                            item.id ===
                                            message.id
                                        );


                                      if (
                                        selectedIndex ===
                                        -1
                                      ) {
                                        return;
                                      }


                                      const selectedChat =
                                        savedMessages.slice(
                                          selectedIndex
                                        );


                                      setMessages(
                                        selectedChat
                                      );


                                      setHistoryOpen(
                                        false
                                      );

                                    }}
                                  >

                                    <p className="font-medium">

                                      {message.content.length >
                                      70
                                        ? message.content.substring(
                                            0,
                                            70
                                          ) + '...'
                                        : message.content}

                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">

                                      Previous question

                                    </p>

                                  </button>

                                )
                              )}

                          </div>

                        )}

                    </div>

                  </DialogContent>

                </Dialog>

              </div>

            </div>

          </CardHeader>


          {/* CHAT */}

          <CardContent className="flex-1 overflow-hidden">

            <ScrollArea className="h-full pr-4">

              <div className="space-y-5 py-4">


                {/* EMPTY CHAT */}

                {messages.length === 0 &&
                  !isLoading && (

                    <div className="flex items-start gap-3">

                      <Avatar className="h-9 w-9">

                        <AvatarFallback>
                          <Bot />
                        </AvatarFallback>

                      </Avatar>


                      <div className="rounded-lg bg-muted px-4 py-3">

                        <p className="text-sm">

                          Hello! 👋

                        </p>

                        <p className="mt-1 text-sm">

                          Welcome to the Cryptography Tutor.
                          What would you like to learn today?

                        </p>

                      </div>

                    </div>

                  )}


                {/* MESSAGES */}

                {messages.map(
                  (message, index) => (

                    <div
                      key={
                        message.id ||
                        `${message.role}-${index}`
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

                        <Avatar className="h-9 w-9">

                          <AvatarFallback>
                            <Bot />
                          </AvatarFallback>

                        </Avatar>

                      )}


                      <div
                        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm ${
                          message.role ===
                          'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >

                        {message.content}

                      </div>


                      {message.role ===
                        'user' && (

                        <Avatar className="h-9 w-9">

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


                {/* THINKING */}

                {isLoading && (

                  <div className="flex items-start gap-3">

                    <Avatar className="h-9 w-9">

                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>

                    </Avatar>


                    <div className="rounded-lg bg-muted px-4 py-3">

                      <p className="text-sm text-muted-foreground">
                        Thinking...
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </ScrollArea>

          </CardContent>


          {/* INPUT */}

          <CardFooter className="border-t pt-4">

            <Form {...form}>

              <form
                onSubmit={form.handleSubmit(
                  onSubmit
                )}

                className="flex w-full items-center gap-2"
              >

                <FormField
                  control={form.control}
                  name="question"

                  render={({ field }) => (

                    <FormItem className="flex-1">

                      <FormControl>

                        <Input
                          placeholder="Ask about cryptography..."
                          {...field}
                          disabled={isLoading}
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}
                />


                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !form.watch(
                      'question'
                    )?.trim()
                  }
                >

                  <Send className="mr-2 h-4 w-4" />

                  Send

                </Button>

              </form>

            </Form>

          </CardFooter>

        </Card>

      </main>

    </div>

  );
}
