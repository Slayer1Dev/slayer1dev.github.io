# slayer1dev.github.io

Portfólio pessoal — [slayer1dev.github.io](https://slayer1dev.github.io)

Página única, sem framework e sem build: HTML e CSS escritos à mão, servidos direto pelo GitHub Pages.

## Decisões de design

- **Tema escuro travado**, base off-black com um único accent âmbar. Sem gradiente roxo, sem hero centralizado sobre mesh — os dois clichês mais reconhecíveis de portfólio gerado por IA.
- **Monoespaçada como material de design**, não como decoração. O assunto da página é infraestrutura, então a tipografia utilitária carrega significado.
- **Elemento de assinatura:** um painel que apresenta os sistemas como serviços em execução, com sequência de inicialização animada.
- **Movimento justificado.** A animação de boot comunica inicialização; os indicadores pulsando comunicam estado ativo. Nada anima só por animar, e tudo respeita `prefers-reduced-motion`.

## Acessibilidade

Verificado com medição, não no olho:

| Par | Contraste | Mínimo AA |
|---|---|---|
| Texto principal / fundo | 15.60:1 | 4.5:1 |
| Texto secundário / fundo | 6.90:1 | 4.5:1 |
| Accent / fundo | 8.99:1 | 4.5:1 |
| Texto do botão / accent | 8.77:1 | 4.5:1 |

Também: sem scroll horizontal de 375px a 1440px, nenhum alvo de toque abaixo de 44px, foco visível por teclado em todos os elementos interativos, e link de pular para o conteúdo.

## Rodando local

```bash
python3 -m http.server 4321
```

## Estrutura

```
index.html    markup e conteúdo
style.css     tokens, layout e movimento
```

## Licença

[MIT](LICENSE)
