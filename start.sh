#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Sisters Salon Reservation 서비스 시작${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if node_modules exist
if [ ! -d "salon-reservation-server/node_modules" ]; then
    echo -e "${RED}❌ Server 의존성이 설치되지 않았습니다. npm install을 실행합니다...${NC}"
    cd salon-reservation-server && npm install && cd ..
fi

if [ ! -d "salon-reservation-client/node_modules" ]; then
    echo -e "${RED}❌ Client 의존성이 설치되지 않았습니다. npm install을 실행합니다...${NC}"
    cd salon-reservation-client && npm install && cd ..
fi

# Function to kill background processes on script exit
cleanup() {
    echo -e "\n${RED}🛑 서비스 종료 중...${NC}"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start server in background
echo -e "${BLUE}📡 Server 시작 중... (포트: 4000)${NC}"
cd salon-reservation-server
npm start &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Start client in background
echo -e "${BLUE}🌐 Client 시작 중... (포트: 3000)${NC}"
cd salon-reservation-client
npm start &
CLIENT_PID=$!
cd ..

echo -e "${GREEN}✅ 모든 서비스가 시작되었습니다!${NC}"
echo -e "${BLUE}📱 Client: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Server: http://localhost:4000${NC}"
echo -e "${BLUE}=================================${NC}"
echo -e "종료하려면 Ctrl+C를 누르세요"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID