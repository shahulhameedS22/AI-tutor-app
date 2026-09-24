'use server';

import { z } from 'zod';

const quizInputSchema = z.object({
  num: z.number().min(1).max(10),
});

const generateMockQuiz = (
  num: number,
  attemptedIds: number[] = []
) => {
  const questions = [
    {
      id: 1,
      question:
        'What is the theoretical peak download speed for 5G networks, as mentioned in the provided text?',
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
        'What is the typical latency range for 4G networks according to the text?',
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
        A: 'Gigabits per second',
        B: 'Gigabytes per second',
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

    {
      id: 6,
      question:
        'Which generation introduced commercial 5G networks?',
      options: {
        A: '3G',
        B: '4G',
        C: '5G',
        D: '2G',
      },
    },

    {
      id: 7,
      question:
        'What does MIMO stand for?',
      options: {
        A: 'Multiple Input Multiple Output',
        B: 'Maximum Input Maximum Output',
        C: 'Multiple Internet Multiple Output',
        D: 'Main Input Main Output',
      },
    },

    {
      id: 8,
      question:
        'Which frequency range is commonly associated with 5G millimeter wave?',
      options: {
        A: 'Below 1 GHz',
        B: '1-2 GHz',
        C: 'Above 24 GHz',
        D: '2-3 GHz',
      },
    },

    {
      id: 9,
      question:
        'What is one major advantage of 5G?',
      options: {
        A: 'Higher latency',
        B: 'Lower data speeds',
        C: 'Lower latency',
        D: 'Less connectivity',
      },
    },

    {
      id: 10,
      question:
        'What does OFDM stand for?',
      options: {
        A: 'Orthogonal Frequency Division Multiplexing',
        B: 'Optical Frequency Data Management',
        C: 'Open Frequency Digital Modulation',
        D: 'Online Frequency Division Mode',
      },
    },

    {
      id: 11,
      question:
        'Which technology helps 5G support many connected devices?',
      options: {
        A: 'Massive MIMO',
        B: 'Dial-up',
        C: 'Bluetooth only',
        D: 'DSL',
      },
    },

    {
      id: 12,
      question:
        'What is latency?',
      options: {
        A: 'The delay before data transfer begins',
        B: 'The amount of storage',
        C: 'The size of a network',
        D: 'The number of users',
      },
    },

    {
      id: 13,
      question:
        'Which network generation generally provides higher speeds than 4G?',
      options: {
        A: '2G',
        B: '3G',
        C: '5G',
        D: '1G',
      },
    },

    {
      id: 14,
      question:
        'What is an important application of 5G?',
      options: {
        A: 'IoT',
        B: 'Telemedicine',
        C: 'Autonomous vehicles',
        D: 'All of the above',
      },
    },

    {
      id: 15,
      question:
        'What does IoT stand for?',
      options: {
        A: 'Internet of Things',
        B: 'Input of Technology',
        C: 'Internet of Telephones',
        D: 'Internal Online Technology',
      },
    },
  ];

  const answerKey: Record<string, string> = {
    '1': 'A',
    '2': 'C',
    '3': 'C',
    '4': 'A',
    '5': 'B',
    '6': 'C',
    '7': 'A',
    '8': 'C',
    '9': 'C',
    '10': 'A',
    '11': 'A',
    '12': 'A',
    '13': 'C',
    '14': 'D',
    '15': 'A',
  };

  // Remove questions that the user has already attempted
  const availableQuestions = questions.filter(
    (question) => !attemptedIds.includes(question.id)
  );

  // Randomly shuffle the remaining questions
  const shuffledQuestions = [...availableQuestions].sort(
    () => Math.random() - 0.5
  );

  // Select the required number of questions
  const selectedQuestions = shuffledQuestions.slice(0, num);

  // Create answer key only for selected questions
  const selectedAnswerKey = Object.fromEntries(
    selectedQuestions.map((question) => [
      question.id.toString(),
      answerKey[question.id.toString()],
    ])
  );

  return {
    questions: selectedQuestions,
    answer_key: selectedAnswerKey,
  };
};

export async function generateQuiz(formData: FormData) {
  const input = quizInputSchema.safeParse({
    num: Number(formData.get('num')),
  });

  if (!input.success) {
    return {
      error: 'Invalid number of questions.',
    };
  }

  // Get previously attempted question IDs
  const attemptedIdsString =
    formData.get('attemptedIds')?.toString() || '';

  const attemptedIds = attemptedIdsString
    ? attemptedIdsString
        .split(',')
        .map(Number)
        .filter((id) => !isNaN(id))
    : [];

  // Generate quiz without previously attempted questions
  const quizData = generateMockQuiz(
    input.data.num,
    attemptedIds
  );

  // Check whether enough new questions are available
  if (quizData.questions.length < input.data.num) {
    return {
      error:
        'You have attempted all available questions. Please add more questions to the question bank.',
    };
  }

  return quizData;
}
