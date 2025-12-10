import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { FaQuestionCircle, FaCheckCircle } from "react-icons/fa";

const faqs = [
  {
    question: "What types of quizzes can I create?",
    answer:
      "You can create various types of quizzes including multiple choice, true/false, fill in the blanks, matching, and short answer questions. Each type can be customized with images, videos, and other media to make your quizzes more engaging.",
    category: "Quiz Types"
  },
  {
    question: "How can I track quiz performance?",
    answer:
      "Our platform provides comprehensive analytics including completion rates, average scores, time taken, and detailed breakdowns of individual question performance. You can export these reports in various formats for further analysis.",
    category: "Analytics"
  },
  {
    question: "Can I customize the quiz appearance?",
    answer:
      "Yes, you can fully customize your quiz's appearance including colors, fonts, layouts, and branding elements. You can also add your logo, custom backgrounds, and choose from various themes to match your brand identity.",
    category: "Customization"
  },
  {
    question: "How do I share my quizzes?",
    answer:
      "You can share your quizzes through direct links, embed them on your website, or share them on social media. You can also set up email invitations and track who has accessed your quizzes.",
    category: "Sharing"
  },
  {
    question: "What security features are available?",
    answer:
      "We offer multiple security features including password protection, time limits, IP restrictions, and anti-cheating measures. You can also set up user authentication and track quiz attempts.",
    category: "Security"
  },
  {
    question: "Can I import questions from other sources?",
    answer:
      "Yes, you can import questions from various formats including CSV, Excel, and text files. You can also copy questions from other quizzes or use our question bank to quickly create new quizzes.",
    category: "Import/Export"
  },
  {
    question: "How do I analyze quiz results?",
    answer:
      "Our platform provides detailed analytics including score distributions, question difficulty analysis, and participant performance metrics. You can generate custom reports and export data for further analysis.",
    category: "Analysis"
  },
  {
    question: "What support options are available?",
    answer:
      "We offer 24/7 support through live chat, email, and phone. Our knowledge base includes detailed guides, video tutorials, and best practices. We also provide regular updates and new features.",
    category: "Support"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function FaqSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="max-w-4xl mx-auto"
    >
      <Accordion type="multiple" className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <AccordionItem
              value={`item-${index}`}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm"
            >
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                <div className="flex items-center gap-3">
                  <FaQuestionCircle className="w-5 h-5 text-indigo-600" />
                  <span>{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="mb-2">{faq.answer}</p>
                    <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
                      {faq.category}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600">
          Still have questions?{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Contact our support team
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
