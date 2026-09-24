'use server';

import { z } from 'zod';

type Question = {
  id: number;
  question: string;
  options: Record<string, string>;
  answer: string;
};

const quizInputSchema = z.object({
  num: z
    .number()
    .int()
    .min(1)
    .max(10),

  attemptedIds: z
    .array(z.number().int())
    .default([]),
});

const QUESTION_BANK: Question[] = [
  {
    id: 1,
    question:
      'What does 5G primarily improve compared with previous mobile generations?',
    options: {
      A: 'Only screen resolution',
      B: 'Speed, latency and connection capacity',
      C: 'Only battery capacity',
      D: 'Only phone storage',
    },
    answer: 'B',
  },

  {
    id: 2,
    question:
      'What does Gbps stand for?',
    options: {
      A: 'Gigabytes per second',
      B: 'Gigabits per second',
      C: 'General bits per system',
      D: 'Gigabit processing service',
    },
    answer: 'B',
  },

  {
    id: 3,
    question:
      'What is network slicing in 5G?',
    options: {
      A: 'Splitting a phone screen',
      B: 'Creating logical virtual networks on shared infrastructure',
      C: 'Increasing battery voltage',
      D: 'Dividing a SIM card',
    },
    answer: 'B',
  },

  {
    id: 4,
    question:
      'Which organization develops the major specifications used for 5G NR?',
    options: {
      A: '3GPP',
      B: 'W3C',
      C: 'ICANN',
      D: 'IETF only',
    },
    answer: 'A',
  },

  {
    id: 5,
    question:
      'What does NR mean in 5G NR?',
    options: {
      A: 'Network Router',
      B: 'New Radio',
      C: 'Network Relay',
      D: 'Node Receiver',
    },
    answer: 'B',
  },

  {
    id: 6,
    question:
      'What is a major characteristic of mmWave 5G?',
    options: {
      A: 'Very low frequency',
      B: 'High frequency and high bandwidth potential',
      C: 'No need for antennas',
      D: 'Only voice communication',
    },
    answer: 'B',
  },

  {
    id: 7,
    question:
      'What does MIMO use to improve wireless communication?',
    options: {
      A: 'Multiple antennas',
      B: 'Multiple SIM cards',
      C: 'Multiple batteries',
      D: 'Multiple operating systems',
    },
    answer: 'A',
  },

  {
    id: 8,
    question:
      'What is massive MIMO?',
    options: {
      A: 'A storage technology',
      B: 'A system using many antenna elements',
      C: 'A type of SIM card',
      D: 'A mobile operating system',
    },
    answer: 'B',
  },

  {
    id: 9,
    question:
      'What is beamforming used for?',
    options: {
      A: 'Directing radio energy toward intended users',
      B: 'Compressing videos',
      C: 'Encrypting passwords',
      D: 'Increasing phone storage',
    },
    answer: 'A',
  },

  {
    id: 10,
    question:
      'What is edge computing?',
    options: {
      A: 'Processing data closer to where it is generated',
      B: 'Processing only inside a smartphone',
      C: 'Deleting data at the network edge',
      D: 'Moving every service to a distant data center',
    },
    answer: 'A',
  },

  {
    id: 11,
    question:
      'Which 5G service category targets very high reliability and very low latency?',
    options: {
      A: 'eMBB',
      B: 'URLLC',
      C: 'mMTC',
      D: 'DNS',
    },
    answer: 'B',
  },

  {
    id: 12,
    question:
      'What does eMBB focus on?',
    options: {
      A: 'Enhanced mobile broadband',
      B: 'Emergency battery backup',
      C: 'Encrypted mobile browser',
      D: 'Extended memory bandwidth',
    },
    answer: 'A',
  },

  {
    id: 13,
    question:
      'What does mMTC focus on?',
    options: {
      A: 'Massive machine-type communications',
      B: 'Mobile media compression',
      C: 'Manual network testing',
      D: 'Multi-monitor traffic control',
    },
    answer: 'A',
  },

  {
    id: 14,
    question:
      'What is 5G standalone mode?',
    options: {
      A: '5G operating with a 5G core network',
      B: '5G without a base station',
      C: '5G without radio communication',
      D: '5G using only Wi-Fi',
    },
    answer: 'A',
  },

  {
    id: 15,
    question:
      'What does NSA mean in 5G deployment?',
    options: {
      A: 'New Signal Architecture',
      B: 'Non-Standalone',
      C: 'Network Security Access',
      D: 'Node Service Application',
    },
    answer: 'B',
  },

  {
    id: 16,
    question:
      'What is a gNB in 5G?',
    options: {
      A: 'A 5G radio base station',
      B: 'A type of SIM card',
      C: 'A database',
      D: 'A smartphone processor',
    },
    answer: 'A',
  },

  {
    id: 17,
    question:
      'What is the 5G core commonly called?',
    options: {
      A: '5GC',
      B: '5GD',
      C: '5GS',
      D: '5GN',
    },
    answer: 'A',
  },

  {
    id: 18,
    question:
      'What is latency?',
    options: {
      A: 'The delay before data reaches its destination',
      B: 'The total storage capacity',
      C: 'The number of SIM cards',
      D: 'The size of a display',
    },
    answer: 'A',
  },

  {
    id: 19,
    question:
      'What is throughput?',
    options: {
      A: 'The amount of data successfully transferred over time',
      B: 'The physical size of a router',
      C: 'The number of antennas only',
      D: 'The number of users registered',
    },
    answer: 'A',
  },

  {
    id: 20,
    question:
      'What does bandwidth represent in networking?',
    options: {
      A: 'The range or capacity available for communication',
      B: 'The physical weight of a cable',
      C: 'The number of passwords',
      D: 'The number of processors',
    },
    answer: 'A',
  },

  {
    id: 21,
    question:
      'What is carrier aggregation?',
    options: {
      A: 'Combining multiple carriers to increase available bandwidth',
      B: 'Combining multiple passwords',
      C: 'Combining several SIM cards into one',
      D: 'Combining multiple applications',
    },
    answer: 'A',
  },

  {
    id: 22,
    question:
      'What does QoS stand for?',
    options: {
      A: 'Quality of Service',
      B: 'Quantity of Storage',
      C: 'Queue of Systems',
      D: 'Quality of Security',
    },
    answer: 'A',
  },

  {
    id: 23,
    question:
      'What is a small cell mainly used for?',
    options: {
      A: 'Improving coverage and capacity in localized areas',
      B: 'Replacing every data center',
      C: 'Increasing phone storage',
      D: 'Encrypting files',
    },
    answer: 'A',
  },

  {
    id: 24,
    question:
      'What is a macrocell?',
    options: {
      A: 'A large-area cellular base station',
      B: 'A tiny computer processor',
      C: 'A network password',
      D: 'A type of encryption',
    },
    answer: 'A',
  },

  {
    id: 25,
    question:
      'What is FDD?',
    options: {
      A: 'Frequency Division Duplex',
      B: 'Fast Data Delivery',
      C: 'Frequency Data Device',
      D: 'Full Digital Duplex',
    },
    answer: 'A',
  },

  {
    id: 26,
    question:
      'What is TDD?',
    options: {
      A: 'Time Division Duplex',
      B: 'Transmission Data Directory',
      C: 'Total Digital Device',
      D: 'Time Data Database',
    },
    answer: 'A',
  },

  {
    id: 27,
    question:
      'What is a handover in a cellular network?',
    options: {
      A: 'Moving an active connection from one cell to another',
      B: 'Changing a phone password',
      C: 'Installing an operating system',
      D: 'Deleting network data',
    },
    answer: 'A',
  },

  {
    id: 28,
    question:
      'What is SDN?',
    options: {
      A: 'Software-Defined Networking',
      B: 'Secure Digital Network',
      C: 'System Data Node',
      D: 'Software Device Number',
    },
    answer: 'A',
  },

  {
    id: 29,
    question:
      'What is NFV?',
    options: {
      A: 'Network Functions Virtualization',
      B: 'Network File Verification',
      C: 'New Frequency Value',
      D: 'Network Firewall Version',
    },
    answer: 'A',
  },

  {
    id: 30,
    question:
      'What is MEC?',
    options: {
      A: 'Multi-access Edge Computing',
      B: 'Mobile Encryption Control',
      C: 'Main Ethernet Controller',
      D: 'Memory Execution Core',
    },
    answer: 'A',
  },

  {
    id: 31,
    question:
      'What does IoT stand for?',
    options: {
      A: 'Internet of Things',
      B: 'Internet of Terminals',
      C: 'Input of Technology',
      D: 'Interface of Tools',
    },
    answer: 'A',
  },

  {
    id: 32,
    question:
      'What is VoNR?',
    options: {
      A: 'Voice over New Radio',
      B: 'Video over Network Router',
      C: 'Voice on Network Relay',
      D: 'Virtual Operator Network Routing',
    },
    answer: 'A',
  },

  {
    id: 33,
    question:
      'What is the IPv6 address length?',
    options: {
      A: '32 bits',
      B: '64 bits',
      C: '128 bits',
      D: '256 bits',
    },
    answer: 'C',
  },

  {
    id: 34,
    question:
      'Which protocol provides reliable, connection-oriented data delivery?',
    options: {
      A: 'UDP',
      B: 'TCP',
      C: 'DNS',
      D: 'ARP',
    },
    answer: 'B',
  },

  {
    id: 35,
    question:
      'Which protocol is connectionless?',
    options: {
      A: 'TCP',
      B: 'UDP',
      C: 'HTTPS',
      D: 'FTP',
    },
    answer: 'B',
  },

  {
    id: 36,
    question:
      'What is DNS primarily used for?',
    options: {
      A: 'Converting domain names into IP addresses',
      B: 'Encrypting hard drives',
      C: 'Assigning MAC addresses',
      D: 'Compressing packets',
    },
    answer: 'A',
  },

  {
    id: 37,
    question:
      'What does DHCP provide to network clients?',
    options: {
      A: 'IP configuration',
      B: 'Encryption keys only',
      C: 'CPU instructions',
      D: 'File compression',
    },
    answer: 'A',
  },

  {
    id: 38,
    question:
      'What is NAT used for?',
    options: {
      A: 'Translating between private and public IP addressing',
      B: 'Encrypting passwords',
      C: 'Increasing RAM',
      D: 'Managing application windows',
    },
    answer: 'A',
  },

  {
    id: 39,
    question:
      'What does a router primarily do?',
    options: {
      A: 'Forward packets between networks',
      B: 'Store passwords',
      C: 'Display webpages',
      D: 'Compile source code',
    },
    answer: 'A',
  },

  {
    id: 40,
    question:
      'What does a network switch primarily use to forward Ethernet frames?',
    options: {
      A: 'MAC addresses',
      B: 'Domain names',
      C: 'CPU serial numbers',
      D: 'Password hashes',
    },
    answer: 'A',
  },

  {
    id: 41,
    question:
      'What is ARP used for in IPv4 networks?',
    options: {
      A: 'Mapping an IPv4 address to a MAC address',
      B: 'Mapping a password to a username',
      C: 'Encrypting an IP packet',
      D: 'Assigning a domain name',
    },
    answer: 'A',
  },

  {
    id: 42,
    question:
      'Which device normally separates different IP networks?',
    options: {
      A: 'Router',
      B: 'Hub',
      C: 'Keyboard',
      D: 'Monitor',
    },
    answer: 'A',
  },

  {
    id: 43,
    question:
      'What does HTTPS use to protect web communication?',
    options: {
      A: 'TLS',
      B: 'ARP',
      C: 'DHCP',
      D: 'ICMP',
    },
    answer: 'A',
  },

  {
    id: 44,
    question:
      'What is TLS primarily designed to provide?',
    options: {
      A: 'Secure communication over a network',
      B: 'Faster CPU execution',
      C: 'More RAM',
      D: 'Better screen resolution',
    },
    answer: 'A',
  },

  {
    id: 45,
    question:
      'What is authentication?',
    options: {
      A: 'Verifying an identity',
      B: 'Compressing a file',
      C: 'Routing a packet',
      D: 'Increasing bandwidth',
    },
    answer: 'A',
  },

  {
    id: 46,
    question:
      'What does encryption primarily provide?',
    options: {
      A: 'Confidentiality of information',
      B: 'Higher screen brightness',
      C: 'More storage',
      D: 'Faster typing',
    },
    answer: 'A',
  },

  {
    id: 47,
    question:
      'What does a cryptographic hash function produce?',
    options: {
      A: 'A fixed-size digest',
      B: 'A physical network cable',
      C: 'An IP address',
      D: 'A CPU core',
    },
    answer: 'A',
  },

  {
    id: 48,
    question:
      'What is SHA-256?',
    options: {
      A: 'A cryptographic hash function producing a 256-bit digest',
      B: 'A routing protocol',
      C: 'A wireless standard',
      D: 'A database',
    },
    answer: 'A',
  },

  {
    id: 49,
    question:
      'What is a digital signature primarily used for?',
    options: {
      A: 'Authenticity and integrity verification',
      B: 'Increasing network speed',
      C: 'Assigning IP addresses',
      D: 'Compressing images',
    },
    answer: 'A',
  },

  {
    id: 50,
    question:
      'Which encryption type uses the same secret key for encryption and decryption?',
    options: {
      A: 'Symmetric encryption',
      B: 'Asymmetric encryption',
      C: 'Hashing',
      D: 'Digital signing',
    },
    answer: 'A',
  },

  {
    id: 51,
    question:
      'Which algorithm is a widely used symmetric block cipher?',
    options: {
      A: 'AES',
      B: 'RSA',
      C: 'SHA-256',
      D: 'DNS',
    },
    answer: 'A',
  },

  {
    id: 52,
    question:
      'Which algorithm is commonly associated with public-key cryptography?',
    options: {
      A: 'RSA',
      B: 'AES',
      C: 'SHA-256',
      D: 'CRC',
    },
    answer: 'A',
  },

  {
    id: 53,
    question:
      'What is a public key used for in public-key cryptography?',
    options: {
      A: 'It can be shared publicly for specific cryptographic operations',
      B: 'It must always be kept secret',
      C: 'It is used only as a MAC address',
      D: 'It is the same as a password',
    },
    answer: 'A',
  },

  {
    id: 54,
    question:
      'What is a private key?',
    options: {
      A: 'A secret cryptographic key that must be protected',
      B: 'A public IP address',
      C: 'A network cable',
      D: 'A DNS record',
    },
    answer: 'A',
  },

  {
    id: 55,
    question:
      'Which technology allows two parties to establish a shared secret over an insecure channel?',
    options: {
      A: 'Diffie-Hellman',
      B: 'DHCP',
      C: 'DNS',
      D: 'ARP',
    },
    answer: 'A',
  },

  {
    id: 56,
    question:
      'What is a digital certificate commonly used to bind?',
    options: {
      A: 'An identity to a public key',
      B: 'A MAC address to a switch port only',
      C: 'A password to a router',
      D: 'A file to a folder',
    },
    answer: 'A',
  },

  {
    id: 57,
    question:
      'What does PKI stand for?',
    options: {
      A: 'Public Key Infrastructure',
      B: 'Private Key Interface',
      C: 'Packet Key Internet',
      D: 'Public Kernel Integration',
    },
    answer: 'A',
  },

  {
    id: 58,
    question:
      'Which security property means data has not been altered without authorization?',
    options: {
      A: 'Integrity',
      B: 'Availability',
      C: 'Compression',
      D: 'Routing',
    },
    answer: 'A',
  },

  {
    id: 59,
    question:
      'Which security property focuses on keeping information secret?',
    options: {
      A: 'Confidentiality',
      B: 'Availability',
      C: 'Routing',
      D: 'Addressing',
    },
    answer: 'A',
  },

  {
    id: 60,
    question:
      'Which security property means a service or resource remains accessible when needed?',
    options: {
      A: 'Availability',
      B: 'Confidentiality',
      C: 'Encryption',
      D: 'Hashing',
    },
    answer: 'A',
  },
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

export async function generateQuiz(
  formData: FormData
) {
  const num = Number(
    formData.get('num')
  );

  const attemptedString = String(
    formData.get('attemptedIds') || ''
  );

  const attemptedIds =
    attemptedString
      .split(',')
      .map((value) =>
        Number(value.trim())
      )
      .filter((value) =>
        Number.isInteger(value)
      );

  const parsed =
    quizInputSchema.safeParse({
      num,
      attemptedIds,
    });

  if (!parsed.success) {
    throw new Error(
      'Invalid quiz settings.'
    );
  }

  const {
    num: questionCount,
    attemptedIds: previousIds,
  } = parsed.data;

  const attemptedSet =
    new Set(previousIds);

  let available =
    QUESTION_BANK.filter(
      (question) =>
        !attemptedSet.has(question.id)
    );

  let cycleReset = false;

  if (
    available.length <
    questionCount
  ) {
    available = [...QUESTION_BANK];
    cycleReset = true;
  }

  const selected =
    shuffle(available).slice(
      0,
      questionCount
    );

  const questions =
    selected.map(
      ({
        id,
        question,
        options,
      }) => ({
        id,
        question,
        options,
      })
    );

  const answer_key: Record<
    string,
    string
  > = {};

  selected.forEach((question) => {
    answer_key[
      String(question.id)
    ] = question.answer;
  });

  return {
    questions,
    answer_key,
    cycleReset,
  };
}
