<template>
  <div class="ai-chatbot">
    <!-- Floating Action Button -->
    <button
      class="chat-fab"
      :class="{ 'is-open': isOpen, 'is-listening': isListening }"
      @click="toggleChat"
      :aria-label="isOpen ? t('chatbot.close') : t('chatbot.open')"
      :aria-expanded="isOpen"
    >
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
        <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
        <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
      <span class="fab-pulse" v-if="!isOpen && hasNewMessage"></span>
    </button>

    <!-- Chat Panel -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="chat-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('chatbot.title')"
        @keydown.escape="closeChat"
      >
        <!-- Header -->
        <div class="chat-header">
          <div class="header-left">
            <div class="bot-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="3"></circle>
                <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
                <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
              </svg>
            </div>
            <div class="header-info">
              <h3>{{ t('chatbot.title') }}</h3>
              <span class="status">{{ t('chatbot.online') }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button
              class="header-btn"
              :class="{ 'is-active': ttsEnabled }"
              @click="toggleTTS"
              :aria-label="t('chatbot.toggleTTS')"
              :aria-pressed="ttsEnabled"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path v-if="ttsEnabled" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path v-if="ttsEnabled" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <line v-if="!ttsEnabled" x1="23" y1="9" x2="17" y2="15"></line>
                <line v-if="!ttsEnabled" x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>
            <button
              class="header-btn"
              :class="{ 'is-active': highContrast }"
              @click="toggleHighContrast"
              :aria-label="t('chatbot.highContrast')"
              :aria-pressed="highContrast"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v20" fill="currentColor"></path>
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor"></path>
              </svg>
            </button>
            <button
              class="header-btn close-btn"
              @click="closeChat"
              :aria-label="t('chatbot.close')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="chat-messages"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.type]"
          >
            <div v-if="msg.type === 'bot'" class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="3"></circle>
              </svg>
            </div>
            <div class="message-content">
              <p>{{ msg.text }}</p>
              <span class="message-time">{{ formatTime(msg.time) }}</span>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message bot typing">
            <div class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="3"></circle>
              </svg>
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" v-if="messages.length <= 1">
          <button
            v-for="action in quickActions"
            :key="action.key"
            class="quick-action"
            @click="sendQuickAction(action.query)"
          >
            {{ action.label }}
          </button>
        </div>

        <!-- Input Area -->
        <div class="chat-input">
          <button
            class="mic-btn"
            :class="{ 'is-listening': isListening }"
            @click="toggleVoiceInput"
            :aria-label="isListening ? t('chatbot.stopListening') : t('chatbot.startListening')"
            :disabled="!speechSupported"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span v-if="isListening" class="listening-pulse"></span>
          </button>
          <input
            ref="inputField"
            v-model="userInput"
            type="text"
            :placeholder="isListening ? t('chatbot.listening') : t('chatbot.placeholder')"
            @keyup.enter="sendMessage"
            :aria-label="t('chatbot.inputLabel')"
            :disabled="isListening"
          />
          <button
            class="send-btn"
            @click="sendMessage"
            :disabled="!userInput.trim() || isTyping"
            :aria-label="t('chatbot.send')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Screen Reader Announcements -->
    <div class="sr-only" role="status" aria-live="assertive">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { search as searchApi, utils as dspaceUtils } from '@/services/dspace'

const { t, locale } = useI18n()

// Emits
const emit = defineEmits(['search', 'filter'])

// State
const isOpen = ref(false)
const userInput = ref('')
const messages = ref([])
const isTyping = ref(false)
const isListening = ref(false)
const ttsEnabled = ref(false)
const highContrast = ref(false)
const hasNewMessage = ref(false)
const announcement = ref('')
const messagesContainer = ref(null)
const inputField = ref(null)

// Speech Recognition
let recognition = null
const speechSupported = ref(false)

// Quick Actions
const quickActions = computed(() => [
  { key: 'recent', label: t('chatbot.quickRecent'), query: 'show recent items' },
  { key: 'theses', label: t('chatbot.quickTheses'), query: 'find theses' },
  { key: 'help', label: t('chatbot.quickHelp'), query: 'help' }
])

// Initialize
onMounted(() => {
  // Check speech support
  speechSupported.value = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  // Add welcome message
  addBotMessage(t('chatbot.welcome'))

  // Load preferences
  ttsEnabled.value = localStorage.getItem('chatbot-tts') === 'true'
  highContrast.value = localStorage.getItem('chatbot-contrast') === 'true'

  if (highContrast.value) {
    document.body.classList.add('high-contrast')
  }
})

onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
  document.body.classList.remove('high-contrast')
})

// Methods
function toggleChat() {
  isOpen.value = !isOpen.value
  hasNewMessage.value = false

  if (isOpen.value) {
    nextTick(() => {
      inputField.value?.focus()
    })
  }
}

function closeChat() {
  isOpen.value = false
  if (isListening.value) {
    stopVoiceInput()
  }
}

function addBotMessage(text) {
  messages.value.push({
    type: 'bot',
    text,
    time: new Date()
  })
  scrollToBottom()

  if (ttsEnabled.value && isOpen.value) {
    speakText(text)
  }
}

