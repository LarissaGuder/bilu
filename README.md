# Bilu

Esse projeto um dia ainda terá grandes funcionalidades utilizando a API do Spotify. Ainda não temos um bom nome para ele.

## v1 :: Shrekness
A nossa primeira funcionalidade é uma análise nas suas últimas 50 músicas reproduzidas. Com base nela, a gente avalia a propriedade `valence`, presente em cada música existente no spotify. Essa propriedade diz o quão triste ou alegre a música é. A escala vai de 0 a 1. 
Para ter como exemplo, a música Creep do RadioHead tem `0.104`. Já a música All Star do Smash Mouth tem `0.776`.

Com base em temperamentos do Shrek durante o primeiro filme, foi feito um rank dos estados de espírito do Shrek com base no atributo `valence` das músicas ouvidas recentemente.

Para rodar o projeto, crie um arquivo `.env`, cos atributos presentes no `.env-example`, e basta rodar o `npm start`.