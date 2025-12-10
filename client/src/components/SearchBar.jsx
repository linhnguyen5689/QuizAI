import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm quiz..." }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md mx-auto mb-8"
        >
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-12 text-pink-200 bg-indigo-900/50 border-2 border-pink-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-orbitron placeholder-pink-300/50"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-300/50" />
            </div>
        </motion.div>
    );
};

export default SearchBar; 