'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cryptographyChatbot } from '@/ai/flows/cryptography-chatbot';
import { Header } from '@/components/layout/header';
import { Bot } from 'lucide-react';
import { useUser, useFirestore, useCollection, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, doc } from 'firebase/firestore';

const formSchema = z.object({
  question: z.string().min(1, { message: 'Please enter a question.' }),
});

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function CryptographyChatbotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const chatHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'cryptographyChatHistory'), orderBy('createdAt', 'asc'));
  }, [firestore, user]);

  const { data: chatHistory, isLoading: isHistoryLoading } = useCollection<Message>(chatHistoryQuery);

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || isHistoryLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsLoading(true);
    form.reset();

    const userMessage: Omit<Message, 'id'> = {
      role: 'user',
      content: values.question,
    };
    
    const chatHistoryCollectionRef = collection(firestore, 'users', user.uid, 'cryptographyChatHistory');
    
    const userMessageRef = doc(chatHistoryCollectionRef);
    setDocumentNonBlocking(userMessageRef, {
        id: userMessageRef.id,
        ...userMessage,
        userId: user.uid,
        createdAt: new Date().toISOString(),
    }, {});
    
    const historyForAI = [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const result = await cryptographyChatbot({
        history: historyForAI.slice(0, -1),
        question: values.question,
      });
      
      const modelMessage: Omit<Message, 'id'> = {
        role: 'model',
        content: result.response,
      };
      
      const modelMessageRef = doc(chatHistoryCollectionRef);
      setDocumentNonBlocking(modelMessageRef, {
        id: modelMessageRef.id,
        ...modelMessage,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      }, {});

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[names.length - 1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex justify-center items-center p-4">
        <Card className="w-full max-w-2xl h-[70vh] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> Cryptography Tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'model' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                     {message.role === 'user' && user && (
                       <Avatar className="h-8 w-8">
                         <AvatarImage src={user.photoURL || ''} />
                         <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                       </Avatar>
                    )}
                  </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                            <p className="text-sm">Thinking...</p>
                        </div>
                    </div>
                )}
                 {messages.length === 0 && !isLoading && !isHistoryLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                            <p className="text-sm">Hello! Ask me anything about cryptography.</p>
                        </div>
                    </div>
                 )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center space-x-2"
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
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </form>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
