import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative border-t border-pink-400/20 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bg-yellow-400/10 rounded-full opacity-50 -top-40 -right-40 w-80 h-80 blur-3xl" />
        <div className="absolute bg-pink-400/10 rounded-full opacity-50 -bottom-40 -left-40 w-80 h-80 blur-3xl" />
      </div>

      <div className="container relative px-4 py-16 mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
              CTEWhiz
            </h3>
            <p className="leading-relaxed text-pink-200/80 font-orbitron">
              Empowering educators and students with AI-powered quiz creation
              and assessment tools.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-200/60 transition-all duration-300 rounded-lg hover:bg-yellow-400/10 hover:text-yellow-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFacebook size={20} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-200/60 transition-all duration-300 rounded-lg hover:bg-yellow-400/10 hover:text-yellow-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-200/60 transition-all duration-300 rounded-lg hover:bg-yellow-400/10 hover:text-yellow-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLinkedin size={20} />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-200/60 transition-all duration-300 rounded-lg hover:bg-yellow-400/10 hover:text-yellow-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaInstagram size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-pink-200 font-orbitron">Quick Links</h4>
            <ul className="space-y-3">
              {["About Us", "Features", "Pricing", "Contact"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="transition-colors"
                >
                  <a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="flex items-center text-pink-200/60 hover:text-yellow-400 font-orbitron"
                  >
                    <span className="w-1.5 h-1.5 mr-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-pink-200 font-orbitron">Resources</h4>
            <ul className="space-y-3">
              {["Blog", "Documentation", "Support", "FAQ"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="transition-colors"
                >
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="flex items-center text-pink-200/60 hover:text-yellow-400 font-orbitron"
                  >
                    <span className="w-1.5 h-1.5 mr-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-pink-200 font-orbitron">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaEnvelope className="w-5 h-5 mt-1 text-yellow-400" />
                <span className="text-pink-200/60 font-orbitron">support@ctequiz.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaPhone className="w-5 h-5 mt-1 text-yellow-400" />
                <span className="text-pink-200/60 font-orbitron">+84 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 mt-1 text-yellow-400" />
                <span className="text-pink-200/60 font-orbitron">
                  123 Nguyen van linh
                  <br />
                  Vietnam, Da Nang
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl p-8 mx-auto mt-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40"
        >
          <div className="text-center">
            <h4 className="mb-2 text-xl font-semibold text-pink-200 font-orbitron">
              Subscribe to Our Newsletter
            </h4>
            <p className="mb-6 text-pink-200/60 font-orbitron">
              Stay updated with the latest features and educational resources
            </p>
            <form className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-pink-200 border border-pink-400/40 bg-indigo-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-orbitron placeholder-pink-200/40"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 hover:from-pink-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 font-orbitron"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-8 mt-12 text-center border-t border-pink-400/20"
        >
          <p className="text-pink-200/60 font-orbitron">
            &copy; {new Date().getFullYear()} CTEWhiz. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
