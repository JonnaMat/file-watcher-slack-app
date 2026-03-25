export $(grep -v '^#' .env | xargs)
npm start