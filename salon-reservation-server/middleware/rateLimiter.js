const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// 로그인 전용 Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 5회 시도
  message: {
    error: '로그인 시도 횟수가 초과되었습니다. 15분 후 다시 시도해주세요.',
    retryAfter: '15 minutes',
    remainingAttempts: 0
  },
  standardHeaders: true, // Rate limit 정보를 `RateLimit-*` 헤더로 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  skipSuccessfulRequests: false, // 모든 요청을 카운터에 포함
  keyGenerator: (req) => {
    // IPv6 호환 IP + User-Agent로 더 정확한 식별
    return ipKeyGenerator(req) + ':' + (req.get('User-Agent') || '');
  },
  // 커스텀 응답 메시지
  handler: (req, res) => {
    const msBeforeNext = req.rateLimit.msBeforeNext || req.rateLimit.resetTime - Date.now();
    const minutesLeft = Math.ceil(Math.max(msBeforeNext, 0) / (1000 * 60));
    
    res.status(429).json({
      error: `로그인 시도 횟수가 초과되었습니다. ${minutesLeft}분 후 다시 시도해주세요.`,
      retryAfter: `${minutesLeft} minutes`,
      totalHits: req.rateLimit.totalHits,
      limit: req.rateLimit.limit
    });
  }
});

// 회원가입 전용 Rate Limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // IP당 3회 회원가입
  message: {
    error: '회원가입 시도 횟수가 초과되었습니다. 1시간 후 다시 시도해주세요.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req) + ':register';
  },
  handler: (req, res) => {
    const msBeforeNext = req.rateLimit.msBeforeNext || req.rateLimit.resetTime - Date.now();
    const minutesLeft = Math.ceil(Math.max(msBeforeNext, 0) / (1000 * 60));
    
    res.status(429).json({
      error: `회원가입 시도 횟수가 초과되었습니다. ${minutesLeft}분 후 다시 시도해주세요.`,
      retryAfter: `${minutesLeft} minutes`,
      totalHits: req.rateLimit.totalHits,
      limit: req.rateLimit.limit
    });
  }
});

// 일반 API 전용 Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // IP당 100회 요청
  message: {
    error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  },
  handler: (req, res) => {
    const msBeforeNext = req.rateLimit.msBeforeNext || req.rateLimit.resetTime - Date.now();
    const secondsLeft = Math.ceil(Math.max(msBeforeNext, 0) / 1000);
    
    res.status(429).json({
      error: `API 요청 한도를 초과했습니다. ${secondsLeft}초 후 다시 시도해주세요.`,
      retryAfter: `${secondsLeft} seconds`,
      totalHits: req.rateLimit.totalHits,
      limit: req.rateLimit.limit
    });
  }
});

// 관리자 체크 전용 Rate Limiter (더 관대한 설정)
const adminCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // IP당 30회 요청 (페이지 로딩 시 자주 호출되므로)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req) + ':admin-check';
  }
});

module.exports = {
  loginLimiter,
  apiLimiter, 
  registerLimiter,
  adminCheckLimiter
};