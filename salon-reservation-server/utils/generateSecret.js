const crypto = require('crypto');

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

console.log('🔐 새로운 JWT 시크릿이 생성되었습니다:');
console.log('JWT_SECRET=' + generateJWTSecret());
console.log('\n⚠️ 이 값을 .env 파일에 복사하고, 운영 환경에서는 더 강력한 값으로 교체하세요.');