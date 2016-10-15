mkdir -p logs
forever start -o logs/stdout.log -e logs/stderr.log -l meme-bot.log -a index.js

