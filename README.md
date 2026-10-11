# Lucas Barbosa — Portfólio

Sou analista de ecommerce e desenvolvedor. Construo sistemas para conectar marketplaces, organizar operações e transformar processos em ferramentas.

**[Acesse meu portfólio →](https://slayer1dev.github.io/)**

## Sobre o projeto

Meu portfólio apresenta minha experiência e meus projetos públicos em uma narrativa por rolagem. A identidade visual combina grafite, verde ácido, tipografia condensada e uma escultura procedural em WebGL.

O agent-board é o projeto em destaque. A demonstração percorre oito capítulos: quadros independentes, seleção de projeto, sessões de IA, compartilhamento de contexto, criação de tarefa, continuidade entre sessões, execução e conclusão.

## Projetos públicos

- **[agent-board](https://github.com/Slayer1Dev/agent-board)** — quadro compartilhado por pessoas e agentes de IA, com MCP, API REST, CLI e histórico com autoria.
- **[Arquivo Seguro](https://github.com/Slayer1Dev/arquivo-seguro)** — extensão de navegador que alerta sobre extensões disfarçadas em downloads e anexos.
- **[claude-skills](https://github.com/Slayer1Dev/claude-skills)** — instruções reutilizáveis para organizar o trabalho com agentes de IA.

## Desenvolvimento

HTML, CSS e JavaScript, sem framework ou instalação de dependências. As fontes ficam em `assets/`, acompanhadas das licenças.

Servidor local:

```sh
python -m http.server 4178
```

Endereço local: `http://localhost:4178/`.

| Arquivo | Função |
| --- | --- |
| `index.html` | Conteúdo e composição |
| `style.css` | Identidade visual e adaptação de telas |
| `sculpture.js` | Escultura WebGL e alternativa CSS |
| `showcase.js` | Narrativa visual do agent-board |
| `app.js` | Navegação, capítulos e fichas dos projetos |

## Motion e acessibilidade

Rolagem nativa, layout responsivo e controles para escolher os capítulos. O movimento respeita a preferência do sistema e pode ser reduzido manualmente.

Os quadros, sessões e tarefas da demonstração são ilustrativos. O site não se conecta a contas, agentes ou dados privados.

## Hospedagem

Publicado no GitHub Pages. Atualizações na branch `main` atualizam o site automaticamente. O arquivo `.nojekyll` mantém os arquivos estáticos sem processamento Jekyll.
