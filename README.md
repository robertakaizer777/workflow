# Guia de Configuração: SocialSphere Full-Stack Dashboard

Este projeto agora é uma aplicação **Full-Stack** completa. Ele possui um servidor backend, um banco de dados local (JSON), sistema de login para clientes e integração simulada da API do Instagram (OAuth).

---

## 🛠️ Requisitos de Instalação

Para rodar o servidor local e conectar o banco de dados e APIs, você precisa instalar o **Node.js** em seu computador:

1. Acesse o site oficial: **[https://nodejs.org/](https://nodejs.org/)**
2. Baixe e instale a versão **LTS** recomendada para a maioria dos usuários.
3. A instalação é simples (basta avançar clicando em "Next" até concluir).

---

## 🏃 Como Rodar a Aplicação

Depois de instalar o Node.js:

1. Abra o **Prompt de Comando (CMD)** ou o **PowerShell** no seu computador.
2. Navegue até a pasta do projeto (ou abra o terminal diretamente no diretório do projeto):
   ```bash
   cd "C:\Users\Iverson\.gemini\antigravity\scratch\social-media-dashboard"
   ```
3. Instale as dependências executando o comando:
   ```bash
   npm install
   ```
4. Inicie o servidor backend rodando o comando:
   ```bash
   npm start
   ```
5. O terminal mostrará que o servidor está rodando com sucesso!
6. Abra seu navegador (como o Google Chrome) e acesse o endereço local:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Acesso para Teste

Ao abrir o endereço, o painel redirecionará você para a **Tela de Login**. Use as seguintes credenciais:

### Perfil de Gestor (Admin)
* **E-mail:** `admin@gestor.com`
* **Senha:** `123456`
* *(Este perfil consegue ver todos os clientes do seletor e gerenciar integrações)*

### Perfil de Cliente (NutriLife)
* **E-mail:** `nutrilife@cliente.com`
* **Senha:** `123456`
* *(Este perfil é limitado e só consegue visualizar as métricas de sua própria marca, NutriLife, sem acesso ao seletor de outros clientes)*

---

## 🔗 Fluxo de Integração com o Instagram

1. Faça login como **Gestor** (`admin@gestor.com`).
2. Acesse a aba **Integrações** no menu lateral.
3. Clique em **Conectar Instagram**.
4. Você será redirecionado para a tela que simula a caixa de autorizações da Meta (Facebook).
5. Clique em **Permitir Acesso**.
6. Você retornará ao dashboard com o status atualizado para **🟢 Conectado com sucesso!** e os tokens gravados no banco de dados.
