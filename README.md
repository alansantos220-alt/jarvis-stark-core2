# J.A.R.V.I.S. Stark Core — OpenRouter Free

## Render

1. Substitua os arquivos do projeto pelos arquivos desta pasta.
2. No Render, configure:
   - `OPENROUTER_API_KEY` = sua chave do OpenRouter
   - `APP_URL` = endereço público do seu J.A.R.V.I.S. (opcional)
3. Build/Install: `npm install`
4. Start: `npm start`

O projeto não usa Gemini nem `@google/generative-ai`.

## Modelo

O backend usa `openrouter/free`, que seleciona automaticamente um modelo gratuito disponível no OpenRouter.

## Voz

A voz é feita pelo Speech Synthesis do navegador. O painel permite:
- escolher voz disponível;
- acelerar/desacelerar;
- ativar/desativar voz;
- testar voz.

A voz exata disponível depende das vozes instaladas no celular/computador. O projeto não inclui nem clona uma gravação específica de personagem.

## Celular

O layout é responsivo e pode ser adicionado à tela inicial como aplicativo pelo navegador.
