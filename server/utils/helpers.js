/**
 * Tạo mã phòng ngẫu nhiên gồm 6 ký tự (chữ cái và số)
 * @returns {string} 
 */
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  }

  /**
 * Định dạng ngày tháng
 * @param {Date} 
 * @returns {string} 
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
 * Tính toán khoảng thời gian giữa hai ngày
 * @param {Date} Ngày bắt đầu
 * @param {Date} Ngày kết thúc
 * @returns {number} Khoảng thời gian tính bằng giây
 */
function calculateTimeDifference(startDate, endDate) {
  return Math.floor((endDate - startDate) / 1000);
}

/**
 * Xác thực Email
 * @param {string} 
 * @returns {boolean} 
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Tạo chuỗi ngẫu nhiên
 * @param {number} Độ dài chuỗi mong muốn
 * @returns {string} 
 */
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Định dạng số thành phần trăm
 * @param {number} value - Giá trị cần định dạng
 * @param {number} total - Tổng số để tính phần trăm
 * @returns {string} 
 */
function formatPercentage(value, total) {
  return `${Math.round((value / total) * 100)}%`;
}

module.exports = {
  generateRoomCode,
  formatDate,
  calculateTimeDifference,
  isValidEmail,
  generateRandomString,
  formatPercentage
}; 