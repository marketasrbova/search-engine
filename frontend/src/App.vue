<template>
  <main>
    <div class = "content-container">
      <div class = "search-bar">
        <input v-model="text"
        @input = "event => text = event.target.value"
        placeholder="search..."
        @keyup.enter="send">
        <button @click = "send" >search</button>
      </div>
      <ul>
        <li  v-for = "d in data" :key = "d.url">
          <a :href = d.url target="_blank" rel="noopener" >{{ formatUrl(d.url) }}</a>
        </li>
      </ul>
    </div>   
  </main>
</template>

<script setup>
import * as THREE from "three";
import {ref} from "vue";

function formatUrl(url){
    const u = new URL(url);
    const hostPath = u.hostname + u.pathname;
    if(hostPath.endsWith("/")){
        return hostPath.slice(0, -1);
    }
    return hostPath;
}

const text = ref("");
const data = ref([]);

const send = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/text", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({text: text.value})
    })
    
    if(!response.ok){
      console.error("Server error:", response.status);
      return
    }
    const result = await response.json();
    console.log("data ", result)
    data.value = result;

  } catch(err) {
    console.error("Fetch error:", err.message);
  }
}
</script>

<style scoped lang="scss">
main{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: rgb(146, 146, 146);
}
.content-container{
  display: flex;
  flex-direction: column;
  padding: 1rem;
  height: 600px;
  width: 500px;
  border: 5px black solid;
  border-radius: 20px;
  overflow-y: scroll;
  background-color: rgb(219, 219, 219);
}
.content-container::-webkit-scrollbar{
  width: 0;
}
.search-bar{
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  position: relative;

  input, button {
  height: 3rem;
  font-size: 1.2rem;
  padding: 0 1.5rem;
  border: 0;
  }
  input{
    width: 100%;
    border-radius: 10px;
  }
  button{
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    background-color: rgb(146, 146, 146);
    border-radius: 0 10px 10px 0;
    cursor: pointer;
  }
}
ul{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin: 2rem 0;

    li{
      width: 90%;
      background-color: white;
      padding: 2rem 1.5rem;
      border-radius: 10px;
      list-style-type: none;

      a{
        text-decoration: none;
        color: rgb(62, 91, 126);
        font-weight: bold;
      }
    }
}
</style>
