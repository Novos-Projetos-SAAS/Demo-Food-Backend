# Backend - Ambiente DEMO

Esta cópia foi preparada para ser usada em um ambiente de demonstração separado da produção.

> **Importante:** use um banco PostgreSQL/Neon exclusivo para a DEMO. Não aponte `DATABASE_URL` para o banco do cliente em produção.

## Login padrão

- E-mail: `demo@demo.com`
- Senha: `Senhaforte123@`

A senha pode ser alterada no bootstrap com a variável `SEED_DEMO_PASSWORD`.

## Inicialização automática

Ao iniciar a API, `src/database/bootstrapDemo.js` executa migrations pendentes. Em banco vazio, roda todos os seeds existentes. Em banco já inicializado, garante apenas a base adicional da DEMO.

Para desativar, configure `AUTO_SETUP_DEMO=false`.

## Variáveis mínimas

Configure `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` e `NODE_ENV=production`. Veja `.env.example`.

## Dados preservados

Foram mantidos os seeds existentes de métodos de pagamento, permissões/RBAC, tamanhos de marmita, tipos de relatórios e permissões relacionadas aos relatórios.

## Segurança

A chave privada local presente na cópia original foi removida. Caso QZ Tray seja demonstrado, use `QZ_PRIVATE_KEY` como variável de ambiente.
