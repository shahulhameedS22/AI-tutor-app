'use server';

import { z } from 'zod';

const quizInputSchema = z.object({
  num: z.number().min(1).max(10),
});

// This is a mock function that simulates fetching data from an external API.
// In a real application, you would replace this with a fetch call to process.env.QUIZ_API_URL.
const generateMockQuiz = (num: number) => {
    const questions = [
        {
          "id": 1,
          "question": "What is the theoretical peak download speed for 5G networks, as mentioned in the provided text?",
          "options": {
            "A": "Up to 10 Gbps",
            "B": "Up to 100 Mbps",
            "C": "Up to 1 Gbps",
            "D": "Up to 500 Mbps"
          }
        },
        {
          "id": 2,
          "question": "What is the typical latency range for 4G networks according to the text?",
          "options": {
            "A": "As low as 1 millisecond",
            "B": "5-10 milliseconds",
            "C": "50-100 milliseconds",
            "D": "200-500 milliseconds"
          }
        },
        {
            "id": 3,
            "question": "Which technology is a key component of 5G architecture?",
            "options": {
                "A": "OFDM",
                "B": "MIMO",
                "C": "Both A and B",
                "D": "Neither A nor B"
            }
        },
        {
            "id": 4,
            "question": "What does 'Gbps' stand for?",
            "options": {
                "A": "Giga bits per second",
                "B": "Giga bytes per second",
                "C": "Great bits per second",
                "D": "General bits per second"
            }
        },
        {
            "id": 5,
            "question": "What is network slicing?",
            "options": {
                "A": "A way to physically divide a network",
                "B": "A way to virtually divide a network for different use cases",
                "C": "A type of network cable",
                "D": "A network security protocol"
            }
        }
      ];

    const answerKey = {
        "1": "A",
        "2": "C",
        "3": "C",
        "4": "A",
        "5": "B"
    };
    
    const selectedQuestions = questions.slice(0, num);
    const selectedAnswerKey = Object.fromEntries(
        Object.entries(answerKey).filter(([key]) => selectedQuestions.some(q => q.id === parseInt(key)))
    );

  return {
    questions: selectedQuestions,
    answer_key: selectedAnswerKey
  };
};


export async function generateQuiz(formData: FormData) {
  const input = quizInputSchema.safeParse({
    num: Number(formData.get('num')),
  });

  if (!input.success) {
    return { error: 'Invalid number of questions.' };
  }
  
  // For now, we use the mock function.
  // In the future, you would do something like this:
  /*
  const response = await fetch(process.env.QUIZ_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num: input.data.num }),
  });
  if (!response.ok) {
      return { error: 'Failed to fetch quiz data.' };
  }
  const data = await response.json();
  // The API returns two separate JSON objects, so we need to combine them.
  // This assumes the API returns a stream or a specific format.
  // The following is a placeholder for how you might combine them.
  // You will need to adjust this based on how the API actually returns the data.
  const quizData = {
    questions: data[0].questions,
    answer_key: data[1].answer_key
  }
  return quizData;
  */
  
  const quizData = generateMockQuiz(input.data.num);
  return quizData;
}
