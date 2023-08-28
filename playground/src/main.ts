import { createApp } from 'vue'
import '@unocss/reset/normalize.css'
import './style.css'
import 'monaco-editor-core'
import 'monaco-volar'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')
