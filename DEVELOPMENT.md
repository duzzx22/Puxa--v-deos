# Guia de Desenvolvimento

## Como Adicionar Novos Comandos

### 1. Criar o Controller
Crie um novo arquivo em `src/controllers/` seguindo o padrão:

```javascript
/**
 * My Feature Controller
 */
const myService = require('../services/myService');
const { logUserAction } = require('../middlewares/auth');

const handleMyCommand = async (ctx) => {
  const userId = ctx.from?.id;
  logUserAction(ctx, 'MY_COMMAND');

  try {
    // Sua lógica aqui
    const result = await myService.doSomething();
    ctx.reply(result);
  } catch (error) {
    logger.error('My command failed', error);
    ctx.reply('❌ Erro ao processar comando');
  }
};

module.exports = { handleMyCommand };
```

### 2. Criar o Service
Crie um novo arquivo em `src/services/` com a lógica de negócio.

### 3. Registrar o Comando
Em `src/bot.js`, adicione:

```javascript
const { handleMyCommand } = require('./controllers/myController');

bot.command('mycommand', handleMyCommand);
```

## Como Implementar Integrações

1. Leia `src/integrations/README.md`
2. Implemente sua integração em `src/integrations/`
3. Use-a no `videoService.js` ou novo service
4. Adicione a variável de ambiente em `.env.example`

## Estrutura de Logs

```javascript
// Info - informações normais
logger.info('Ação completada', { userId, data });

// Warn - avisos
logger.warn('Número alto de requisições', { count });

// Error - erros
logger.error('Falha na operação', error);

// Debug - info detalhada (development)
logger.debug('Valores da variável', { values });
```

## Boas Práticas

- ✅ Use async/await
- ✅ Valide entradas
- ✅ Implemente retry em APIs externas
- ✅ Limpe arquivos temporários
- ✅ Use logging apropriado
- ✅ Trate erros com mensagens claras
- ✅ Documente com JSDoc
- ✅ Siga a estrutura de diretórios

## Testing

```bash
npm test              # Rodar testes
npm run test:watch   # Watch mode
npm run coverage     # Coverage report
```

## Deploy

### Development
```bash
npm run dev
```

### Production
```bash
NODE_ENV=production npm start
```

### Docker
```bash
docker build -t puxa-bot .
docker run -e BOT_TOKEN=xxx puxa-bot
```
