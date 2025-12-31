# Guia de Configuração do Google Drive API

Este documento fornece instruções passo a passo para configurar a integração com o Google Drive API no website do Centro Cultural do Monte de Vez.

## Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Criar um Projeto no Google Cloud](#passo-1-criar-um-projeto-no-google-cloud)
4. [Passo 2: Ativar a Google Drive API](#passo-2-ativar-a-google-drive-api)
5. [Passo 3: Criar uma Chave API](#passo-3-criar-uma-chave-api)
6. [Passo 4: Restringir a Chave API](#passo-4-restringir-a-chave-api)
7. [Passo 5: Preparar a Pasta do Google Drive](#passo-5-preparar-a-pasta-do-google-drive)
8. [Passo 6: Obter o ID da Pasta](#passo-6-obter-o-id-da-pasta)
9. [Passo 7: Configurar o Website](#passo-7-configurar-o-website)
10. [Passo 8: Testar a Integração](#passo-8-testar-a-integração)
11. [Resolução de Problemas](#resolução-de-problemas)
12. [Boas Práticas de Segurança](#boas-práticas-de-segurança)

---

## Visão Geral

Esta integração permite que o website exiba automaticamente ficheiros de uma pasta pública do Google Drive, eliminando a necessidade de fazer upload manual dos ficheiros para o servidor web.

**Vantagens:**
- Atualização fácil de ficheiros (basta adicionar/remover na pasta do Drive)
- Sem necessidade de editar código HTML
- Armazenamento gratuito no Google Drive
- Ficheiros sempre acessíveis

---

## Pré-requisitos

- Uma conta Google (Gmail)
- Acesso ao Google Cloud Console
- Permissões para criar projetos no Google Cloud
- Os ficheiros organizados numa pasta do Google Drive

---

## Passo 1: Criar um Projeto no Google Cloud

1. Aceda ao [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com a sua conta Google
3. No canto superior esquerdo, clique em **"Selecionar um projeto"**
4. Clique em **"NOVO PROJETO"**
5. Preencha os detalhes:
   - **Nome do projeto:** `ccmv-website` (ou outro nome à sua escolha)
   - **Organização:** deixe o padrão (se aplicável)
6. Clique em **"CRIAR"**
7. Aguarde alguns segundos até o projeto ser criado
8. Certifique-se de que o novo projeto está selecionado no seletor de projetos

---

## Passo 2: Ativar a Google Drive API

1. No Google Cloud Console, com o projeto selecionado
2. No menu lateral esquerdo, vá para **"APIs e serviços"** → **"Biblioteca"**
3. Na barra de pesquisa, digite `Google Drive API`
4. Clique em **"Google Drive API"** nos resultados
5. Clique no botão **"ATIVAR"**
6. Aguarde a ativação da API (alguns segundos)

---

## Passo 3: Criar uma Chave API

1. No menu lateral, vá para **"APIs e serviços"** → **"Credenciais"**
2. Clique em **"+ CRIAR CREDENCIAIS"** no topo da página
3. Selecione **"Chave de API"**
4. Uma chave será criada e exibida numa janela pop-up
5. **IMPORTANTE:** Copie a chave e guarde-a num local seguro (vamos usá-la no Passo 7)
6. A chave terá um formato semelhante a: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
7. **NÃO FECHE** a janela ainda - vamos restringir a chave no próximo passo

---

## Passo 4: Restringir a Chave API

**IMPORTANTE:** Por segurança, deve restringir a chave API para evitar uso não autorizado.

### 4.1 Restringir por Aplicação (HTTP referrers)

1. Na janela da chave criada (ou em "Credenciais" → clique na chave)
2. Em **"Restrições de aplicativo"**, selecione **"Referenciadores HTTP (sites)"**
3. Clique em **"ADICIONAR UM ITEM"**
4. Adicione os seguintes referenciadores (um por linha):
   ```
   http://localhost/*
   https://seudominio.com/*
   https://www.seudominio.com/*
   ```
   **Nota:** Substitua `seudominio.com` pelo domínio real do website
5. Se usar GitHub Pages, adicione também:
   ```
   https://seuusuario.github.io/*
   ```

### 4.2 Restringir por API

1. Em **"Restrições de API"**, selecione **"Restringir chave"**
2. Na lista suspensa, selecione **"Google Drive API"**
3. Clique em **"GUARDAR"** no fundo da página

**Nota:** As restrições podem demorar alguns minutos a ter efeito.

---

## Passo 5: Preparar a Pasta do Google Drive

### 5.1 Criar/Organizar a Pasta

1. Aceda ao [Google Drive](https://drive.google.com/)
2. Crie uma nova pasta ou use uma existente
3. Nome sugerido: `CCMV - Documentos Públicos`
4. Organize os ficheiros dentro da pasta:
   - Estatutos da Associação
   - Atas de Assembleias
   - Relatórios de Atividades
   - Pareceres do Conselho Fiscal
   - Contas do Exercício
   - Outros documentos relevantes

### 5.2 Tornar a Pasta Pública

**ATENÇÃO:** Certifique-se de que APENAS documentos públicos estão nesta pasta!

1. Clique com o botão direito na pasta
2. Selecione **"Partilhar"** ou **"Share"**
3. No canto inferior direito, clique em **"Alterar"** junto a "Restrito"
4. Selecione **"Qualquer pessoa com o link"**
5. Certifique-se de que a permissão está definida como **"Visualizador"**
6. Clique em **"Concluído"**

**Dica:** Subpastas dentro da pasta principal também serão exibidas no website (até 2 níveis de profundidade).

---

## Passo 6: Obter o ID da Pasta

1. No Google Drive, abra a pasta que tornou pública
2. Observe o URL no navegador. Terá este formato:
   ```
   https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P
   ```
3. O ID da pasta é a parte após `/folders/`:
   ```
   1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P
   ```
4. **Copie este ID** - vamos usá-lo no próximo passo

---

## Passo 7: Configurar o Website

1. Abra o ficheiro `js/config.js` no editor de código
2. Localize estas linhas:
   ```javascript
   folderId: 'YOUR_FOLDER_ID_HERE',
   ```
   E substitua `YOUR_FOLDER_ID_HERE` pelo ID copiado no Passo 6

3. Localize:
   ```javascript
   apiKey: 'YOUR_API_KEY_HERE'
   ```
   E substitua `YOUR_API_KEY_HERE` pela chave API copiada no Passo 3

4. O ficheiro final deve ficar assim:
   ```javascript
   const DRIVE_CONFIG = {
       folderId: '1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P',
       apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
   };
   ```

5. **Guarde o ficheiro**

---

## Passo 8: Testar a Integração

### 8.1 Teste Local

1. Abra o ficheiro `index.html` num navegador web
2. Role até à secção "Ficheiros e Documentos"
3. Deve ver:
   - Uma mensagem de carregamento breve
   - Depois, a lista de ficheiros da pasta do Google Drive
   - Ficheiros ordenados alfabeticamente (pastas primeiro)
   - Ícones apropriados para cada tipo de ficheiro

### 8.2 Testar Links

1. Clique num ficheiro da lista
2. Deve abrir numa nova aba
3. O ficheiro deve ser exibido no visualizador do Google Drive

### 8.3 Verificar a Consola do Navegador

1. Abra as Ferramentas de Programador (F12)
2. Vá para a aba "Console"
3. Deve ver uma mensagem como:
   ```
   ✓ X ficheiros carregados do Google Drive
   ```
4. Se houver erros, consulte a secção [Resolução de Problemas](#resolução-de-problemas)

---

## Resolução de Problemas

### Erro 403: "Permissão negada"

**Causas possíveis:**
- A chave API não está correta
- A pasta não é pública
- As restrições da chave API não incluem o domínio

**Soluções:**
1. Verifique se copiou a chave API corretamente
2. Certifique-se de que a pasta está configurada como "Qualquer pessoa com o link"
3. Verifique as restrições HTTP referrers no Google Cloud Console
4. Aguarde 5-10 minutos após alterar restrições (podem demorar a ter efeito)

### Erro 404: "Pasta não encontrada"

**Causas possíveis:**
- O ID da pasta está incorreto
- A pasta foi eliminada

**Soluções:**
1. Verifique se copiou o ID completo da pasta do URL
2. Teste abrir o URL da pasta no navegador: `https://drive.google.com/drive/folders/SEU_ID_AQUI`

### Erro 400: "Pedido inválido"

**Causas possíveis:**
- ID da pasta com formato incorreto
- Caracteres especiais no ID

**Soluções:**
1. Copie novamente o ID diretamente do URL do Google Drive
2. Certifique-se de que não há espaços antes ou depois do ID no config.js

### Mensagem: "Google Drive API não configurado"

**Causa:**
- Os valores em config.js ainda são os placeholders padrão

**Solução:**
1. Verifique se substituiu `YOUR_FOLDER_ID_HERE` e `YOUR_API_KEY_HERE`
2. Certifique-se de que guardou o ficheiro config.js

### Nenhum ficheiro é exibido

**Causas possíveis:**
- A pasta está vazia
- Os ficheiros estão no "Lixo" do Google Drive
- JavaScript está desativado no navegador

**Soluções:**
1. Verifique se há ficheiros na pasta do Drive
2. Verifique o "Lixo" no Google Drive e restaure ficheiros se necessário
3. Ative JavaScript no navegador
4. Verifique a consola do navegador (F12) para mensagens de erro

### Erro de CORS

**Causa:**
- Abrindo o ficheiro HTML diretamente (file://) em vez de através de um servidor

**Solução:**
1. Use um servidor web local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (npx)
   npx http-server
   ```
2. Aceda a `http://localhost:8000` no navegador

---

## Boas Práticas de Segurança

### 1. Nunca Partilhe a Chave API Publicamente

- **NÃO** faça commit da chave API para repositórios públicos (GitHub, GitLab, etc.)
- **NÃO** publique a chave em fóruns ou redes sociais
- Se a chave for exposta acidentalmente, **revogue-a imediatamente** no Google Cloud Console e crie uma nova

### 2. Use Restrições de API

- Sempre restrinja a chave por HTTP referrers (domínios permitidos)
- Restrinja a chave apenas para Google Drive API
- Não use a mesma chave para outros projetos

### 3. Monitorize o Uso

- Aceda regularmente ao Google Cloud Console
- Verifique a secção "APIs e serviços" → "Dashboard"
- Monitorize chamadas à API e eventuais erros
- Configure alertas de quota se necessário

### 4. Controle de Acessos à Pasta

- Use uma pasta dedicada apenas para ficheiros públicos
- **NÃO** coloque ficheiros sensíveis ou privados nesta pasta
- Revise periodicamente os ficheiros na pasta
- Considere usar uma conta Google separada apenas para ficheiros públicos

### 5. Limite de Quota

O Google Drive API tem quotas gratuitas generosas:
- 1.000 requisições por 100 segundos por utilizador
- 10.000 requisições por dia por projeto

Para um website institucional, estes limites são mais do que suficientes. Se necessário, pode implementar cache no lado do cliente.

### 6. Versionamento e Backup

- Mantenha backups dos ficheiros importantes
- Use o versionamento do Google Drive para rastrear alterações
- Documente as alterações feitas na pasta

### 7. Configuração em Ambiente de Produção

Se usar controlo de versão (Git):

1. **Opção A:** Arquivo `.env` ou similar (não comitado)
   ```javascript
   // Não comitar config.js com valores reais
   // Manter um config.example.js com placeholders
   ```

2. **Opção B:** Configuração no servidor
   - Injete as variáveis durante o deploy
   - Use variáveis de ambiente

3. Adicione ao `.gitignore`:
   ```
   js/config.js
   ```

4. Mantenha um ficheiro de exemplo:
   ```
   js/config.example.js
   ```

---

## Suporte Adicional

Se tiver problemas não cobertos neste guia:

1. **Documentação Oficial:**
   - [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
   - [Autenticação API Key](https://cloud.google.com/docs/authentication/api-keys)

2. **Console de Desenvolvedores:**
   - Verifique logs de erro no Google Cloud Console
   - Use a consola do navegador (F12) para debug

3. **Comunidade:**
   - Stack Overflow (tag: `google-drive-api`)
   - Fóruns da Comunidade Google Cloud

---

## Conclusão

Após seguir todos os passos, o website deve exibir automaticamente os ficheiros da pasta do Google Drive. Qualquer alteração (adicionar, remover, renomear ficheiros) na pasta será refletida automaticamente no website assim que a página for recarregada.

**Lembre-se:**
- Mantenha a chave API segura
- Use restrições apropriadas
- Apenas coloque ficheiros públicos na pasta
- Monitorize o uso regularmente

Boa sorte! 🚀
