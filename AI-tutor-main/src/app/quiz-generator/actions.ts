'use server';

import { z } from 'zod';

const quizInputSchema = z.object({
  num: z.number().min(1).max(10),
  attemptedIds: z.array(z.number()).default([]),
});

const generateMockQuiz = (
  num: number,
  attemptedIds: number[]
) => {

  const questions = [
    // ------------------------------------------------
    // YOUR EXISTING QUESTIONS
    // ------------------------------------------------

    {
      id: 1,
      question:
        'What is the theoretical peak download speed for 5G networks?',
      options: {
        A: 'Up to 10 Gbps',
        B: 'Up to 100 Mbps',
        C: 'Up to 1 Gbps',
        D: 'Up to 500 Mbps',
      },
    },

    {
      id: 2,
      question:
        'What is the typical latency range for 4G networks?',
      options: {
        A: 'As low as 1 millisecond',
        B: '5-10 milliseconds',
        C: '50-100 milliseconds',
        D: '200-500 milliseconds',
      },
    },

    {
      id: 3,
      question:
        'Which technology is a key component of 5G architecture?',
      options: {
        A: 'OFDM',
        B: 'MIMO',
        C: 'Both A and B',
        D: 'Neither A nor B',
      },
    },

    {
      id: 4,
      question:
        "What does 'Gbps' stand for?",
      options: {
        A: 'Giga bits per second',
        B: 'Giga bytes per second',
        C: 'Great bits per second',
        D: 'General bits per second',
      },
    },

    {
      id: 5,
      question:
        'What is network slicing?',
      options: {
        A: 'A way to physically divide a network',
        B: 'A way to virtually divide a network for different use cases',
        C: 'A type of network cable',
        D: 'A network security protocol',
      },
    },

    /*
     * ADD YOUR OTHER QUESTIONS HERE.
     *
     * IMPORTANT:
     * IDs must be unique.
     *
     * Example:
     *
     * id: 6
     * id: 7
     * id: 8
     *
     * ...
     *
     * You can have 50+ questions.
     */

    {
      id: 6,
      question:
        'Which protocol is commonly used to automatically assign IP addresses?',
      options: {
        A: 'HTTP',
        B: 'DHCP',
        C: 'FTP',
        D: 'SMTP',
      },
    },

    {
      id: 7,
      question:
        'Which device forwards packets between different networks?',
      options: {
        A: 'Switch',
        B: 'Hub',
        C: 'Router',
        D: 'Repeater',
      },
    },

    {
      id: 8,
      question:
        'What does DNS primarily do?',
      options: {
        A: 'Encrypt files',
        B: 'Translate domain names into IP addresses',
        C: 'Assign MAC addresses',
        D: 'Create passwords',
      },
    },

    {
      id: 9,
      question:
        'Which layer of the OSI model handles routing?',
      options: {
        A: 'Physical',
        B: 'Data Link',
        C: 'Network',
        D: 'Application',
      },
    },

    {
      id: 10,
      question:
        'What is the purpose of a firewall?',
      options: {
        A: 'Increase monitor brightness',
        B: 'Filter network traffic',
        C: 'Store passwords',
        D: 'Create websites',
      },
    },

    {
      id: 11,
      question:
        'Which protocol is used for secure web browsing?',
      options: {
        A: 'HTTP',
        B: 'HTTPS',
        C: 'FTP',
        D: 'SMTP',
      },
    },

    {
      id: 12,
      question:
        'Which address uniquely identifies a network interface?',
      options: {
        A: 'MAC address',
        B: 'URL',
        C: 'Port number',
        D: 'Domain name',
      },
    },

    {
      id: 13,
      question:
        'Which protocol is used to send email?',
      options: {
        A: 'SMTP',
        B: 'DNS',
        C: 'ARP',
        D: 'DHCP',
      },
    },

    {
      id: 14,
      question:
        'Which protocol maps an IP address to a MAC address?',
      options: {
        A: 'DNS',
        B: 'ARP',
        C: 'HTTP',
        D: 'FTP',
      },
    },

    {
      id: 15,
      question:
        'What is the main purpose of encryption?',
      options: {
        A: 'Increase file size',
        B: 'Protect information from unauthorized access',
        C: 'Delete information',
        D: 'Slow down a network',
      },
    },
  ];

  const answerKey: Record<string, string> = {
    '1': 'A',
    '2': 'C',
    '3': 'C',
    '4': 'A',
    '5': 'B',
    '6': 'B',
    '7': 'C',
    '8': 'B',
    '9': 'C',
    '10': 'B',
    '11': 'B',
    '12': 'A',
    '13': 'A',
    '14': 'B',
    '15': 'B',
  };

  /*
   * Remove previously attempted questions.
   */

  const availableQuestions =
    questions.filter(
      (question) =>
        !attemptedIds.includes(
          question.id
        )
    );

  /*
   * If all questions have been attempted,
   * start the pool again.
   *
   * This prevents the quiz from getting stuck.
   */

  const questionPool =
    availableQuestions.length >= num
      ? availableQuestions
      : questions;

  /*
   * Shuffle the questions.
   */

  const shuffledQuestions = [
    ...questionPool,
  ].sort(() => Math.random() - 0.5);

  /*
   * Select only the requested number.
   */

  const selectedQuestions =
    shuffledQuestions.slice(0, num);

  const selectedAnswerKey =
    Object.fromEntries(
      Object.entries(answerKey).filter(
        ([key]) =>
          selectedQuestions.some(
            (question) =>
              question.id ===
              Number(key)
          )
      )
    );

  return {
    questions: selectedQuestions,
    answer_key: selectedAnswerKey,
  };
};

export async function generateQuiz(
  formData: FormData
) {
  const num = Number(
    formData.get('num')
  );

  const attemptedIdsString =
    String(
      formData.get('attemptedIds') || ''
    );

  const attemptedIds =
    attemptedIdsString
      ? attemptedIdsString
          .split(',')
          .map(Number)
          .filter(Boolean)
      : [];

  const input =
    quizInputSchema.safeParse({
      num,
      attemptedIds,
    });

  if (!input.success) {
    return {
      error:
        'Invalid number of questions.',
    };
  }

  return generateMockQuiz(
    input.data.num,
    input.data.attemptedIds
  );
}