function addUserMessage(text) {
  messages.value.push({
    type: 'user',
    text,
    time: new Date()
  })
  scrollToBottom()
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text || isTyping.value) return

  addUserMessage(text)
  userInput.value = ''
  isTyping.value = true

  // Process the message
  await processUserMessage(text)

  isTyping.value = false
}

function sendQuickAction(query) {
  userInput.value = query
  sendMessage()
}

async function processUserMessage(text) {
  const lowerText = text.toLowerCase()

  // Simulate typing delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Help intent
  if (/help|مساعدة|كيف/i.test(lowerText)) {
    addBotMessage(t('chatbot.helpResponse'))
    return
  }

  // Greeting
  if (/hello|hi|مرحبا|السلام/i.test(lowerText)) {
    addBotMessage(t('chatbot.greetingResponse'))
    return
  }

  // Recent items
  if (/recent|latest|new|أحدث|جديد/i.test(lowerText)) {
    await searchAndRespond('*', { sort: 'dc.date.issued,DESC' }, t('chatbot.recentResponse'))
    return
  }

  // Theses search
  if (/thesis|theses|رسالة|رسائل/i.test(lowerText)) {
    const searchTerm = extractSearchTerm(text, ['thesis', 'theses', 'رسالة', 'رسائل', 'about', 'عن', 'find', 'search', 'ابحث'])
    await searchAndRespond(
      searchTerm || '*',
      { filters: { itemtype: ['Thesis'] } },
      searchTerm ? t('chatbot.thesesSearchResponse', { term: searchTerm }) : t('chatbot.allThesesResponse')
    )
    return
  }

  // Articles search
  if (/article|articles|مقال|مقالات/i.test(lowerText)) {
    const searchTerm = extractSearchTerm(text, ['article', 'articles', 'مقال', 'مقالات', 'about', 'عن'])
    await searchAndRespond(
      searchTerm || '*',
      { filters: { itemtype: ['Article'] } },
      searchTerm ? t('chatbot.articlesSearchResponse', { term: searchTerm }) : t('chatbot.allArticlesResponse')
    )
    return
  }

  // General search
  if (/find|search|show|get|ابحث|أظهر|أريد/i.test(lowerText)) {
    const searchTerm = extractSearchTerm(text, ['find', 'search', 'show', 'get', 'me', 'for', 'about', 'ابحث', 'عن', 'أظهر', 'أريد'])
    if (searchTerm) {
      await searchAndRespond(searchTerm, {}, t('chatbot.searchResponse', { term: searchTerm }))
      return
    }
  }

  // Filter by year
  const yearMatch = lowerText.match(/(\d{4})/)
  if (yearMatch && /year|filter|سنة|عام/i.test(lowerText)) {
    emit('filter', { year: yearMatch[1] })
    addBotMessage(t('chatbot.filterYearResponse', { year: yearMatch[1] }))
    return
  }

  // Default - try general search
  const cleanedQuery = text.replace(/[؟?]/g, '').trim()
  if (cleanedQuery.length > 2) {
    await searchAndRespond(cleanedQuery, {}, t('chatbot.generalSearchResponse', { term: cleanedQuery }))
  } else {
    addBotMessage(t('chatbot.notUnderstood'))
  }
}

function extractSearchTerm(text, removeWords) {
  let cleaned = text.toLowerCase()
  removeWords.forEach(word => {
    cleaned = cleaned.replace(new RegExp(word, 'gi'), '')
  })
  return cleaned.replace(/[؟?.!,]/g, '').trim()
}

async function searchAndRespond(query, options = {}, responseText) {
  try {
    const response = await searchApi.searchWithFacets(
      `*${query}*`,
      options.filters || {},
      {
        page: 0,
        size: 5,
        sort: options.sort || 'score,DESC'
      },
      false
    )

    const totalResults = response?.page?.totalElements || 0
    const searchObjects = response?._embedded?.searchResult?._embedded?.objects || []

    if (totalResults > 0) {
      const resultText = t('chatbot.foundResults', { count: totalResults })
      addBotMessage(`${responseText}\n\n${resultText}`)

      // Emit search event to parent
      emit('search', { query, results: searchObjects, total: totalResults })

      // Show top results
      if (searchObjects.length > 0) {
        const topItems = searchObjects.slice(0, 3).map(obj => {
          const item = obj._embedded?.indexableObject
          if (!item) return null
          const metadata = item.metadata || {}
          return dspaceUtils.getMetadataValue(metadata, 'dc.title') || 'Untitled'
        }).filter(Boolean)

        if (topItems.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
          addBotMessage(t('chatbot.topResults') + '\n' + topItems.map((t, i) => `${i + 1}. ${t}`).join('\n'))
        }
      }
    } else {
      addBotMessage(t('chatbot.noResults', { term: query }))
    }
  } catch (error) {
    console.error('Search error:', error)
    addBotMessage(t('chatbot.searchError'))
  }
}

