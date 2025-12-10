import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaBrain, FaChartLine, FaLightbulb } from "react-icons/fa";

const BlogList = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Mastering Quiz Creation: A Comprehensive Guide",
      description:
        "Learn the art of creating engaging and effective quizzes that challenge and educate your audience. Discover proven techniques and best practices.",
      link: "#",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
      category: "Quiz Creation",
      date: "March 15, 2024",
      icon: <FaLightbulb className="w-6 h-6" />
    },
    {
      id: 2,
      title: "The Psychology Behind Effective Quizzing",
      description:
        "Explore how the human brain processes and retains information through quizzes. Understand the science of learning and memory retention.",
      link: "#",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      category: "Learning Science",
      date: "March 10, 2024",
      icon: <FaBrain className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Measuring Success: Quiz Analytics and Insights",
      description:
        "Dive into the world of quiz analytics and learn how to interpret results to improve learning outcomes and engagement.",
      link: "#",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Analytics",
      date: "March 5, 2024",
      icon: <FaChartLine className="w-6 h-6" />
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  return (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogPosts.map((post) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="group relative overflow-hidden transition-all duration-500 bg-white rounded-2xl shadow-lg hover:shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500 transform group-hover:scale-110"
                  loading="lazy"
                />
                <motion.div 
                  className="absolute top-4 left-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="flex items-center px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
                    {post.icon}
                    <span className="ml-2">{post.category}</span>
                  </span>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-2 text-sm text-gray-500">
                  <span>{post.date}</span>
                </div>
                <motion.h3 
                  className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-indigo-600"
                  whileHover={{ scale: 1.02 }}
                >
                  {post.title}
                </motion.h3>
                <p className="mb-4 text-gray-600 line-clamp-2">
                  {post.description}
                </p>
                <motion.a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={post.link}
                  className="inline-flex items-center font-medium text-indigo-600 transition-colors duration-300 group-hover:text-indigo-700"
                  whileHover={{ x: 5 }}
                >
                  Read More
                  <FaArrowRight className="ml-2 transition-transform duration-300 transform group-hover:translate-x-1" />
                </motion.a>
              </div>

              {/* Hover Effect */}
              <motion.div 
                className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100"
                whileHover={{ scale: 1.02 }}
              />
            </motion.article>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 font-medium text-white transition-all duration-300 transform rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
          >
            Explore More Articles
            <FaArrowRight className="ml-2" />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogList;
