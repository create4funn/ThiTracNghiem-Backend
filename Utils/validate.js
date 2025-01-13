function isValidInput(input) {
    // Kiểm tra xem đầu vào có chứa ký tự đặc biệt như dấu nháy đơn, dấu chấm phẩy, v.v.
    const dangerousChars = /['"<>%;()&$-]/;
    
    // Kiểm tra đầu vào có chứa các từ khóa SQL nguy hiểm không
    const sqlKeywords = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|ALTER|CREATE|TRUNCATE|UNION|EXEC|SCRIPT|FROM)\b/i;
  
    if (dangerousChars.test(input) || sqlKeywords.test(input)) {
      return false;
    }
    return true;
  }
  
  /**
   * Hàm để validate các tham số đầu vào trước khi truy vấn cơ sở dữ liệu.
   * @param {Object} data - Đối tượng chứa các tham số cần validate.
   * @returns {boolean} - Trả về true nếu tất cả dữ liệu hợp lệ, false nếu có nguy cơ SQL Injection.
   */
  function validateInputs(data) {
    // Kiểm tra từng giá trị trong đối tượng dữ liệu
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (!isValidInput(data[key])) {
          return false; // Nếu bất kỳ giá trị nào không hợp lệ, trả về false
        }
      }
    }
    return true; // Nếu tất cả dữ liệu hợp lệ, trả về true
  }
  
  module.exports = {
    isValidInput,
    validateInputs
  };