<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
  font-family: 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, Osaka, 'MS PGothic', arial, helvetica, sans-serif;
  -webkit-appearance: none;
}
html, body,
ul, ol, li,
h1, h2, h3, h4, h5, h6, p,
form, input, div {
  margin: 0;
  padding: 0;
  color: #222;
}
body {
  -webkit-font-smoothing: antialiased;
  background-color: #f7f7f7;
}
ol, ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
input {
  padding: 0;
  border: none;
  border-radius: 0;
  outline: none;
  background: none;
}
textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
}
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
}
a {
  text-decoration: none;
}
a:hover {
  text-decoration: none;
}
a:focus {
  text-decoration: none;
}

html {
  font-size: 16px;
}

.container {
  max-width: 1100px;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: auto;
  margin-right: auto;

  overflow: hidden;
}

.shadow {
  box-shadow: 0 1px 4px 0px rgba(0, 0, 0, .2);
}

.flexbox {
  display: flex;
  width: 100%;
}

a.button {
  display: inline-block;
  position: relative;

  padding: 0.7em 3em;
  margin: 10px 0 13px 0;
  border-radius: 4px;

  box-shadow: 0 3px 0 #c34846;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .3);
  text-align: center;
  font-size: 1.125rem;
  font-weight: bold;
  background-color: #ff5c59;
  color: #fdfdfd;
  transition: 0s;
  cursor: pointer;
}
a.button:hover {
  background-color: #ff6d6a;
  box-shadow: 0 3px 0 #a64f4e;
  transform: none;
}
a.button:active {
  top: 3px;
  box-shadow: none;
}

@media screen and (max-width:600px) {
  html {
    font-size: 14px;
  }
  .container {
    padding: 10px;
  }
}
</style>