// Voice Input
function toggleVoiceInput() {
  if (isListening.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

function startVoiceInput() {
  if (!speechSupported.value) return

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()

  recognition.lang = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onstart = () => {
    isListening.value = true
    announcement.value = t('chatbot.listeningStarted')
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    userInput.value = transcript
    announcement.value = t('chatbot.recognized', { text: transcript })
    sendMessage()
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
    announcement.value = t('chatbot.voiceError')
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}

function stopVoiceInput() {
  if (recognition) {
    recognition.stop()
  }
  isListening.value = false
}

// Text-to-Speech
function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  localStorage.setItem('chatbot-tts', ttsEnabled.value)

  if (ttsEnabled.value) {
    speakText(t('chatbot.ttsEnabled'))
  } else {
    speechSynthesis.cancel()
  }
}

function speakText(text) {
  if (!ttsEnabled.value) return

  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1
  speechSynthesis.speak(utterance)
}

// High Contrast
function toggleHighContrast() {
  highContrast.value = !highContrast.value
  localStorage.setItem('chatbot-contrast', highContrast.value)

  if (highContrast.value) {
    document.body.classList.add('high-contrast')
  } else {
    document.body.classList.remove('high-contrast')
  }
}

// Utilities
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for new messages when closed
watch(messages, () => {
  if (!isOpen.value && messages.value.length > 1) {
    hasNewMessage.value = true
  }
})
</script>

<style lang="scss" scoped>
.ai-chatbot {
  position: fixed;
  z-index: 9999;
}

// Floating Action Button
.chat-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba($primary-color, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba($primary-color, 0.5);
  }

  &:focus-visible {
    outline: 3px solid $accent-color;
    outline-offset: 3px;
  }

  &.is-open {
    background: $text-secondary;
    transform: rotate(90deg);
  }

  &.is-listening {
    animation: pulse 1.5s infinite;
  }
}

.fab-pulse {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: $accent-color;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

// Chat Panel
.chat-panel {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 380px;
  max-height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    width: calc(100% - 32px);
    right: 16px;
    bottom: 90px;
    max-height: 70vh;
  }
}

// Header
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .status {
    font-size: 0.75rem;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #4ade80;
      border-radius: 50%;
    }
  }
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.is-active {
    background: rgba(255, 255, 255, 0.3);
  }

  &.close-btn:hover {
    background: rgba(255, 0, 0, 0.3);
  }
}

// Messages
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
  max-height: 300px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;
  animation: messageIn 0.3s ease-out;

  &.user {
    margin-left: auto;
    flex-direction: row-reverse;

    .message-content {
      background: $primary-color;
      color: white;
      border-radius: 16px 16px 4px 16px;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &.bot {
    .message-content {
      background: #f3f4f6;
      border-radius: 16px 16px 16px 4px;
    }
  }
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 28px;
  height: 28px;
  background: $primary-lighter;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: $primary-color;
}

.message-content {
  padding: 12px 16px;

  p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    white-space: pre-line;
  }
}

.message-time {
  font-size: 0.6875rem;
  color: $text-muted;
  margin-top: 4px;
  display: block;
}

// Typing Indicator
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 16px;

  span {
    width: 8px;
    height: 8px;
    background: $text-muted;
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

// Quick Actions
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 16px;
}

.quick-action {
  padding: 8px 16px;
  background: $primary-lighter;
  border: none;
  border-radius: 20px;
  font-size: 0.8125rem;
  color: $primary-color;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $primary-color;
    color: white;
  }
}

// Input Area
.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.mic-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $primary-lighter;
    color: $primary-color;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.is-listening {
    background: #ef4444;
    color: white;
    animation: pulse 1s infinite;
  }
}

.listening-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid #ef4444;
  border-radius: 50%;
  animation: listeningPulse 1.5s infinite;
}

@keyframes listeningPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: $primary-color;
  }

  &:disabled {
    background: #f9fafb;
  }
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: $primary-color;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $primary-dark;
    transform: scale(1.05);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
}

// Slide Up Animation
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

// Screen Reader Only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// RTL Support
[dir="rtl"] {
  .chat-fab {
    right: auto;
    left: 24px;
  }

  .chat-panel {
    right: auto;
    left: 24px;
  }

  .message.user {
    margin-left: 0;
    margin-right: auto;

    .message-content {
      border-radius: 16px 16px 16px 4px;
    }
  }

  .message.bot .message-content {
    border-radius: 16px 16px 4px 16px;
  }
}

// High Contrast Mode
:global(.high-contrast) {
  .chat-panel {
    background: #000;
    border: 2px solid #fff;
  }

  .chat-header {
    background: #000;
    border-bottom: 2px solid #fff;
  }

  .message.bot .message-content {
    background: #333;
    color: #fff;
  }

  .message.user .message-content {
    background: #005500;
  }

  .chat-input {
    background: #000;
    border-color: #fff;

    input {
      background: #000;
      color: #fff;
      border-color: #fff;
    }
  }

  .quick-action {
    background: #333;
    color: #ff0;
    border: 1px solid #ff0;
  }
}
</style>
