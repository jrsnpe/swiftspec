# SwiftSpec

<p align="center">
  <img src="./assets/swiftspec-logo.png" alt="SwiftSpec Logo" width="200" height="200">
</p>

<h3 align="center">Rapidez que Esclarece, APIs que Impressionam</h3>

<p align="center">
  Uma ferramenta revolucionária de documentação de API para projetos Node.js e JavaScript.
  <br>
  <a href="#demonstração"><strong>Explore a demonstração »</strong></a>
  <br>
  <br>
  <a href="https://github.com/jrsnpe/swiftspec/issues">Reportar Bug</a>
  ·
  <a href="https://github.com/jrsnpe/swiftspec/issues">Solicitar Feature</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/swiftspec"><img src="https://img.shields.io/npm/v/swiftspec.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/en/"><img src="https://img.shields.io/node/v/swiftspec" alt="Node.js Version"></a>
  <a href="https://www.npmjs.com/package/swiftspec"><img src="https://img.shields.io/npm/dm/swiftspec" alt="Downloads"></a>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
</p>

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Características](#características)
- [Começando](#começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação-e-utilização)
  - [Instalação](#utilização-manual)
  - [Versões Obsoletas](#versões-obsoletas)
- [Contribuindo](#contribuindo)
- [Contato](#contato)

## Sobre o Projeto

SwiftSpec é uma ferramenta de documentação de API projetada para transformar o processo de criação e manutenção de especificações de API. Com foco na eficiência e clareza, SwiftSpec permite que desenvolvedores e equipes técnicas criem documentação de API de alta qualidade em uma fração do tempo tradicional.

## Características

- 🚀 **Geração Rápida**: Crie documentação completa em questão de segundos
- 📚 **Clareza Incomparável**: Transforme códigos complexos em documentação cristalina
- 🎨 **Design Impressionante**: APIs que não só funcionam bem, mas também impressionam visualmente
- 🔄 **Sincronização em Tempo Real**: Atualizações automáticas conforme o código muda
- 🌐 **Suporte Multi-linguagem**: Compatível com várias linguagens e frameworks
- 👥 **Colaboração Integrada**: Facilita o trabalho em equipe na documentação

## Começando

### Pré-requisitos

- Node.js (versão 14.0.0 ou superior)
- npm (normalmente vem com Node.js)

### Instalação e Utilização

```bash
npm install swiftspec
```

ou globalmente:

```bash
npm install -g swiftspec
```

Se a configuração não iniciar automaticamente, você pode executá-la manualmente:

```bash
npx swiftspec configure
```

Se a configuração ficou incorreta, você pode remover e iniciar o processo novamente:

```bash
npx swiftspec unconfigure
```

Gerar a documentação do seu projeto:

```bash
swiftspec generate
```

Iniciar o servidor para visualizar a documentação já existente:

```bash
swiftspec serve
```

Gerar a documentação e iniciar o servidor em um único comando:

```bash
swiftspec start
```

### Utilização Manual

Gerar documentação para um projeto específico:

```bash
swiftspec generate ./meu-diretorio-origem ./meu-diretorio-saida
```

Iniciar o servidor em uma porta específica:

```bash
swiftspec serve ./meu-diretorio-saida 8080
```

Gerar e servir documentação em uma porta específica:

```bash
swiftspec start ./meu-diretorio-saida 8080
```

Para exclusão manual do arquivo de configuração:

- Localize e exclua o arquivo `swiftspec.config.json` na raiz do seu projeto.
- Após remover a configuração, o SwiftSpec usará as configurações padrão em futuras execuções, ou você pode reconfigurar.

## Versões Obsoletas

Recomendamos fortemente que todos os usuários atualizem para a versão mais recente para obter as últimas correções de bugs, melhorias de segurança e novas funcionalidades.

Para atualizar, execute:

```bash
npm install -g swiftspec@latest
```

## Contribuindo

SwiftSpec é um projeto de código aberto e nós adoraríamos contar com a sua ajuda para torná-lo ainda melhor! Há várias maneiras de contribuir:

### Para Desenvolvedores

1. **Código**: Implemente novas features, corrija bugs ou melhore a estrutura do código.
2. **Documentação**: Ajude a melhorar ou traduzir a documentação.
3. **Testes**: Escreva testes para aumentar a cobertura e garantir a estabilidade.
4. **Revisão**: Revise pull requests de outros contribuidores.

### Para Não-Desenvolvedores

1. **Feedback**: Use o SwiftSpec e nos conte sua experiência.
2. **Ideias**: Sugira novas features ou melhorias.
3. **Divulgação**: Compartilhe o SwiftSpec com outros desenvolvedores.
4. **Design**: Contribua com melhorias de UI/UX para a documentação gerada.

Para começar:

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Junte-se a nós e faça parte desta jornada para transformar a forma como documentamos APIs!

## Contato

Temos vários canais para você entrar em contato conosco:

- **Criador do Projeto**: José Reginaldo

  - GitHub: [@jrsnpe](https://github.com/jrsnpe)
  - NPM: [~jrsnpe](https://www.npmjs.com/~jrsnpe)
  - Linkedin: [/in/reginaldo](https://www.linkedin.com/in/reginaldo/)
  - Instagram: [/reginaldoneto](https://www.instagram.com/reginaldoneto/)
  - Email: jrsnpe@gmail.com

- **Equipe de Desenvolvimento**:

  - Faça Parte e tenha seu nome aqui!
  - Email: jrsnpe@gmail.com

- **Suporte**:

  - Email: jrsnpe@gmail.com

- **Repositório do Projeto**: [https://github.com/jrsnpe/swiftspec](https://github.com/jrsnpe/swiftspec)

Fique à vontade para nos contatar. Adoraríamos ouvir suas ideias, feedback ou qualquer pergunta que você possa ter!
Participe das discussões, compartilhe suas experiências e aprenda com outros usuários do SwiftSpec!

```

```
