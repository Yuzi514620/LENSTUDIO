import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("🔍 收到 Authorization Header:", authHeader);

  if (!authHeader) {
    console.log("⚠️ 未提供 Token，允許訪問公開 API");
    req.user = null; // ✅ 未登入時不應該擋住請求
    return next();
  }  
  
  const token = authHeader.split(" ")[1]; // 取得 Token
  // console.log("🔍 解析出的 Token:", token);

  if (!token) {
    console.log("⚠️ Token 格式錯誤，但允許訪問公開 API");
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // 解析 Token
    // console.log("✅ Token 解析成功:", decoded);

    req.decoded = decoded; // ✅ 設定 req.decoded
    req.userId = decoded.id; // ✅ 設定 userId
    req.user = decoded;
    // console.log("✅ 設定 req.userId:", req.userId);

    next(); // 繼續執行下一個 middleware
  } catch (error) {
    console.error("⚠️ Token 解析失敗，設置 req.user 為 null，但不阻擋請求:", error);
    req.user = null; // ✅ 即使 Token 解析失敗，仍允許訪問公開 API
    next();
  }
};

export default authenticate;