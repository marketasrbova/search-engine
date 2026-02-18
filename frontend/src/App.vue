<template>
  <input v-model="text"
  @input = "event => text = event.target.value">
  <button @click = "send" >send</button>
  <ul>
    <li  v-for = "d in data" :key = "d.url">
      <a href = "{{ d.url }}" >{{ d.url }}</a>
    </li>
  </ul>
</template>

<script setup>
import * as THREE from "three";
import {ref} from "vue";

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

<style scoped>
</style>
