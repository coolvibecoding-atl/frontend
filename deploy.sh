#!/bin/bash
cd /Users/coolvibecoding/Desktop/AI_Mixer_Pro
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
vercel deploy --prod --yes
