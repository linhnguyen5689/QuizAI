// =======================
// SMART LOCAL QUESTION GENERATOR – IT VERSION (NO AI)
// =======================

// --------------------------------------
// 1. Tách câu theo dấu ., ?, !
// --------------------------------------
function splitIntoSentences(text) {
  return text
    .replace(/\n/g, " ")
    .split(/[\.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

// --------------------------------------
// 2. Danh sách thuật ngữ IT để ưu tiên
// --------------------------------------
const IT_KEYWORDS = [
  "algorithm","data","database","dbms","sql","nosql",
  "network","protocol","tcp","udp","ip","http","https",
  "server","client","api","backend","frontend",
  "object","class","method","function","variable",
  "oop","inheritance","polymorphism","encapsulation",
  "compiler","interpreter","runtime","thread","process",
  "operating","system","kernel","memory","stack","queue",
  "model","controller","router","json","encryption",
  "authentication","authorization","session","cookie",
];

// --------------------------------------
// 3. Extract keywords (ưu tiên IT keywords)
// --------------------------------------
function extractKeywords(sentence) {
  const stopWords = [
    "là","và","the","of","a","an","in","to","for","với","của",
    "that","this","from","with","have","has","had","but","not",
    "you","your","their","them","its","are","was","were","into"
  ];

  const words = sentence
    .toLowerCase()
    .replace(/[^a-zA-Z0-9áàảãạâấầẩẫậăắằẳẵặéèẻẽẹíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ ]/g, "")
    .split(" ")
    .filter((w) => w.length > 2 && !stopWords.includes(w));

  const freq = {};

  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;

    // Ưu tiên thuật ngữ IT hơn
    if (IT_KEYWORDS.includes(w)) freq[w] += 3;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((item) => item[0]);
}

// --------------------------------------
// 4. Phân tích Subject – Verb – Object
// --------------------------------------
function parseSentence(sentence) {
  const words = sentence.split(" ");

  const verbs = [
    "is", "are", "was", "were",
    "includes", "contains",
    "describes", "explains", "defines",
    "refers", "represents", "controls"
  ];

  const verb = words.find((w) => verbs.includes(w.toLowerCase())) || null;

  if (!verb) return { subject: null, verb: null, object: null };

  const parts = sentence.split(verb);

  return {
    subject: parts[0].trim(),
    verb,
    object: parts[1]?.trim(),
  };
}

// --------------------------------------
// 5. Bộ câu hỏi dành riêng cho ngành CNTT
// --------------------------------------
function generateITQuestions(keyword, sentence) {
  return [
    {
      question: `What is the role of "${keyword}" in computer science?`,
      options: [
        sentence,
        `"${keyword}" is unrelated to computer systems.`,
        `"${keyword}" is only used in physical hardware.`,
        `"${keyword}" represents an outdated or incorrect concept.`
      ],
      answer: 0
    },
    {
      question: `Which statement best describes "${keyword}" as mentioned in the text?`,
      options: [
        sentence,
        `"${keyword}" performs the opposite function.`,
        `The text does not provide details about "${keyword}".`,
        `"${keyword}" is described as a graphical component.`
      ],
      answer: 0
    },
    {
      question: `In the context of IT, what does "${keyword}" primarily relate to?`,
      options: [
        sentence,
        `"${keyword}" is part of image processing only.`,
        `The text says it is used for UI animation.`,
        `"${keyword}" is unrelated to computing.`
      ],
      answer: 0
    }
  ];
}

// --------------------------------------
// 6. Sinh câu hỏi thông minh từ câu
// --------------------------------------
function generateSmartQuestion(sentence) {
  const keywords = extractKeywords(sentence);
  if (keywords.length === 0) return null;

  const key = keywords[0];

  // Nếu là keyword IT → tạo câu hỏi IT
  if (IT_KEYWORDS.includes(key)) {
    const itQs = generateITQuestions(key, sentence);
    return itQs[Math.floor(Math.random() * itQs.length)];
  }

  // Nếu không phải keyword IT → tạo câu hỏi dạng thường
  const { subject, verb, object } = parseSentence(sentence);

  // Nếu không phân tích được → fallback
  if (!subject || !verb || !object) {
    return {
      question: `What is mentioned about "${key}" in the text?`,
      options: [
        sentence,
        `It is unrelated to the main idea.`,
        `It is incorrectly described.`,
        `The text provides no information about it.`
      ],
      answer: 0,
    };
  }

  return {
    question: `What does the text state about "${key}"?`,
    options: [
      `${subject} ${verb} ${object}`, // đúng
      `The text says the opposite.`,
      `${key} is irrelevant to the content.`,
      `There is no mention of ${key} in the text.`
    ],
    answer: 0,
  };
}

// --------------------------------------
// 7. Sinh nhiều câu hỏi
// --------------------------------------
function generateLocalQuestions(text, numQuestions) {
  const sentences = splitIntoSentences(text);

  const questions = [];
  let index = 0;

  while (questions.length < numQuestions && index < sentences.length) {
    const q = generateSmartQuestion(sentences[index]);
    if (q) questions.push(q);
    index++;
  }

  // Nếu thiếu câu hỏi → thêm câu hỏi tổng quát IT
  while (questions.length < numQuestions) {
    questions.push({
      question: "What is the core concept discussed in this IT-related text?",
      options: [
        "It explains a key computing concept.",
        "It describes unrelated information.",
        "It mentions fictional technology.",
        "It provides no technical relevance."
      ],
      answer: 0,
    });
  }

  return questions;
}

module.exports = { generateLocalQuestions };
